import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    LOCATIONS, INTERIORS, MACHINES, MENU_ITEMS, OPERATING_HOURS,
    OTHER_EQUIPMENT_COST, FIXED_COSTS, MENU_COUNT_EFFECTS, ORDER_PATTERN,
    REPUTATION, WEATHER_MULT, WEATHER_CHANCE, WEEKDAY_MULT,
    getCh1Phase, TAKEOUT, EXIT_BASE_MULTIPLE, STAFF_COSTS,
} from '../data/ch1Constants.js';
import { getCh1EventForTurn } from '../data/ch1Events.js';

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
// Zustand Store
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const useCafeStore = create(
    persist(
        (set, get) => ({
            // ── 基本 ──
            chapter: 1,
            turn: 0,
            phase: 'idle', // idle → ch1-setup-location → ... → ch1-dashboard → ch1-operation → ch1-results → ch1-event → ch1-exit → ch1-report
            money: 0,
            netWorth: 0,

            // ── Ch.0からの引き継ぎ ──
            ch0Transfer: null,

            // ── カフェ基本情報 ──
            cafeName: '',
            location: null,       // 'station' | 'residential' | 'backstreet'
            interiorGrade: null,   // 'premium' | 'standard' | 'minimum'
            machineGrade: null,    // 'high' | 'mid' | 'low'
            operatingHours: null,  // 'morning' | 'allday' | 'evening'
            seats: 0,

            // ── メニュー ──
            menu: [],             // [{ id, name, cost, price, prepTime, category, popularity }]

            // ── 来客・売上 ──
            weeklyCustomers: 0,
            weeklySales: 0,
            weeklyProfit: 0,
            dailyCapacity: 0,
            capacityUtilization: 0,
            customersTurnedAway: 0,
            weeklyWeather: 'sunny',

            // ── 評判 ──
            reputation: 2.0,
            reviews: 0,

            // ── スタッフ ──
            staff: [],
            totalLaborCost: 0,

            // ── 固定費 ──
            rent: 0,
            utilities: 0,
            loanRepayment: 0,
            insuranceCost: 0,

            // ── 損益分岐点 ──
            breakEvenSales: 0,

            // ── マーケティング ──
            activeMarketing: [],  // [{ type, turnsLeft }]
            snsActive: false,

            // ── テイクアウト ──
            takeoutEnabled: false,

            // ── 累計 ──
            totalSales: 0,
            totalProfit: 0,
            profitHistory: [],    // [{ turn, sales, profit, customers }]
            consecutiveBlackTurns: 0,
            firstBlackTurn: null,
            costRatioHistory: [],

            // ── 税金 ──
            blueFilingEnabled: true,
            taxRecords: [],
            yearlyIncome: 0,

            // ── イベントフラグ ──
            currentEvent: null,
            eventResult: null,
            chainCompetitorArrived: false,
            chainCompetitorTurn: null,
            staffQuitOccurred: false,
            equipmentDegraded: false,
            equipmentDegradation: 0,
            mediaActive: false,
            mediaTurnsLeft: 0,
            priceHikeOccurred: false,
            priceHikeMult: 1.0,
            supplierChanged: false,
            supplierChangeTurnsLeft: 0,
            _triggeredEvents: [],
            _tempCustomerMult: 1.0,

            // ── ケンジ ──
            kenjiStage: 0,
            kenjiAlive: true,

            // ── EXIT ──
            enterpriseValue: 0,
            multiple: EXIT_BASE_MULTIPLE,
            exitAvailable: false,

            // ── スキル ──
            ch1Skills: [],
            ch0Skills: [],
            ch0JobType: null,

            // ── 判断記録 ──
            decisions: [],

            // ── マイルストーン ──
            milestonesHit: [],

            // ━━━━━━━━━━━━━━━━━━━━━━━━━
            // ACTIONS
            // ━━━━━━━━━━━━━━━━━━━━━━━━━

            // Ch.0 → Ch.1 遷移
            initFromCh0: (ch0State) => {
                const fusionAmount = ch0State.fusionAmount || 0;
                const fusionRate = ch0State.fusionRate || 0;
                const fusionYears = ch0State.fusionYears || 0;
                // 月額返済額（Report.jsxと同じ計算式）
                const monthlyRepay = fusionAmount > 0
                    ? Math.round(fusionAmount * (1 + fusionRate / 100 * fusionYears) / (fusionYears * 12))
                    : 0;

                set({
                    ch0Transfer: ch0State,
                    money: (ch0State.money || 0) + (ch0State.shouInvestment || 0) + fusionAmount,
                    ch0Skills: ch0State.acquiredSkills || [],
                    ch0JobType: ch0State.baitoType || null,
                    loanRepayment: monthlyRepay,
                    phase: 'ch1-setup-location',
                    turn: 1,
                });
            },

            // カフェ名設定
            setCafeName: (name) => set({ cafeName: name }),

            // Step 1: 立地選択
            selectLocation: (key) => {
                const loc = LOCATIONS[key];
                if (!loc) return;
                set(state => ({
                    location: key,
                    seats: loc.seats,
                    rent: loc.rent,
                    phase: 'ch1-setup-interior',
                    turn: 2,
                    decisions: [...state.decisions, { turn: 1, type: 'location', label: `立地: ${loc.name}` }],
                }));
            },

            // Step 2: 内装 + マシン
            selectInterior: (interiorKey, machineKey) => {
                const interior = INTERIORS[interiorKey];
                const machine = MACHINES[machineKey];
                if (!interior || !machine) return;

                const state = get();
                const hasDIY = state.ch0Skills.includes('diy_skill');
                const interiorCost = hasDIY ? Math.floor(interior.cost * 0.8) : interior.cost;
                const totalSetupCost = interiorCost + machine.cost + OTHER_EQUIPMENT_COST;

                // 初期評判 = 2.0 + 内装補正 + マルシェ経験
                const hasMarche = state.ch0Skills.includes('hospitality');
                const initReputation = REPUTATION.initial + interior.satisfactionBonus + (hasMarche ? 0.3 : 0);

                set(s => ({
                    interiorGrade: interiorKey,
                    machineGrade: machineKey,
                    money: s.money - totalSetupCost,
                    reputation: Math.min(initReputation, REPUTATION.max),
                    phase: 'ch1-setup-menu',
                    turn: 3,
                    decisions: [...s.decisions,
                    { turn: 2, type: 'interior', label: `内装: ${interior.name}${hasDIY ? '(DIY割引)' : ''}` },
                    { turn: 2, type: 'machine', label: `マシン: ${machine.name}` },
                    ],
                }));
            },

            // Step 3: メニュー設定
            setMenu: (selectedItems) => {
                // selectedItems = [{ id, price }]
                const menuData = selectedItems.map(item => {
                    const base = MENU_ITEMS.find(m => m.id === item.id);
                    return { ...base, price: item.price };
                });
                set(s => ({
                    menu: menuData,
                    phase: 'ch1-setup-hours',
                    turn: 4,
                    decisions: [...s.decisions, { turn: 3, type: 'menu', label: `メニュー${menuData.length}品` }],
                }));
            },

            // Step 4: 営業時間
            selectHours: (key) => {
                const hours = OPERATING_HOURS[key];
                if (!hours) return;

                const state = get();
                const baseCapacity = hours.dailyCapacity;
                const hasCafeSkill = state.ch0Skills.includes('coffee_knowledge');

                set(s => ({
                    operatingHours: key,
                    dailyCapacity: baseCapacity,
                    utilities: FIXED_COSTS.utilities_base + hours.extraUtilities,
                    insuranceCost: FIXED_COSTS.insurance,
                    phase: 'ch1-open',
                    turn: 5,
                    decisions: [...s.decisions, { turn: 4, type: 'hours', label: `営業: ${hours.name}` }],
                }));
            },

            // 開店イベント完了 → ダッシュボードへ
            startOperating: () => set({ phase: 'ch1-dashboard' }),

            // 経営判断を確定 → 週シミュレーション
            confirmWeek: (actions) => {
                // actions = { menuChanges?, priceChanges?, marketing?, hire?, fire? }
                const state = get();
                set({ phase: 'ch1-simulating' });

                // マーケティング処理
                let newMarketing = [...state.activeMarketing];
                if (actions?.marketing) {
                    newMarketing.push({ type: actions.marketing, turnsLeft: 2 });
                }
                // マーケ期限処理
                newMarketing = newMarketing
                    .map(m => ({ ...m, turnsLeft: m.turnsLeft - 1 }))
                    .filter(m => m.turnsLeft > 0);

                const snsActive = actions?.marketing === 'sns' || state.snsActive;

                // スタッフ雇用/解雇
                let staff = [...state.staff];
                let laborCost = state.totalLaborCost;
                if (actions?.hire) {
                    const type = actions.hire; // 'part' or 'full'
                    const staffInfo = STAFF_COSTS[type];
                    staff.push({
                        id: `staff_${Date.now()}`,
                        name: staff.length === 0 ? 'アヤ' : `スタッフ${staff.length + 1}`,
                        type,
                        monthlyCost: staffInfo.monthly,
                        skill: 0.8,
                        loyalty: 0.7,
                        turnHired: state.turn,
                    });
                    laborCost = staff.reduce((sum, s) => sum + s.monthlyCost, 0);
                }

                // 価格変更
                let menu = [...state.menu];
                if (actions?.priceChanges) {
                    menu = menu.map(item => {
                        const change = actions.priceChanges[item.id];
                        return change !== undefined ? { ...item, price: change } : item;
                    });
                }

                set({
                    menu, staff, totalLaborCost: laborCost, activeMarketing: newMarketing, snsActive,
                    _weeklyFocus: actions?._focus || {},
                });

                // シミュレーション実行
                setTimeout(() => {
                    const s = get();
                    const focusCost = s._weeklyFocus?._focusMarketingCost || 0;
                    const result = simulateWeek(s);
                    // フォーカスコスト適用
                    result.netProfit -= focusCost;
                    result.fixedCosts += focusCost;
                    const newMoney = s.money + result.netProfit;
                    const newTotalSales = s.totalSales + result.sales;
                    const newTotalProfit = s.totalProfit + result.netProfit;
                    const profitEntry = { turn: s.turn, sales: result.sales, profit: result.netProfit, customers: result.customers };
                    const isBlack = result.netProfit > 0;
                    const consecutive = isBlack ? s.consecutiveBlackTurns + 1 : 0;

                    // 損益分岐計算
                    const weeklyFixed = calculateWeeklyFixed(s);
                    const costRatio = result.sales > 0 ? result.cogs / result.sales : 0.30;
                    const grossMarginRate = 1 - costRatio;
                    const breakEven = grossMarginRate > 0 ? Math.ceil(weeklyFixed / grossMarginRate) : 999999;

                    // 評判更新
                    let newRep = s.reputation;
                    if (result.qualityMet) {
                        newRep += REPUTATION.growthPerTurn * (LOCATIONS[s.location]?.repeaterGrowthMult || 1);
                    } else {
                        newRep += REPUTATION.decayPerTurn;
                    }
                    newRep = Math.max(1.0, Math.min(REPUTATION.max, newRep));
                    // WeeklyFocus評判変調
                    if (s._weeklyFocus?._focusReputationAdj) {
                        newRep = Math.max(1.0, Math.min(REPUTATION.max, newRep + s._weeklyFocus._focusReputationAdj));
                    }

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
                    const mult = calculateMultiple(s, newRep, recentProfits);
                    const ev = Math.max(0, Math.floor(annualProfit * mult));

                    set({
                        weeklyCustomers: result.customers,
                        weeklySales: result.sales,
                        weeklyProfit: result.netProfit,
                        capacityUtilization: result.utilization,
                        customersTurnedAway: result.turnedAway,
                        weeklyWeather: result.weather,
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
                        costRatioHistory: [...s.costRatioHistory, costRatio],
                        milestonesHit: milestones,
                        netWorth: newMoney + ev * 0.3,
                        weekResult: result,
                        _goalBlackWeeks: (s._goalBlackWeeks || 0) + (isBlack ? 1 : 0),
                        _goalAchieved: s._goalAchieved || ((s._goalBlackWeeks || 0) + (isBlack ? 1 : 0)) >= 3,
                        phase: 'ch1-results',
                    });
                }, 100);
            },

            // 結果確認後 → 次ターンへ
            nextTurn: () => {
                const state = get();
                const nextTurn = state.turn + 1;

                // スタッフスキル成長
                const staff = state.staff.map(s => ({
                    ...s,
                    skill: Math.min(1.5, s.skill + 0.02),
                }));

                // メディア・仕入先等のターン経過処理
                const updates = {
                    turn: nextTurn,
                    staff,
                    currentEvent: null,
                    eventResult: null,
                    _tempCustomerMult: 1.0,
                };
                if (state.mediaTurnsLeft > 0) {
                    updates.mediaTurnsLeft = state.mediaTurnsLeft - 1;
                    if (updates.mediaTurnsLeft <= 0) updates.mediaActive = false;
                }
                if (state.supplierChangeTurnsLeft > 0) {
                    updates.supplierChangeTurnsLeft = state.supplierChangeTurnsLeft - 1;
                    if (updates.supplierChangeTurnsLeft <= 0) {
                        updates.priceHikeMult = Math.max(1.0, (state.priceHikeMult || 1.0) * 0.95);
                    }
                }

                // イベント判定
                const event = getCh1EventForTurn(nextTurn, { ...state, ...updates });
                if (event) {
                    updates.currentEvent = event;
                    updates.phase = 'ch1-event';
                    if (event._kenjiStage) updates.kenjiStage = event._kenjiStage;
                    if (event.id) updates._triggeredEvents = [...(state._triggeredEvents || []), event.id];
                } else {
                    updates.phase = 'ch1-dashboard';
                }

                set(updates);
            },

            // イベント表示・処理
            setEvent: (event) => set({ currentEvent: event, phase: 'ch1-event' }),
            dismissEvent: (choiceIdx) => {
                const state = get();
                const event = state.currentEvent;
                if (!event) return;

                const updates = {};

                // Determine the effect to apply
                let effect = null;
                let response = null;

                if (event.choices && choiceIdx !== undefined) {
                    const choice = event.choices[choiceIdx];
                    effect = choice?.effect || {};
                    response = choice?.response || null;

                    // Handle success rate (e.g. staff quit raise)
                    if (choice?.successRate !== undefined && Math.random() > choice.successRate) {
                        effect = choice.failEffect || {};
                        response = choice.failResponse || response;
                    }

                    updates.eventResult = response;
                    updates.decisions = [...state.decisions, {
                        turn: state.turn, type: 'event', label: `${event.id}: ${choice.label}`,
                    }];
                    // Show result first, don't go to dashboard yet
                    updates.phase = 'ch1-event';
                } else {
                    // Text-only event or dismiss after result
                    effect = event.effect || {};
                    updates.currentEvent = null;
                    updates.phase = 'ch1-dashboard';
                }

                // Apply effects
                if (effect) {
                    if (effect.money) updates.money = (updates.money ?? state.money) + effect.money;
                    if (effect.reputation) updates.reputation = Math.max(1, Math.min(5, state.reputation + effect.reputation));
                    if (effect._tempCustomerMult) updates._tempCustomerMult = effect._tempCustomerMult;

                    // Event flags
                    if (effect.chainCompetitorArrived !== undefined) updates.chainCompetitorArrived = effect.chainCompetitorArrived;
                    if (effect.staffQuitOccurred !== undefined) updates.staffQuitOccurred = effect.staffQuitOccurred;
                    if (effect.staffQuitAvoided !== undefined) updates.staffQuitAvoided = effect.staffQuitAvoided;
                    if (effect.equipmentDegraded !== undefined) updates.equipmentDegraded = effect.equipmentDegraded;
                    if (effect.equipmentDegradation !== undefined) {
                        updates.equipmentDegradation = state.equipmentDegradation + effect.equipmentDegradation;
                    }
                    if (effect.priceHikeOccurred !== undefined) updates.priceHikeOccurred = effect.priceHikeOccurred;
                    if (effect.priceHikeMult) updates.priceHikeMult = effect.priceHikeMult;
                    if (effect.mediaActive !== undefined) {
                        updates.mediaActive = effect.mediaActive;
                        updates.mediaTurnsLeft = effect.mediaTurnsLeft || 0;
                    }
                    if (effect.supplierChanged !== undefined) {
                        updates.supplierChanged = effect.supplierChanged;
                        updates.supplierChangeTurnsLeft = effect.supplierChangeTurnsLeft || 0;
                    }
                    if (effect.takeoutEnabled !== undefined) updates.takeoutEnabled = true;
                    if (effect.staffRaise) {
                        // Increase first staff's monthly cost
                        if (state.staff.length > 0) {
                            const newStaff = [...state.staff];
                            newStaff[0] = { ...newStaff[0], monthlyCost: newStaff[0].monthlyCost + effect.staffRaise };
                            updates.staff = newStaff;
                            updates.totalLaborCost = newStaff.reduce((sum, s) => sum + s.monthlyCost, 0);
                        }
                    }
                    if (effect.menuPriceChange) {
                        updates.menu = state.menu.map(m => ({ ...m, price: m.price + effect.menuPriceChange }));
                    }

                    // Staff hire from event (oneope ceiling)
                    if (effect.hire) {
                        const staffInfo = STAFF_COSTS[effect.hire];
                        const newStaff = [...state.staff, {
                            id: `staff_${Date.now()}`,
                            name: state.staff.length === 0 ? 'アヤ' : `スタッフ${state.staff.length + 1}`,
                            type: effect.hire,
                            monthlyCost: staffInfo.monthly,
                            skill: 0.8,
                            loyalty: 0.7,
                            turnHired: state.turn,
                        }];
                        updates.staff = newStaff;
                        updates.totalLaborCost = newStaff.reduce((sum, s) => sum + s.monthlyCost, 0);
                    }

                    // Fire staff from event
                    if (effect.staffQuitOccurred && state.staff.length > 0 && !effect.hire && !effect.staffRaise) {
                        const newStaff = state.staff.slice(0, -1); // Remove last hired
                        updates.staff = newStaff;
                        updates.totalLaborCost = newStaff.reduce((sum, s) => sum + s.monthlyCost, 0);
                    }
                }

                // Track triggered events
                if (event.id && !state._triggeredEvents?.includes(event.id)) {
                    updates._triggeredEvents = [...(state._triggeredEvents || []), event.id];
                }

                set(updates);
            },

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
                        extras.ipoDividend = Math.floor(ev * 0.02); // 2%/turn配当
                        break;
                    case 'succession':
                        exitAmount = Math.floor(ev * 0.30);
                        extras.hiringSpeedBonus = 0.20;
                        break;
                    case 'liquidation':
                        exitAmount = Math.floor(state.money * 0.40);
                        break;
                }

                // Ch.1スキルの判定と永続化
                const ch1Skills = [];
                if (state.profitHistory.length >= 4) ch1Skills.push('pl_thinking');         // P&L思考
                if (state.firstBlackTurn !== null) ch1Skills.push('break_even');             // 損益分岐点
                if (state.staff.length > 0) ch1Skills.push('staff_management');              // 人材管理
                if (state.chainCompetitorArrived) ch1Skills.push('competitor_response');      // 競合対応
                if (state.taxRecords.length > 0) ch1Skills.push('tax_knowledge');            // 税務知識
                ch1Skills.push('exit_judgment');                                             // EXIT判断（必ず取得）
                // カフェ業種ボーナス（Ch.2で品質目利きに使用）
                ch1Skills.push('cafe_experience');

                set(s => ({
                    money: s.money + exitAmount,
                    phase: 'ch1-report',
                    decisions: [...s.decisions, { turn: s.turn, type: 'exit', label: `EXIT: ${type} (¥${exitAmount.toLocaleString()})` }],
                    exitType: type,
                    exitAmount,
                    ch1Skills,
                    ...extras,
                }));
            },

            // フェーズ直接設定
            setPhase: (phase) => set({ phase }),

            // スタッフ雇用（ダッシュボードから）
            hireStaff: ({ type, monthlyCost }) => {
                const state = get();
                const staff = [...state.staff, {
                    id: `staff_${Date.now()}`,
                    name: state.staff.length === 0 ? 'アヤ' : `スタッフ${state.staff.length + 1}`,
                    type,
                    monthlyCost,
                    skill: 0.8,
                    loyalty: 0.7,
                    turnHired: state.turn,
                }];
                const totalLaborCost = staff.reduce((sum, s) => sum + s.monthlyCost, 0);
                set({
                    staff,
                    totalLaborCost,
                    decisions: [...state.decisions, { turn: state.turn, type: 'hire', label: `雇用: ${type === 'part' ? 'パート' : '社員'}` }],
                });
            },

            // スタッフ解雇
            fireStaff: (staffId) => {
                const state = get();
                const staff = state.staff.filter(s => s.id !== staffId);
                const totalLaborCost = staff.reduce((sum, s) => sum + s.monthlyCost, 0);
                set({
                    staff,
                    totalLaborCost,
                    decisions: [...state.decisions, { turn: state.turn, type: 'fire', label: '解雇' }],
                });
            },

            // リセット
            resetCh1: () => set(useCafeStore.getInitialState()),
        }),
        { name: 'antigravity-ch1' }
    )
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// シミュレーション関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━

