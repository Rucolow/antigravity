/**
 * Ch.5 — 不動産投資 エンジン (Zustand store)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    PROPERTY_TYPES, USEFUL_LIFE, INTEREST_RATES, LOAN_TERMS,
    DOWN_PAYMENT_RATIO, ACQUISITION_COST_RATIO, RUNNING_COSTS,
    DEPRECIATION, CORPORATE_TAX_RATE, NET_WORTH_TARGET,
    SECOND_PROPERTIES,
    getCh5Phase, getCh5Month, getCh5Year,
    calcMonthlyPayment, calcDSCR, calcAnnualNOI, calcCurrentValue,
    calcAnnualDepreciation, calcSaleResult, calcLTV, canGetLoan,
    getPreferredRate,
} from '../data/ch5Constants';
import { pickCh5Event, evaluateCh5Skills } from '../data/ch5Events';

/* ===== 初期状態 ===== */
const INITIAL_STATE = {
    phase: 'ch5-property-select',
    turn: 0,
    money: 125_000_000,

    // ポートフォリオ
    properties: [],
    loans: [],
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    ltvRatio: 0,

    // 月次集計
    monthlyRent: 0,
    monthlyExpenses: 0,
    monthlyLoanPayment: 0,
    monthlyCashFlow: 0,
    monthlyTax: 0,

    // 減価償却
    totalAnnualDepreciation: 0,
    taxSavings: 0,

    // 累計
    totalRentIncome: 0,
    totalExpensesPaid: 0,
    totalLoanPaid: 0,
    totalTaxPaid: 0,
    totalProfit: 0,

    // ゲームクリア
    netWorthTarget: NET_WORTH_TARGET,
    netWorthProgress: 0,
    gameClear: false,

    // セットアップ
    selectedPropertyType: null,
    selectedRateType: null,
    selectedTermYears: null,

    // イベント
    currentEvent: null,
    eventResult: null,
    kenjiStage: 0,
    interestRateHikes: 0,
    _triggeredEvents: [],

    // メタ
    loanCount: 0,
    soldPropertyCount: 0,
    bsViewCount: 0,
    isIncorporated: false,
    skills: [],
    allPreviousSkills: [],

    // 週別履歴
    history: [],
};

/* ===== ヘルパー ===== */
let _nextId = 1;
function uid(prefix = 'p') { return `${prefix}_${_nextId++}`; }

function recalcPortfolio(state) {
    const totalPropertyValue = state.properties.reduce((s, p) => s + p.currentValue, 0);
    const totalLoanBalance = state.loans.reduce((s, l) => s + l.balance, 0);
    const totalAssets = totalPropertyValue + state.money;
    const totalLiabilities = totalLoanBalance;
    const netWorth = totalAssets - totalLiabilities;
    const ltvRatio = totalAssets > 0 ? calcLTV(totalLiabilities, totalAssets) : 0;
    const netWorthProgress = Math.min(100, Math.round((netWorth / NET_WORTH_TARGET) * 100));

    // 月間集計
    const monthlyRent = state.properties.reduce((s, p) => {
        if (p.subleaseActive) {
            return s + Math.round(p.monthlyRentPerUnit * p.totalUnits * 0.85);
        }
        return s + Math.round(p.monthlyRentPerUnit * p.occupiedUnits);
    }, 0);
    const monthlyExpenses = state.properties.reduce((s, p) => {
        const mgmt = Math.round(p.purchasePrice * RUNNING_COSTS.managementFeeRate / 12);
        const repair = Math.round(p.purchasePrice * RUNNING_COSTS.repairReserveRate / 12);
        const tax = Math.round(p.purchasePrice * RUNNING_COSTS.propertyTaxRate / 12);
        const ins = Math.round(p.purchasePrice * RUNNING_COSTS.insuranceRate / 12);
        const propRent = p.subleaseActive
            ? Math.round(p.monthlyRentPerUnit * p.totalUnits * 0.85)
            : Math.round(p.monthlyRentPerUnit * p.occupiedUnits);
        const compFee = Math.round(propRent * RUNNING_COSTS.managementCompanyFeeRate);
        return s + mgmt + repair + tax + ins + compFee;
    }, 0);
    const monthlyLoanPayment = state.loans.reduce((s, l) => s + l.monthlyPayment, 0);

    // 減価償却
    const totalAnnualDepreciation = state.properties.reduce((s, p) => {
        return s + calcAnnualDepreciation(p.buildingValue - p.accDepreciation, p.remainingUsefulLife);
    }, 0);

    // 税金計算（月あたり）
    const annualRent = monthlyRent * 12;
    const annualExpenses = monthlyExpenses * 12;
    const annualInterest = state.loans.reduce((s, l) => s + Math.round(l.balance * l.interestRate), 0);
    const taxableIncome = annualRent - annualExpenses - annualInterest - totalAnnualDepreciation;
    const annualTax = taxableIncome > 0 ? Math.round(taxableIncome * CORPORATE_TAX_RATE) : 0;
    const monthlyTax = Math.round(annualTax / 12);
    const taxSavings = Math.round(totalAnnualDepreciation * CORPORATE_TAX_RATE);

    const monthlyCashFlow = monthlyRent - monthlyExpenses - monthlyLoanPayment - monthlyTax;

    return {
        totalAssets, totalLiabilities, netWorth, ltvRatio, netWorthProgress,
        monthlyRent, monthlyExpenses, monthlyLoanPayment, monthlyCashFlow, monthlyTax,
        totalAnnualDepreciation, taxSavings,
    };
}

