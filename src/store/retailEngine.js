import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    INDUSTRIES, LOCATIONS, INTERIORS, SUPPLIERS, FIXED_COSTS,
    STAFF_COSTS, WEATHER_CHANCE, WEATHER_MULT, WEEKDAY_MULT,
    REPUTATION, CREDIT_TERMS, EC, CH2_EXIT_BASE_MULTIPLE,
    getCh2Phase, getSeason, SEASON_MULT, INVENTORY_STATUS,
} from '../data/ch2Constants.js';
import { getCh2EventForTurn, createCh2TaxEvent } from '../data/ch2Events.js';

function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function pickWeather() {
    const r = Math.random();
    let cum = 0;
    for (const [type, chance] of Object.entries(WEATHER_CHANCE)) {
        cum += chance;
        if (r < cum) return type;
    }
    return 'sunny';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// SKU生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━
function generateInitialSKUs(industryKey) {
    const ind = INDUSTRIES[industryKey];
    const skus = [];
    const baseNames = {
        coffee: ['ブラジルサントス', 'エチオピアモカ', 'コロンビア', 'グアテマラ', 'マンデリン', 'ケニアAA'],
        lifestyle: ['アロマキャンドル', 'レザートート', 'オーガニックタオル', 'ステンレスタンブラー', '手帳カバー', 'ルームフレグランス'],
        food: ['オリーブオイル', '岩塩セット', 'バルサミコ酢', '有機はちみつ', 'ドライフルーツ', 'スパイスセット'],
    };
    const names = baseNames[industryKey] || baseNames.coffee;
    for (let i = 0; i < 6; i++) {
        const cost = Math.floor(ind.avgUnit * ind.costRatio * (0.8 + Math.random() * 0.4));
        const price = Math.floor(cost / ind.costRatio);
        skus.push({
            id: `sku_${i}`,
            name: names[i],
            cost,
            price,
            category: i < 4 ? 'staple' : 'seasonal',
            stock: 0,
            totalSold: 0,
            turnsInStock: 0,
            status: 'normal',
            degradation: 0,
        });
    }
    return skus;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Zustand Store
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const useRetailStore = create(
    persist(
        (set, get) => ({
            // ── 基本 ──
            chapter: 2,
            turn: 0,
            phase: 'idle',
            money: 0,
            netWorth: 0,

            // ── Ch.1引き継ぎ ──
            ch1Transfer: null,
            exitType: null,
            ch1Skills: [],
            kenjiStage: 0,
            ayaFromCh1: false,
            ipoDividend: 0,
            hiringSpeedBonus: 0,

            // ── セットアップ ──
            shopName: '',
            industryKey: null,
            locationKey: null,
            interiorGrade: null,
            interiorBonus: 0,
            rent: 0,
            floorSpace: 0,

            // ── 在庫 ──
            skus: [],
            prevInventoryValue: 0,

            // ── 売上 ──
            weeklyCustomers: 0,
            weeklySales: 0,
            weeklyProfit: 0,
            weekResult: null,

            // ── 評判 ──
            reputation: REPUTATION.initial,

            // ── スタッフ ──
            staff: [],
            totalLaborCost: 0,

            // ── 累計 ──
            totalSales: 0,
            totalProfit: 0,
            profitHistory: [],
            consecutiveBlackTurns: 0,
            firstBlackTurn: null,

            // ── フラグ ──
            blueFilingEnabled: true,
            ecEnabled: false,
            ecMonthlyCost: 0,
            snsBoostTurnsLeft: 0,
            giftWrapping: false,
            supplierCostMult: 1.0,
            supplierBankrupt: false,
            costHikePct: 0,
            priceHikePct: 0,
            seasonalStock: 0,
            deadStockRemaining: 0,
            rivalStock: 0,
            taxKnowledge: false,
            ayaJoined: false,
            kenjiGrowth: null,
            kenjiCh2Stage: 0,

            // ── イベント ──
            currentEvent: null,
            eventResult: null,
            _triggeredEvents: [],

            // ── 判断記録 ──
            decisions: [],
            milestonesHit: [],

            // ── 企業価値 ──
            enterpriseValue: 0,
            multiple: CH2_EXIT_BASE_MULTIPLE,
            exitAvailable: false,
            exitAmount: 0,

            // ── 税金 ──
            taxRecords: [],

            // ── CF計算書 ──
            cfStatement: null,
            cfUnlocked: false,

            // ━━━━━━━━━━━━━━━━━━━━━━━━━
            // ACTIONS
            // ━━━━━━━━━━━━━━━━━━━━━━━━━

            // Ch.1 → Ch.2 遷移
            initFromCh1: (ch1State) => set({
                ch1Transfer: ch1State,
                money: ch1State.money,
                ch1Skills: ch1State.ch1Skills || [],
                allPreviousSkills: [
                    ...(ch1State.ch0Skills || []),
                    ...(ch1State.ch1Skills || []),
                ],
                exitType: ch1State.exitType || 'mna',
                kenjiStage: ch1State.kenjiStage || 0,
                ayaFromCh1: ch1State.staff?.some(s => s.name === 'アヤ') && ch1State.exitType !== 'succession',
                ipoDividend: ch1State.ipoDividend || 0,
                hiringSpeedBonus: ch1State.hiringSpeedBonus || 0,
                phase: 'ch2-setup-industry',
                turn: 1,
            }),

            // 店名設定
            setShopName: (name) => set({ shopName: name }),

            // Step 1: 業種選択
            selectIndustry: (key) => {
                const ind = INDUSTRIES[key];
                if (!ind) return;
                set(s => ({
                    industryKey: key,
                    phase: 'ch2-setup-location',
                    turn: 2,
                    decisions: [...s.decisions, { turn: 1, type: 'industry', label: `業種: ${ind.name}` }],
                }));
            },

            // Step 2: 立地選択
            selectLocation: (key) => {
                const loc = LOCATIONS[key];
                if (!loc) return;
                set(s => ({
                    locationKey: key,
                    rent: loc.rent,
                    floorSpace: loc.floorSpace,
                    phase: 'ch2-setup-interior',
                    turn: 3,
                    decisions: [...s.decisions, { turn: 2, type: 'location', label: `立地: ${loc.name}` }],
                }));
            },

            // Step 3: 内装選択
            selectInterior: (key) => {
                const interior = INTERIORS[key];
                if (!interior) return;
                set(s => ({
                    interiorGrade: key,
                    interiorBonus: interior.purchaseRateBonus,
                    money: s.money - interior.cost,
                    phase: 'ch2-setup-stock',
                    turn: 4,
                    decisions: [...s.decisions, { turn: 3, type: 'interior', label: `内装: ${interior.name}` }],
                }));
            },

            // Step 4: 初期仕入
            purchaseInitialStock: (quantities) => {
                // quantities = { sku_0: 50, sku_1: 50, ... } or null for default
                const state = get();
                const skus = generateInitialSKUs(state.industryKey);
                let totalCost = 0;

                for (const sku of skus) {
                    const qty = quantities?.[sku.id] ?? 50;
                    sku.stock = qty;
                    totalCost += sku.cost * qty;
                }

                // POS + 什器費用
                const setupCost = 800000;

                set(s => ({
                    skus,
                    money: s.money - totalCost - setupCost,
                    phase: 'ch2-open',
                    turn: 5,
                    decisions: [...s.decisions, { turn: 4, type: 'purchase', label: `初期仕入: ¥${totalCost.toLocaleString()}` }],
                }));
            },

            // 開店 → ダッシュボードへ
            startOperating: () => {
                const state = get();
                const updates = { phase: 'ch2-dashboard' };

                // アヤ合流チェック (Turn 1)
                if (state.ayaFromCh1 && !state.ayaJoined) {
                    const event = getCh2EventForTurn(1, state);
                    if (event) {
                        updates.currentEvent = event;
                        updates.phase = 'ch2-event';
                        if (event.id) updates._triggeredEvents = [...state._triggeredEvents, event.id];
                    }
                }

                set(updates);
            },

            // 経営判断を確定 → 週シミュレーション
            confirmWeek: (actions) => {
                const state = get();
                set({ phase: 'ch2-simulating' });

                // スタッフ雇用/解雇
                let staff = [...state.staff];
                let laborCost = state.totalLaborCost;
                if (actions?.hire) {
                    const type = actions.hire;
                    const staffInfo = STAFF_COSTS[type];
                    staff.push({
                        id: `staff_${Date.now()}`,
                        name: `スタッフ${staff.length + 1}`,
                        type,
                        monthlyCost: staffInfo.monthly,
                        turnHired: state.turn,
                    });
                    laborCost = staff.reduce((sum, s) => sum + s.monthlyCost, 0);
                }

                set({ staff, totalLaborCost: laborCost, _weeklyFocus: actions?._focus || {} });

                // シミュレーション実行 (非同期)
                setTimeout(() => {
                    const s = get();
                    const result = simulateRetailWeek(s);
                    const newMoney = s.money + result.netProfit;
                    const newTotalSales = s.totalSales + result.sales;
                    const newTotalProfit = s.totalProfit + result.netProfit;
                    const profitEntry = {
                        turn: s.turn, sales: result.sales, profit: result.netProfit,
                        fixedCosts: result.fixedCosts, customers: result.customers,
                    };
                    const isBlack = result.netProfit > 0;
                    const consecutive = isBlack ? s.consecutiveBlackTurns + 1 : 0;

                    // 損益分岐計算
                    const weeklyFixed = calculateWeeklyFixed(s);
                    const costRatio = result.sales > 0 ? result.cogs / result.sales : 0.45;
                    const grossMarginRate = 1 - costRatio;
                    const breakEven = grossMarginRate > 0 ? Math.ceil(weeklyFixed / grossMarginRate) : 999999;

                    // 評判更新
                    const loc = LOCATIONS[s.locationKey];
                    const ind = INDUSTRIES[s.industryKey];
                    const salesTarget = loc.baseCustomers * ind.avgUnit * 6 * 0.3;
                    let newRep = s.reputation;
                    if (result.sales >= salesTarget) {
                        newRep += REPUTATION.growthPerTurn;
                    } else {
                        newRep += REPUTATION.decayPerTurn;
                    }
                    newRep = Math.max(1.5, Math.min(REPUTATION.max, newRep));

                    // コスト減衰
                    let supplierCostMult = s.supplierCostMult;
                    let costHikePct = s.costHikePct;
                    if (supplierCostMult > 1.0 && s.turn % 5 === 0) {
                        supplierCostMult = Math.max(1.0, supplierCostMult - 0.03);
                    }
                    if (costHikePct > 0 && s.turn % 4 === 0) {
                        costHikePct = Math.max(0, costHikePct - 0.05);
                    }

                    // SNSブースト減衰
                    const snsBoostTurnsLeft = Math.max(0, s.snsBoostTurnsLeft - 1);

                    // マイルストーン検知
                    const milestones = [...s.milestonesHit];
                    if (s.firstBlackTurn === null && isBlack) {
                        milestones.push({ type: 'first_black', turn: s.turn, value: result.netProfit });
                    }

                    // 企業価値
                    const recentProfits = [...s.profitHistory.slice(-11), profitEntry];
                    const avgProfit = recentProfits.length > 0
                        ? recentProfits.reduce((sum, p) => sum + p.profit, 0) / recentProfits.length
                        : 0;
                    const annualProfit = avgProfit * 52;
                    const mult = calculateCh2Multiple(s);
                    const ev = Math.max(0, Math.floor(annualProfit * mult));

                    // 在庫ステータス更新
                    updateInventoryStatus(s.skus, s.turn);

                    // 在庫劣化
                    if (ind) {
                        for (const sku of s.skus) {
                            if (ind.shelfLife && sku.turnsInStock > ind.shelfLife) {
                                sku.degradation = Math.min(1.0, sku.degradation + 0.1);
                            }
                            if (ind.trendDecay > 0) {
                                sku.degradation = Math.min(1.0, sku.degradation + ind.trendDecay);
                            }
                        }
                    }

                    // CF計算書（Turn 12以降）
                    let cfStatement = s.cfStatement;
                    let cfUnlocked = s.cfUnlocked;
                    if (s.turn >= 12) {
                        cfUnlocked = true;
                        cfStatement = generateCFStatement({ ...s, profitHistory: [...s.profitHistory, profitEntry] });
                    }

                    // 在庫評価額
                    const inventoryValue = s.skus.reduce((sum, sku) => sum + sku.stock * sku.cost, 0);

                    set({
                        weeklyCustomers: result.customers,
                        weeklySales: result.sales,
                        weeklyProfit: result.netProfit,
                        weekResult: result,
                        money: newMoney,
                        totalSales: newTotalSales,
                        totalProfit: newTotalProfit,
                        profitHistory: [...s.profitHistory, profitEntry],
                        consecutiveBlackTurns: consecutive,
                        firstBlackTurn: s.firstBlackTurn ?? (isBlack ? s.turn : null),
                        breakEvenSales: breakEven,
                        reputation: Math.round(newRep * 100) / 100,
                        enterpriseValue: ev,
                        multiple: mult,
                        exitAvailable: s.turn >= 45,
                        milestonesHit: milestones,
                        netWorth: newMoney + ev * 0.3 + inventoryValue,
                        prevInventoryValue: inventoryValue,
                        supplierCostMult,
                        costHikePct,
                        snsBoostTurnsLeft,
                        cfStatement,
                        cfUnlocked,
                        _goalTurnoverWeeks: (() => {
                            const turnover = result.sales > 0 && inventoryValue > 0 ? result.sales / inventoryValue : 0;
                            const prev = s._goalTurnoverWeeks || 0;
                            return turnover >= 2.0 ? prev + 1 : Math.max(0, prev - 1);
                        })(),
                        _goalAchieved: s._goalAchieved || (() => {
                            const turnover = result.sales > 0 && inventoryValue > 0 ? result.sales / inventoryValue : 0;
                            return turnover >= 2.0 && ((s._goalTurnoverWeeks || 0) + 1) >= 4;
                        })(),
                        phase: 'ch2-results',
                    });
                }, 100);
            },

            // 結果確認後 → 次ターンへ
            nextTurn: () => {
                const state = get();
                const nextTurn = state.turn + 1;

                const updates = {
                    turn: nextTurn,
                    currentEvent: null,
                    eventResult: null,
                };

                // イベント判定
                const event = getCh2EventForTurn(nextTurn, { ...state, turn: nextTurn });
                if (event) {
                    updates.currentEvent = event;
                    updates.phase = 'ch2-event';
                    if (event._kenjiCh2Stage) updates.kenjiCh2Stage = event._kenjiCh2Stage;
                    if (event.id) updates._triggeredEvents = [...(state._triggeredEvents || []), event.id];
                } else {
                    updates.phase = 'ch2-dashboard';
                }

                set(updates);
            },

            // イベント表示・処理
            setEvent: (event) => set({ currentEvent: event, phase: 'ch2-event' }),
            dismissEvent: (choiceIdx) => {
                const state = get();
                const event = state.currentEvent;
                if (!event) return;

                const updates = {};

                let effect = null;
                let response = null;

                if (event.choices && choiceIdx !== undefined) {
                    const choice = event.choices[choiceIdx];
                    effect = choice?.effect || {};
                    response = choice?.response || null;
                    updates.eventResult = response;
                    updates.decisions = [...state.decisions, {
                        turn: state.turn, type: 'event', label: `${event.id}: ${choice.label}`,
                    }];
                    updates.phase = 'ch2-event';
                } else {
                    effect = event.effect || {};
                    updates.currentEvent = null;
                    updates.phase = 'ch2-dashboard';
                }

                // Apply effects
                if (effect) {
                    if (effect.money) updates.money = (updates.money ?? state.money) + effect.money;
                    if (effect.reputation) updates.reputation = Math.max(1, Math.min(5, state.reputation + effect.reputation));

                    // スタッフ雇用
                    if (effect.hire) {
                        const staffInfo = STAFF_COSTS[effect.hire];
                        const newStaff = [...state.staff, {
                            id: `staff_${Date.now()}`,
                            name: effect.ayaJoined || state.staff.length === 0 ? 'アヤ' : `スタッフ${state.staff.length + 1}`,
                            type: effect.hire,
                            monthlyCost: staffInfo.monthly,
                            turnHired: state.turn,
                        }];
                        updates.staff = newStaff;
                        updates.totalLaborCost = newStaff.reduce((sum, s) => sum + s.monthlyCost, 0);
                    }

                    // Ch.2固有フラグ
                    if (effect.ayaJoined) updates.ayaJoined = true;
                    if (effect.ecEnabled) { updates.ecEnabled = true; updates.ecMonthlyCost = effect.ecMonthlyCost || EC.monthlyFee; }
                    if (effect.snsBoost) updates.snsBoostTurnsLeft = effect.snsBoostTurns || 3;
                    if (effect.giftWrapping) updates.giftWrapping = true;
                    if (effect.supplierCostMult) updates.supplierCostMult = effect.supplierCostMult;
                    if (effect.supplierBankrupt) updates.supplierBankrupt = true;
                    if (effect.costHikePct) updates.costHikePct = effect.costHikePct;
                    if (effect.priceHikePct) updates.priceHikePct = effect.priceHikePct;
                    if (effect.seasonalStock) updates.seasonalStock = (state.seasonalStock || 0) + effect.seasonalStock;
                    if (effect.deadStockCleared) updates.deadStockRemaining = 0;
                    if (effect.deadStockRemaining) updates.deadStockRemaining = effect.deadStockRemaining;
                    if (effect.rivalStock) updates.rivalStock = effect.rivalStock;
                    if (effect.taxKnowledge) updates.taxKnowledge = true;
                    if (effect.kenjiGrowth) updates.kenjiGrowth = effect.kenjiGrowth;
                }

                // Track triggered
                if (event.id && !state._triggeredEvents?.includes(event.id)) {
                    updates._triggeredEvents = [...(state._triggeredEvents || []), event.id];
                }

                set(updates);
            },

            // イベント結果確認後 → ダッシュボードへ
            dismissEventResult: () => set({ currentEvent: null, eventResult: null, phase: 'ch2-dashboard' }),

            // EXIT選択
            selectExit: (type) => {
                const state = get();
                const ev = state.enterpriseValue;
                let exitAmount = 0;
                const extras = {};

                switch (type) {
                    case 'mna':
                        exitAmount = Math.floor(ev * 0.70);
                        break;
                    case 'ipo':
                        exitAmount = Math.floor(ev * 0.40);
                        extras.ipoDividend = Math.floor(ev * 0.02);
                        break;
                    case 'succession':
                        exitAmount = Math.floor(ev * 0.30);
                        break;
                    case 'liquidation':
                        exitAmount = Math.floor(state.money * 0.40);
                        break;
                }

                // Ch.2スキルの判定
                const ch2Skills = [];
                if (state.profitHistory.length >= 4) ch2Skills.push('inventory_thinking');
                if (state.cfUnlocked) ch2Skills.push('cf_analysis');
                if (state.ecEnabled) ch2Skills.push('ec_management');
                if (state.staff.length > 0) ch2Skills.push('retail_staffing');
                if (state.taxRecords.length > 0 || state.taxKnowledge) ch2Skills.push('retail_tax');
                ch2Skills.push('retail_experience');

                set(s => ({
                    money: s.money + exitAmount,
                    phase: 'ch2-report',
                    decisions: [...s.decisions, { turn: s.turn, type: 'exit', label: `EXIT: ${type} (¥${exitAmount.toLocaleString()})` }],
                    exitType: type,
                    exitAmount,
                    ch2Skills,
                    ...extras,
                }));
            },

            // 在庫補充
            restockSKU: (skuId, qty) => {
                const state = get();
                const sku = state.skus.find(s => s.id === skuId);
                if (!sku) return;

                const unitCost = sku.cost * (state.supplierCostMult || 1.0);
                const totalCost = Math.floor(unitCost * qty);
                if (state.money < totalCost) return;

                const newSkus = state.skus.map(s =>
                    s.id === skuId ? { ...s, stock: s.stock + qty } : s
                );
                set({
                    skus: newSkus,
                    money: state.money - totalCost,
                });
            },

            // スタッフ雇用
            hireStaff: ({ type, monthlyCost }) => {
                const state = get();
                const staffInfo = STAFF_COSTS[type];
                const newStaff = [...state.staff, {
                    id: `staff_${Date.now()}`,
                    name: `スタッフ${state.staff.length + 1}`,
                    type,
                    monthlyCost: staffInfo.monthly,
                    turnHired: state.turn,
                }];
                set({
                    staff: newStaff,
                    totalLaborCost: newStaff.reduce((sum, s) => sum + s.monthlyCost, 0),
                });
            },

            // スタッフ解雇
            fireStaff: (staffId) => {
                const state = get();
                const newStaff = state.staff.filter(s => s.id !== staffId);
                set({
                    staff: newStaff,
                    totalLaborCost: newStaff.reduce((sum, s) => sum + s.monthlyCost, 0),
                });
            },

            // フェーズ直接設定
            setPhase: (phase) => set({ phase }),

            // リセット
            resetCh2: () => set({
                chapter: 2, turn: 0, phase: 'idle', money: 0, netWorth: 0,
                ch1Transfer: null, ch1Skills: [], kenjiStage: 0,
                industryKey: null, locationKey: null, skus: [],
                staff: [], totalLaborCost: 0, totalSales: 0, totalProfit: 0,
                profitHistory: [], decisions: [], milestonesHit: [], _triggeredEvents: [],
                enterpriseValue: 0, ecEnabled: false, reputation: REPUTATION.initial,
            }),
        }),
        { name: 'antigravity-ch2' }
    )
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// シミュレーション関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━

function calculateWeeklyFixed(state) {
    const rent = state.rent / 4;
    const utilities = FIXED_COSTS.utilities_base / 4;
    const insurance = FIXED_COSTS.insurance / 4;
    const accounting = state.blueFilingEnabled ? FIXED_COSTS.accounting / 4 : 0;
    const posLease = FIXED_COSTS.pos_lease / 4;
    const comm = FIXED_COSTS.communication / 4;
    const labor = state.totalLaborCost / 4;
    const ecFee = state.ecEnabled ? (state.ecMonthlyCost || EC.monthlyFee) / 4 : 0;
    return rent + utilities + insurance + accounting + posLease + comm + labor + ecFee;
}

function simulateRetailWeek(state) {
    const loc = LOCATIONS[state.locationKey];
    const ind = INDUSTRIES[state.industryKey];
    if (!loc || !ind) return { customers: 0, sales: 0, cogs: 0, grossProfit: 0, fixedCosts: 0, netProfit: 0, weather: 'sunny' };

    const openDays = 6;
    const weekDays = ['weekday', 'weekday', 'weekday', 'weekday', 'weekday', 'saturday', 'sunday'];

    const weather = pickWeather();
    const weatherMult = WEATHER_MULT[weather];
    const season = getSeason(state.turn);
    const seasonMult = SEASON_MULT[season];
    const repMult = REPUTATION.getCustomerMult(state.reputation);

    let marketingMult = 1.0;
    if (state.snsBoostTurnsLeft > 0) marketingMult *= 1.25;
    if (state.giftWrapping) marketingMult *= 1.05;

    const ecMult = state.ecEnabled ? (1 + EC.salesBoostPct) : 1.0;
    const costHikeMult = 1.0 + (state.costHikePct || 0);
    const priceHikeMult = 1.0 + (state.priceHikePct || 0);

    const staffMult = state.staff.length > 0
        ? 1 + state.staff.reduce((sum, s) => sum + (STAFF_COSTS[s.type]?.capacityMult - 1 || 0), 0)
        : 1;

    let totalCustomers = 0;
    const baseDaily = loc.baseCustomers;

    for (let d = 0; d < openDays; d++) {
        const dayType = weekDays[d];
        const dayMult = WEEKDAY_MULT[dayType];
        const dailyCustomers = Math.round(
            baseDaily * repMult * weatherMult * dayMult * seasonMult * marketingMult * loc.footTraffic * staffMult
        );
        totalCustomers += Math.max(0, dailyCustomers);
    }

    if (state.ecEnabled) {
        totalCustomers = Math.floor(totalCustomers * ecMult);
    }

    let totalSales = 0;
    let totalCOGS = 0;
    let itemsSold = 0;

    const availableSKUs = state.skus.filter(s => s.stock > 0);
    if (availableSKUs.length === 0) {
        const minSale = totalCustomers * ind.avgUnit * 0.3;
        totalSales = Math.floor(minSale);
        totalCOGS = Math.floor(minSale * ind.costRatio);
    } else {
        for (let c = 0; c < totalCustomers; c++) {
            const purchaseProb = 0.55 + (state.interiorBonus || 0);
            if (Math.random() > purchaseProb) continue;

            const sku = availableSKUs[Math.floor(Math.random() * availableSKUs.length)];
            if (sku.stock <= 0) continue;

            const sellPrice = Math.floor(sku.price * priceHikeMult * (1 - sku.degradation * 0.3));
            const buyCost = Math.floor(sku.cost * costHikeMult * (state.supplierCostMult || 1.0));

            totalSales += sellPrice;
            totalCOGS += buyCost;
            sku.stock--;
            sku.totalSold++;
            itemsSold++;
        }
    }

    const ipoDividend = state.ipoDividend || 0;
    const grossProfit = totalSales - totalCOGS;
    const fixedCosts = calculateWeeklyFixed(state);
    const netProfit = grossProfit - fixedCosts + ipoDividend;

    return {
        customers: totalCustomers,
        sales: Math.floor(totalSales),
        cogs: Math.floor(totalCOGS),
        grossProfit: Math.floor(grossProfit),
        fixedCosts: Math.floor(fixedCosts),
        netProfit: Math.floor(netProfit),
        weather,
        season,
        itemsSold,
        ipoDividend,
    };
}

function updateInventoryStatus(skus) {
    for (const sku of skus) {
        if (sku.stock <= 0) {
            sku.status = 'stockout';
            continue;
        }
        sku.turnsInStock++;
        const turnoverRate = sku.totalSold / Math.max(1, sku.turnsInStock);
        if (turnoverRate >= 4) sku.status = 'hot';
        else if (turnoverRate >= 2) sku.status = 'normal';
        else if (turnoverRate >= 1) sku.status = 'slow';
        else sku.status = 'dead';
    }
}

function calculateCh2Multiple(state) {
    let mult = CH2_EXIT_BASE_MULTIPLE;

    if (state.profitHistory.length >= 8) {
        const recent = state.profitHistory.slice(-4).reduce((s, p) => s + p.profit, 0);
        const older = state.profitHistory.slice(-8, -4).reduce((s, p) => s + p.profit, 0);
        const growthRate = older > 0 ? (recent - older) / older : 0;
        if (growthRate >= 0.20) mult += 1.0;
        if (growthRate < 0) mult -= 1.0;
    }

    if (state.reputation >= 4.0) mult += 0.5;
    if (state.ecEnabled) mult += 0.5;
    if (state.staff.length > 0) mult += 0.25;
    if (state.giftWrapping) mult += 0.25;

    return Math.max(3.0, Math.min(8.0, mult));
}

function generateCFStatement(state) {
    const recentProfits = state.profitHistory.slice(-4);
    const operatingCF = recentProfits.reduce((s, p) => s + p.profit, 0);
    const inventoryValue = state.skus.reduce((s, sku) => s + sku.stock * sku.cost, 0);
    const investingCF = -(inventoryValue - (state.prevInventoryValue || 0));

    return {
        operatingCF,
        investingCF,
        totalCF: operatingCF + investingCF,
        inventoryValue,
    };
}