function calculateWeeklyFixed(state) {
    const rent = state.rent / 4;
    const utilities = state.utilities / 4;
    const insurance = state.insuranceCost / 4;
    const accounting = state.blueFilingEnabled ? FIXED_COSTS.accounting / 4 : 0;
    const loan = state.loanRepayment / 4;
    const labor = state.totalLaborCost / 4;
    const comm = FIXED_COSTS.communication / 4;
    return rent + utilities + insurance + accounting + loan + labor + comm;
}

function simulateWeek(state) {
    const loc = LOCATIONS[state.location];
    if (!loc) return { customers: 0, sales: 0, cogs: 0, grossProfit: 0, fixedCosts: 0, netProfit: 0, utilization: 0, turnedAway: 0, weather: 'sunny', qualityMet: true };

    // 7日分シミュレーション
    let totalCustomers = 0;
    let totalTurnedAway = 0;
    const weekDays = ['weekday', 'weekday', 'weekday', 'weekday', 'weekday', 'saturday', 'sunday'];
    // 1日は定休日
    const openDays = 6;

    // スタッフによる提供上限倍率
    const staffMult = state.staff.length > 0
        ? 1 + state.staff.reduce((sum, s) => sum + (STAFF_COSTS[s.type]?.capacityMult - 1 || 1), 0)
        : 1;
    const takeoutBonus = state.takeoutEnabled ? TAKEOUT.capacityBonus : 0;
    const dailyCap = Math.floor(state.dailyCapacity * staffMult * (1 + takeoutBonus));

    // マーケ補正
    let marketingMult = 1.0;
    if (state.snsActive) marketingMult *= 1.10;
    state.activeMarketing.forEach(m => {
        if (m.type === 'flyer') marketingMult *= 1.15;
        if (m.type === 'googleAd') marketingMult *= 1.05;
    });
    if (state.mediaActive && state.mediaTurnsLeft > 0) marketingMult *= 2.0;

    // 競合補正
    let competitorMult = 1.0;
    if (state.chainCompetitorArrived) competitorMult = 0.80;

    // 週の天候（代表値）
    const weather = pickWeather();
    const weatherMult = WEATHER_MULT[weather];

    for (let d = 0; d < openDays; d++) {
        const dayType = weekDays[d];
        const dayMult = WEEKDAY_MULT[dayType];
        const repMult = REPUTATION.getCustomerMult(state.reputation);

        let dailyCustomers = Math.round(
            loc.baseCustomers * repMult * weatherMult * dayMult * marketingMult * competitorMult
            * (state._weeklyFocus?._focusCustomerMult || 1)
        );

        // 原材料高騰時の品質低下は来客に間接的に反映
        if (state.equipmentDegraded) dailyCustomers = Math.round(dailyCustomers * 0.95);

        const arrived = dailyCustomers;
        const served = Math.min(dailyCustomers, dailyCap);
        const turnedAway = Math.max(0, arrived - served);

        totalCustomers += served;
        totalTurnedAway += turnedAway;
    }

    // 来客の注文 → 売上・原価
    const hasFood = state.menu.some(m => m.category === 'food');
    const drinks = state.menu.filter(m => m.category === 'drink');
    const foods = state.menu.filter(m => m.category === 'food');

    let totalSales = 0;
    let totalCOGS = 0;

    for (let c = 0; c < totalCustomers; c++) {
        const roll = Math.random();
        let drinkItem = null;
        let foodItem = null;

        if (roll < ORDER_PATTERN.drinkOnly || !hasFood) {
            drinkItem = weightedPick(drinks);
        } else if (roll < ORDER_PATTERN.drinkOnly + ORDER_PATTERN.drinkAndFood) {
            drinkItem = weightedPick(drinks);
            foodItem = weightedPick(foods);
        } else {
            foodItem = weightedPick(foods);
        }

        if (drinkItem) {
            totalSales += drinkItem.price;
            totalCOGS += drinkItem.cost;
        }
        if (foodItem) {
            totalSales += foodItem.price;
            totalCOGS += foodItem.cost;
        }
    }

    // 夜型客単価ボーナス
    const hoursData = OPERATING_HOURS[state.operatingHours];
    if (hoursData?.ticketBonus) {
        totalSales += totalCustomers * hoursData.ticketBonus * 0.3; // 30%の客がアルコール注文
    }

    // ロス（廃棄）
    const menuCount = state.menu.length;
    const lossRate = MENU_COUNT_EFFECTS[Math.min(6, Math.max(3, menuCount))]?.lossRate || 0.05;
    const lossCost = Math.floor(totalCOGS * lossRate);
    totalCOGS += lossCost;

    // 原材料高騰
    if (state.priceHikeOccurred) {
        totalCOGS = Math.floor(totalCOGS * state.priceHikeMult);
    }

    // WeeklyFocusの原価率変調
    if (state._weeklyFocus?._focusCostRatioAdj) {
        totalCOGS = Math.floor(totalCOGS * (1 + state._weeklyFocus._focusCostRatioAdj));
    }

    const grossProfit = totalSales - totalCOGS;
    const fixedCosts = calculateWeeklyFixed(state);
    const netProfit = grossProfit - fixedCosts;

    const weeklyCapacity = dailyCap * openDays;
    const utilization = weeklyCapacity > 0 ? totalCustomers / weeklyCapacity : 0;

    const machine = MACHINES[state.machineGrade];
    const qualityMet = machine ? (machine.qualityCap - state.equipmentDegradation) >= 3 : true;

    return {
        customers: totalCustomers,
        sales: Math.floor(totalSales),
        cogs: Math.floor(totalCOGS),
        grossProfit: Math.floor(grossProfit),
        fixedCosts: Math.floor(fixedCosts),
        netProfit: Math.floor(netProfit),
        utilization: Math.round(utilization * 100) / 100,
        turnedAway: totalTurnedAway,
        weather,
        qualityMet,
        lossCost,
        costRatio: totalSales > 0 ? Math.round((totalCOGS / totalSales) * 100) : 0,
    };
}

function weightedPick(items) {
    if (!items || items.length === 0) return null;
    const totalWeight = items.reduce((sum, i) => sum + (i.popularity || 1), 0);
    let r = Math.random() * totalWeight;
    for (const item of items) {
        r -= item.popularity || 1;
        if (r <= 0) return item;
    }
    return items[0];
}

function calculateMultiple(state, reputation, profitHistory) {
    let mult = EXIT_BASE_MULTIPLE;

    // 成長率
    if (profitHistory.length >= 8) {
        const recent = profitHistory.slice(-4).reduce((s, p) => s + p.profit, 0);
        const older = profitHistory.slice(-8, -4).reduce((s, p) => s + p.profit, 0);
        const growthRate = older > 0 ? (recent - older) / older : 0;
        if (growthRate >= 0.20) mult += 1.0;
        if (growthRate < 0) mult -= 1.0;
    }

    // 評判
    if (reputation >= 4.0) mult += 0.5;

    // 複数収益源
    if (state.takeoutEnabled) mult += 0.25;
    if (state.staff.length > 0) mult += 0.25;

    return Math.max(3.5, Math.min(8.0, mult));
}