function createPropertyFromType(typeKey, customData = {}) {
    const t = PROPERTY_TYPES[typeKey] || customData;
    const structure = t.structure || 'wood';
    const landRatio = DEPRECIATION.landRatio[structure] || 0.33;
    const landValue = Math.round(t.price * landRatio);
    const buildingValue = t.price - landValue;
    const usefulLife = customData.remainingUsefulLife || USEFUL_LIFE[structure] || 22;
    const age = customData.age || 0;
    const occupiedUnits = t.totalUnits; // 満室スタート

    const noi = calcAnnualNOI({ ...t, purchasePrice: t.price, occupancyRate: 0.9 });
    const currentValue = calcCurrentValue(noi, age);

    return {
        id: uid('prop'),
        name: t.name,
        type: typeKey,
        structure,
        purchasePrice: t.price,
        currentValue,
        landValue,
        buildingValue,
        accDepreciation: 0,
        bookValue: t.price,
        totalUnits: t.totalUnits,
        occupiedUnits,
        occupancyRate: 1.0,
        monthlyRentPerUnit: t.monthlyRentPerUnit,
        grossYield: t.grossYield,
        netYield: t.netYield || 0,
        age,
        remainingUsefulLife: usefulLife,
        subleaseActive: false,
        loanId: null,
        dscr: 0,
        ...customData,
    };
}

function createLoan(propertyId, principal, rateType, termYears, loanCount) {
    const baseRate = INTEREST_RATES[rateType].rate;
    const rate = getPreferredRate(baseRate, loanCount);
    const mp = calcMonthlyPayment(principal, rate, termYears);
    return {
        id: uid('loan'),
        propertyId,
        principal,
        balance: principal,
        interestRate: rate,
        rateType,
        termYears,
        monthlyPayment: mp,
        startTurn: 0,
        monthsElapsed: 0,
    };
}

/* ===== Store ===== */
export const useREStore = create(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            /* ----- セットアップ ----- */
            initFromCh4(ch4State) {
                const money = ch4State.money || 125_000_000;
                const prevSkills = [...(ch4State.allPreviousSkills || []), ...(ch4State.skills || [])];
                const isIncorporated = ch4State.isIncorporated || false;
                const ayaFromCh4 = ch4State.ayaJoined || ch4State.ayaFromCh3 || false;
                set({
                    ...INITIAL_STATE,
                    money,
                    allPreviousSkills: prevSkills,
                    isIncorporated,
                    ayaFromCh4,
                    phase: 'ch5-property-select',
                });
            },

            selectProperty(typeKey) {
                set({ selectedPropertyType: typeKey, phase: 'ch5-yield-analysis' });
            },

            confirmYieldAnalysis() {
                set({ phase: 'ch5-loan-setup' });
            },

            applyLoan(rateType, termYears) {
                const s = get();
                const pt = PROPERTY_TYPES[s.selectedPropertyType];
                const price = pt.price;
                const downPayment = Math.round(price * DOWN_PAYMENT_RATIO);
                const acquisitionCost = Math.round(price * ACQUISITION_COST_RATIO);
                const principal = price - downPayment;

                const property = createPropertyFromType(s.selectedPropertyType);
                const loan = createLoan(property.id, principal, rateType, termYears, 0);
                property.loanId = loan.id;

                // DSCR計算
                const noi = calcAnnualNOI({ ...pt, purchasePrice: price, occupancyRate: 0.9 });
                property.dscr = calcDSCR(noi, loan.monthlyPayment * 12);
                property.netYield = Math.round(((noi) / (price + acquisitionCost)) * 1000) / 1000;

                const newMoney = s.money - downPayment - acquisitionCost;
                const newState = {
                    money: newMoney,
                    properties: [property],
                    loans: [loan],
                    selectedRateType: rateType,
                    selectedTermYears: termYears,
                    loanCount: 1,
                    turn: 1,
                };

                // recalc
                const portfolio = recalcPortfolio({ ...s, ...newState });
                set({ ...newState, ...portfolio, phase: 'ch5-opening' });
            },

            startGame() {
                set({ phase: 'ch5-dashboard' });
            },

            /* ----- ゲームプレイ ----- */
            confirmMonth() {
                const s = get();
                const turn = s.turn;

                // 1. テナント更新チェック
                let properties = s.properties.map(p => {
                    if (p.subleaseActive) return p; // サブリースは稼働率100%保証
                    let occ = p.occupiedUnits;
                    const totalU = p.totalUnits;

                    // 空室の自然入居（2-4ターンの空室期間を模擬）
                    if (occ < totalU && Math.random() < 0.35) {
                        occ = Math.min(totalU, occ + 1);
                    }

                    // 途中退去
                    if (occ > 0 && Math.random() < 0.025) {
                        occ = Math.max(0, occ - 1);
                    }

                    // 築年数進行（12ターン=1年）
                    const newAge = p.age + (1 / 12);
                    const newRemaining = Math.max(0, p.remainingUsefulLife - (1 / 12));

                    // 減価償却の累計
                    const annualDep = calcAnnualDepreciation(p.buildingValue - p.accDepreciation, p.remainingUsefulLife);
                    const monthlyDep = Math.round(annualDep / 12);
                    const newAccDep = p.accDepreciation + monthlyDep;

                    // 時価更新
                    const noi = calcAnnualNOI({ ...p, purchasePrice: p.purchasePrice, occupancyRate: occ / totalU });
                    const newValue = calcCurrentValue(noi, newAge);

                    // DSCR更新
                    const loan = s.loans.find(l => l.id === p.loanId);
                    const dscr = loan ? calcDSCR(noi, loan.monthlyPayment * 12) : 99;

                    return {
                        ...p,
                        occupiedUnits: occ,
                        occupancyRate: Math.round((occ / totalU) * 100) / 100,
                        age: Math.round(newAge * 100) / 100,
                        remainingUsefulLife: Math.round(newRemaining * 100) / 100,
                        accDepreciation: newAccDep,
                        bookValue: p.purchasePrice - newAccDep,
                        currentValue: newValue,
                        dscr,
                    };
                });

                // 2. ローン残高更新
                let loans = s.loans.map(l => {
                    const interest = Math.round(l.balance * l.interestRate / 12);
                    const principalPart = l.monthlyPayment - interest;
                    const newBalance = Math.max(0, l.balance - principalPart);
                    return { ...l, balance: newBalance, monthsElapsed: l.monthsElapsed + 1 };
                });

                // 3. 集計
                const tempState = { ...s, properties, loans };
                const portfolio = recalcPortfolio(tempState);

                // 4. CF計算
                const money = s.money + portfolio.monthlyCashFlow;

                // 5. 累計更新
                const totalRentIncome = s.totalRentIncome + portfolio.monthlyRent;
                const totalExpensesPaid = s.totalExpensesPaid + portfolio.monthlyExpenses;
                const totalLoanPaid = s.totalLoanPaid + portfolio.monthlyLoanPayment;
                const totalTaxPaid = s.totalTaxPaid + portfolio.monthlyTax;
                const totalProfit = totalRentIncome - totalExpensesPaid - totalLoanPaid - totalTaxPaid;

                // 6. 履歴
                const historyEntry = {
                    turn,
                    monthlyRent: portfolio.monthlyRent,
                    monthlyCashFlow: portfolio.monthlyCashFlow,
                    netWorth: portfolio.netWorth + money - s.money,
                    dscr: properties.length > 0 ? Math.min(...properties.map(p => p.dscr ?? 99)) : 99,
                };

                // ゲームクリア判定
                const totalPropertyValue = properties.reduce((sum, p) => sum + p.currentValue, 0);
                const totalLoanBal = loans.reduce((sum, l) => sum + l.balance, 0);
                const realNetWorth = totalPropertyValue + money - totalLoanBal;
                const gameClear = realNetWorth >= NET_WORTH_TARGET;
                const netWorthProgress = Math.min(100, Math.round((realNetWorth / NET_WORTH_TARGET) * 100));

                set({
                    properties,
                    loans,
                    money,
                    totalRentIncome,
                    totalExpensesPaid,
                    totalLoanPaid,
                    totalTaxPaid,
                    totalProfit,
                    ...portfolio,
                    dscr: properties.length > 0 ? Math.min(...properties.map(p => p.dscr ?? 99)) : 0,
                    netWorth: realNetWorth,
                    netWorthProgress,
                    gameClear,
                    history: [...s.history, historyEntry],
                    phase: 'ch5-results',
                });
            },

            nextTurn() {
                const s = get();
                const newTurn = s.turn + 1;

                if (s.gameClear) {
                    const skills = evaluateCh5Skills(s);
                    set({ turn: newTurn, skills, phase: 'ch5-game-clear' });
                    return;
                }

                // 倒産チェック
                if (s.money < 0 && s.monthlyCashFlow < 0) {
                    const skills = evaluateCh5Skills(s);
                    set({ turn: newTurn, skills, phase: 'ch5-final-report', exitType: 'bankruptcy' });
                    return;
                }

                // イベント抽選
                const event = pickCh5Event({ ...s, turn: newTurn });
                if (event) {
                    set({
                        turn: newTurn,
                        currentEvent: event,
                        eventResult: null,
                        phase: 'ch5-event',
                    });
                    return;
                }

                set({ turn: newTurn, phase: 'ch5-dashboard' });
            },

            /* ----- イベント ----- */
            dismissEvent(choiceIdx) {
                const s = get();
                const ev = s.currentEvent;
                if (!ev) { set({ phase: 'ch5-dashboard' }); return; }

                let resultText = null;
                let updates = {};
                const triggered = [...s._triggeredEvents, ev.id];

                // 基本effect（イベント全体に適用、選択肢の有無に関わらず）
                if (ev.effect) {
                    if (ev.effect.kenjiStage !== undefined) updates.kenjiStage = ev.effect.kenjiStage;
                    if (ev.effect.showBS) updates.bsViewCount = (s.bsViewCount || 0) + 1;
                    if (ev.effect.money) updates.money = (s.money || 0) + ev.effect.money;
                }

                // 選択肢のeffect
                if (ev.choices && ev.choices.length > 0 && choiceIdx !== undefined && choiceIdx !== null) {
                    const choice = ev.choices[choiceIdx];
                    if (choice && choice.effect) {
                        const eff = choice.effect;
                        if (eff.money) updates.money = (updates.money ?? s.money) + eff.money;
                        if (eff.resultText) resultText = eff.resultText;

                        // 金利上昇
                        if (eff.rateHike) {
                            const newHikes = s.interestRateHikes + 1;
                            const newLoans = s.loans.map(l => {
                                if (l.rateType !== 'variable') return l;
                                const newRate = l.interestRate + eff.rateHike;
                                const newPayment = calcMonthlyPayment(l.balance, newRate, l.termYears - Math.floor(l.monthsElapsed / 12));
                                return { ...l, interestRate: newRate, monthlyPayment: newPayment };
                            });
                            updates.loans = newLoans;
                            updates.interestRateHikes = newHikes;
                        }

                        // 固定金利借り換え
                        if (eff.refinanceToFixed) {
                            const newLoans = s.loans.map(l => {
                                if (l.rateType !== 'variable') return l;
                                const fixedRate = INTEREST_RATES.fixed.rate;
                                const remainYears = l.termYears - Math.floor(l.monthsElapsed / 12);
                                const newPayment = calcMonthlyPayment(l.balance, fixedRate, remainYears);
                                return { ...l, rateType: 'fixed', interestRate: fixedRate, monthlyPayment: newPayment };
                            });
                            updates.loans = newLoans;
                        }

                        // 繰上返済
                        if (eff.prepayment) {
                            const newLoans = s.loans.map(l => {
                                if (l.rateType !== 'variable') return l;
                                const newBalance = Math.max(0, l.balance - eff.prepayment);
                                const remainYears = l.termYears - Math.floor(l.monthsElapsed / 12);
                                const newPayment = calcMonthlyPayment(newBalance, l.interestRate, remainYears);
                                return { ...l, balance: newBalance, monthlyPayment: newPayment };
                            });
                            updates.loans = newLoans;
                        }

                        // サブリース
                        if (eff.sublease) {
                            const newProps = (updates.properties || s.properties).map((p, i) => i === 0 ? { ...p, subleaseActive: true, occupiedUnits: p.totalUnits, occupancyRate: 1.0 } : p);
                            updates.properties = newProps;
                        }

                        // 空室影響
                        if (eff.occupancyHit) {
                            const newProps = (updates.properties || s.properties).map((p, i) => {
                                if (i !== 0) return p;
                                const occ = Math.max(0, p.occupiedUnits + eff.occupancyHit);
                                return { ...p, occupiedUnits: occ, occupancyRate: occ / p.totalUnits };
                            });
                            updates.properties = newProps;
                        }

                        // 修繕ブースト
                        if (eff.repairBoost) {
                            const newProps = (updates.properties || s.properties).map((p, i) => {
                                if (i !== 0) return p;
                                const boosted = Math.round(p.currentValue * 1.05);
                                return { ...p, currentValue: boosted };
                            });
                            updates.properties = newProps;
                        }

                        // 家賃単価アップ（YouTubeテナント SOHO化、遺跡ブランディング等）
                        if (eff.rentBoost) {
                            const newProps = (updates.properties || s.properties).map((p, i) => {
                                if (i !== 0) return p;
                                return { ...p, monthlyRentPerUnit: p.monthlyRentPerUnit + eff.rentBoost };
                            });
                            updates.properties = newProps;
                        }

                        // 空室回復（プロモーション効果等）
                        if (eff.occupancyBoost) {
                            const newProps = (updates.properties || s.properties).map((p, i) => {
                                if (i !== 0) return p;
                                const occ = Math.min(p.totalUnits, p.occupiedUnits + 1);
                                return { ...p, occupiedUnits: occ, occupancyRate: occ / p.totalUnits };
                            });
                            updates.properties = newProps;
                        }

                        // 税優遇（固定資産税減免 → 時価5%UP相当で反映）
                        if (eff.taxBreak) {
                            const newProps = (updates.properties || s.properties).map((p, i) => {
                                if (i !== 0) return p;
                                const boosted = Math.round(p.currentValue * 1.05);
                                return { ...p, currentValue: boosted };
                            });
                            updates.properties = newProps;
                        }
                    }
                }

                if (resultText) {
                    set({ ...updates, _triggeredEvents: triggered, eventResult: resultText });
                } else {
                    set({ ...updates, _triggeredEvents: triggered, currentEvent: null, eventResult: null, phase: 'ch5-dashboard' });
                }
            },

            clearEventResult() {
                set({ currentEvent: null, eventResult: null, phase: 'ch5-dashboard' });
            },

            /* ----- 物件購入 (Phase B+) ----- */
            goToPropertyBuy() {
                set({ phase: 'ch5-property-buy' });
            },

            buyProperty(propKey) {
                const s = get();
                const candidates = SECOND_PROPERTIES;
                const t = candidates[propKey];
                if (!t) return;

                const price = t.price;
                const downPayment = Math.round(price * DOWN_PAYMENT_RATIO);
                const acquisitionCost = Math.round(price * ACQUISITION_COST_RATIO);
                if (s.money < downPayment + acquisitionCost) return; // 資金不足

                const property = createPropertyFromType(propKey, {
                    ...t,
                    price: t.price,
                    age: t.age || 0,
                    remainingUsefulLife: t.remainingUsefulLife || USEFUL_LIFE[t.structure] || 22,
                });

                const rateType = s.selectedRateType || 'variable';
                const termYears = s.selectedTermYears || 25;
                const principal = price - downPayment;
                const loan = createLoan(property.id, principal, rateType, termYears, s.loanCount);
                property.loanId = loan.id;
                loan.startTurn = s.turn;

                // DSCR
                const noi = calcAnnualNOI({ ...t, purchasePrice: price, occupancyRate: 0.9 });
                property.dscr = calcDSCR(noi, loan.monthlyPayment * 12);

                const newMoney = s.money - downPayment - acquisitionCost;
                const newProperties = [...s.properties, property];
                const newLoans = [...s.loans, loan];
                const newLoanCount = s.loanCount + 1;

                const tempState = { ...s, money: newMoney, properties: newProperties, loans: newLoans };
                const portfolio = recalcPortfolio(tempState);

                set({
                    money: newMoney,
                    properties: newProperties,
                    loans: newLoans,
                    loanCount: newLoanCount,
                    ...portfolio,
                    phase: 'ch5-dashboard',
                });
            },

            /* ----- 物件売却 ----- */
            sellProperty(propertyId) {
                const s = get();
                const propIdx = s.properties.findIndex(p => p.id === propertyId);
                if (propIdx === -1) return;

                const prop = s.properties[propIdx];
                const loan = s.loans.find(l => l.id === prop.loanId);
                const result = calcSaleResult(prop, loan);

                const newProps = s.properties.filter(p => p.id !== propertyId);
                const newLoans = s.loans.filter(l => l.id !== prop.loanId);
                const newMoney = s.money + result.netProceeds;

                const tempState = { ...s, money: newMoney, properties: newProps, loans: newLoans };
                const portfolio = recalcPortfolio(tempState);

                set({
                    money: newMoney,
                    properties: newProps,
                    loans: newLoans,
                    soldPropertyCount: s.soldPropertyCount + 1,
                    ...portfolio,
                    phase: 'ch5-dashboard',
                });

                return result;
            },

            /* ----- リノベーション ----- */
            renovateProperty(propertyId) {
                const s = get();
                const cost = 800_000;
                if (s.money < cost) return;

                const newProps = s.properties.map(p => {
                    if (p.id !== propertyId) return p;
                    const newRent = Math.round(p.monthlyRentPerUnit * 1.10);
                    return { ...p, monthlyRentPerUnit: newRent };
                });

                set({ money: s.money - cost, properties: newProps });
            },

            /* ----- B/S表示 ----- */
            viewBS() {
                set(s => ({ bsViewCount: s.bsViewCount + 1, phase: 'ch5-bs-display' }));
            },

            backToDashboard() {
                set({ phase: 'ch5-dashboard' });
            },

            /* ----- ゲームクリア → 最終レポート ----- */
            goToFinalReport() {
                set({ phase: 'ch5-final-report' });
            },

            /* ----- セーブ ----- */
            createSavePoint() {
                const s = get();
                return {
                    turn: s.turn,
                    money: s.money,
                    properties: s.properties,
                    loans: s.loans,
                    netWorth: s.netWorth,
                    skills: s.skills,
                    _triggeredEvents: s._triggeredEvents,
                    kenjiStage: s.kenjiStage,
                    interestRateHikes: s.interestRateHikes,
                };
            },
        }),
        { name: 'antigravity-ch5' }
    )
);
