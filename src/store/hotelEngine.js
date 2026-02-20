import { create } from 'zustand';
import {
    PROPERTIES, ROOM_PRESETS, FACILITIES, OTA_LEVELS,
    CH3_FIXED_COSTS, CH3_VARIABLE_COSTS, CH3_STAFF, SOLO_ROOM_LIMIT,
    CH3_REPUTATION, CH3_WEATHER_CHANCE, CH3_WEATHER_MULT, CH3_WEEKDAY_MULT,
    DIRECT_BOOKING, PRICING_ELASTICITY, CH3_EXIT_BASE_MULTIPLE,
    getSeasonMultiplier, getCh3Phase, getCh3Month,
} from '../data/ch3Constants.js';
import { getCh3EventForTurn, createCh3TaxEvent } from '../data/ch3Events.js';

function pickWeather() {
    const r = Math.random();
    let cum = 0;
    for (const [type, chance] of Object.entries(CH3_WEATHER_CHANCE)) {
        cum += chance;
        if (r < cum) return type;
    }
    return 'sunny';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 客室生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━
function generateRooms(totalRooms, presetKey) {
    const preset = ROOM_PRESETS[presetKey];
    if (!preset) return [];
    const rooms = [];
    const types = ['dormitory', 'standard', 'premium'];
    let remaining = totalRooms;

    for (let t = 0; t < types.length; t++) {
        const type = types[t];
        const ratio = preset.distribution[type];
        if (ratio === 0) continue;  // ratio=0のタイプはスキップ（最後でも）
        const count = t === types.length - 1
            ? remaining
            : Math.round(totalRooms * ratio);
        if (count <= 0) continue;
        remaining -= count;

        for (let i = 0; i < count; i++) {
            rooms.push({
                id: `room_${type}_${i}`,
                type,
                capacity: type === 'dormitory' ? 4 : 2,
                basePrice: preset.adr[type],
                setupCost: preset.setupCostPerRoom[type],
                condition: 1.0,
            });
        }
    }
    return rooms;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Zustand Store
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const useHotelStore = create((set, get) => ({
    // ── 基本 ──
    chapter: 3,
    turn: 0,
    phase: 'idle',
    money: 0,
    netWorth: 0,

    // ── Ch.2引き継ぎ ──
    ch2Transfer: null,
    ch2Skills: [],
    ch1Skills: [],
    ipoDividend: 0,
    ayaFromCh2: false,

    // ── セットアップ ──
    propertyKey: null,
    roomPresetKey: null,
    rooms: [],
    totalRooms: 0,
    totalBeds: 0,
    selectedFacilities: [],
    otaLevel: null,

    // ── 稼働・売上 ──
    weeklyOccupancy: 0,
    weeklyADR: 0,
    weeklyRevPAR: 0,
    weeklySales: 0,
    weeklyProfit: 0,
    weekResult: null,

    // ── 価格 ──
    pricingMode: 'fixed',
    priceMultipliers: { weekday: 1.0, weekend: 1.0, peak: 1.0 },
    dynamicPricingUnlocked: false,
    priceOverrideSetTurn: null,  // priceOverrideが設定されたターン
    priceOverride: null,

    // ── OTA・直販 ──
    otaDependency: 0.90,
    directBookingRatio: DIRECT_BOOKING.initialRatio,
    totalOTACommission: 0,
    selfBookingSite: false,
    otaCommissionExtra: 0,

    // ── 評判 ──
    reputation: CH3_REPUTATION.initial,
    reviewCount: 0,
    repeaterRate: 0,

    // ── スタッフ ──
    staff: [],
    totalLaborCost: 0,

    // ── 施設 ──
    breakfastEnabled: false,
    inboundBoost: false,

    // ── 税金 ──
    consumptionTaxEnabled: false,
    taxMethod: null,
    monthlyTax: 0,
    taxRecords: [],

    // ── 累計 ──
    totalSales: 0,
    totalProfit: 0,
    profitHistory: [],
    maxOccupancy: 0,
    minOccupancy: 1.0,
    firstBlackTurn: null,

    // ── フラグ ──
    snsBoostTurnsLeft: 0,
    occupancyBonus: 0,
    occupancyPenalty: 0,
    repairDone: false,
    repairPartial: false,
    repairDeferred: false,
    leakOccurred: false,
    ayaJoined: false,
    kenjiCh3Stage: 0,
    taxWarning: false,
    otaBoostTurns: 0,
    staffUpgrade: false,

    // ── イベント ──
    currentEvent: null,
    eventResult: null,
    _triggeredEvents: [],

    // ── 判断記録 ──
    decisions: [],
    milestonesHit: [],

    // ── 企業価値・EXIT ──
    enterpriseValue: 0,
    multiple: CH3_EXIT_BASE_MULTIPLE,
    exitAvailable: false,
    exitType: null,
    exitAmount: 0,
    ch3Skills: [],

    // ━━━━━━━━━━━━━━━━━━━━━━━━━
    // ACTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━

    // Ch.2 → Ch.3 遷移
    initFromCh2: (ch2State) => set({
        ch2Transfer: ch2State,
        money: ch2State.money,
        ch2Skills: ch2State.ch2Skills || [],
        ch1Skills: ch2State.ch1Skills || [],
        ipoDividend: ch2State.ipoDividend || 0,
        ayaFromCh2: ch2State.staff?.some(s => s.name === 'アヤ') && ch2State.exitType !== 'succession',
        phase: 'ch3-setup-property',
        turn: 0,
    }),

    // Step 1: 物件選択
    selectProperty: (key) => {
        const prop = PROPERTIES[key];
        if (!prop) return;
        const state = get();
        // 物件取得費用（ローン前提なので自己資金30%）
        const downPayment = Math.floor(prop.propertyCost * 0.30) + prop.renovationCost;
        // DIYスキルでリノベ割引
        const hasRenoDIY = state.ch1Skills?.includes('diy_skill');
        const actualReno = hasRenoDIY ? Math.floor(prop.renovationCost * 0.80) : prop.renovationCost;
        const totalDown = Math.floor(prop.propertyCost * 0.30) + actualReno;

        set(s => ({
            propertyKey: key,
            totalRooms: prop.totalRooms,
            totalBeds: prop.maxBeds,
            money: s.money - totalDown,
            phase: 'ch3-setup-rooms',
            decisions: [...s.decisions, { turn: 0, type: 'property', label: `物件: ${prop.name}` }],
        }));
    },

    // Step 2: 客室プリセット選択
    selectRoomPreset: (key) => {
        const state = get();
        const preset = ROOM_PRESETS[key];
        if (!preset) return;
        const rooms = generateRooms(state.totalRooms, key);
        const setupCost = rooms.reduce((sum, r) => sum + r.setupCost, 0);

        set(s => ({
            roomPresetKey: key,
            rooms,
            money: s.money - setupCost,
            phase: 'ch3-setup-channel',
            decisions: [...s.decisions, { turn: 0, type: 'rooms', label: `客室: ${preset.name}` }],
        }));
    },

    // Step 3: チャネル設定（OTAレベル + 共用施設）
    setupChannels: (otaLevelKey, facilityKeys) => {
        const ota = OTA_LEVELS[otaLevelKey];
        if (!ota) return;
        const facilCost = facilityKeys.reduce((sum, k) => sum + (FACILITIES[k]?.cost || 0), 0);
        const facilRep = facilityKeys.reduce((sum, k) => sum + (FACILITIES[k]?.reputationBonus || 0), 0);

        set(s => ({
            otaLevel: otaLevelKey,
            otaDependency: ota.initialDependency,
            directBookingRatio: 1 - ota.initialDependency,
            selectedFacilities: facilityKeys,
            money: s.money - facilCost,
            reputation: Math.min(CH3_REPUTATION.max, s.reputation + facilRep),
            phase: 'ch3-opening',
            decisions: [
                ...s.decisions,
                { turn: 0, type: 'channel', label: `OTA: ${ota.name}` },
                ...facilityKeys.map(k => ({ turn: 0, type: 'facility', label: `施設: ${FACILITIES[k]?.name}` })),
            ],
        }));
    },

    // 開業 → ダッシュボードへ
    startOperating: () => {
        const state = get();
        const updates = { phase: 'ch3-dashboard', turn: 1 };

        // アヤ合流チェック
        if (state.ayaFromCh2 && !state.ayaJoined) {
            const event = getCh3EventForTurn(1, { ...state, turn: 1 });
            if (event) {
                updates.currentEvent = event;
                updates.phase = 'ch3-event';
                if (event.id) updates._triggeredEvents = [...state._triggeredEvents, event.id];
            }
        }
        set(updates);
    },

    // ダイナミックプライシング倍率設定
    setPriceMultipliers: (mults) => set({ priceMultipliers: mults }),

    // 経営判断を確定 → 週シミュレーション
    confirmWeek: (actions) => {
        const state = get();
        set({ phase: 'ch3-simulating' });

        // スタッフ雇用
        let staff = [...state.staff];
        let laborCost = state.totalLaborCost;
        if (actions?.hire) {
            const type = actions.hire;
            const staffInfo = CH3_STAFF[type];
            staff.push({
                id: `staff_${Date.now()}`,
                name: staffInfo.name,
                type,
                monthlyCost: staffInfo.monthly,
                turnHired: state.turn,
            });
            laborCost = staff.reduce((sum, s) => sum + s.monthlyCost, 0);
        }

        // 朝食開始
        if (actions?.breakfastEnabled && !state.breakfastEnabled) {
            set({ breakfastEnabled: true });
        }

        set({ staff, totalLaborCost: laborCost });

        setTimeout(() => {
            const s = get();
            const result = simulateHotelWeek(s);

            const newMoney = s.money + result.netProfit;
            const newTotalSales = s.totalSales + result.sales;
            const newTotalProfit = s.totalProfit + result.netProfit;
            const profitEntry = {
                turn: s.turn, sales: result.sales, profit: result.netProfit,
                occupancy: result.occupancy, adr: result.adr, revpar: result.revpar,
            };
            const isBlack = result.netProfit > 0;

            // 直販比率の成長
            let directRatio = s.directBookingRatio;
            directRatio += DIRECT_BOOKING.growthPerTurn;
            if (s.selfBookingSite) directRatio += DIRECT_BOOKING.selfSiteBoost;
            if (s.snsBoostTurnsLeft > 0) directRatio += DIRECT_BOOKING.snsBoost;
            directRatio = Math.min(DIRECT_BOOKING.maxRatio, directRatio);

            // OTA依存度
            const otaDep = 1 - directRatio;

            // 評判更新
            let newRep = s.reputation;
            if (result.occupancy >= 0.50) {
                newRep += CH3_REPUTATION.growthPerTurn;
            } else if (result.occupancy < 0.30) {
                newRep += CH3_REPUTATION.decayPerTurn;
            }
            newRep = Math.max(1.5, Math.min(CH3_REPUTATION.max, newRep));

            // リピーター率
            let repeaterRate = s.repeaterRate;
            if (newRep >= 4.0) repeaterRate = Math.min(0.40, repeaterRate + 0.005);
            else if (newRep >= 3.0) repeaterRate = Math.min(0.25, repeaterRate + 0.002);

            // SNSブースト減衰
            const snsBoostTurnsLeft = Math.max(0, s.snsBoostTurnsLeft - 1);
            // OTAブースト減衰
            const otaBoostTurns = Math.max(0, (s.otaBoostTurns || 0) - 1);
            // 価格オーバーライド解除（設定後2ターンで自動解除）
            const priceOverride = (s.priceOverride && s.priceOverrideSetTurn != null && s.turn - s.priceOverrideSetTurn >= 2)
                ? null : s.priceOverride;
            const priceOverrideSetTurn = priceOverride ? s.priceOverrideSetTurn : null;

            // ダイナミックプライシング解放（Turn 28以降）
            const dynamicPricingUnlocked = s.dynamicPricingUnlocked || s.turn >= 28;

            // マイルストーン
            const milestones = [...s.milestonesHit];
            if (result.occupancy >= 1.0 && !milestones.some(m => m.type === 'full_house')) {
                milestones.push({ type: 'full_house', turn: s.turn });
            }
            if (result.revpar >= 8000 && !milestones.some(m => m.type === 'revpar_8k')) {
                milestones.push({ type: 'revpar_8k', turn: s.turn });
            }

            // 修繕先送りリスク
            let leakOccurred = s.leakOccurred;
            let leakCost = 0;
            let leakOccPenalty = 0;
            if (s.repairDeferred && !s.repairDone && !s.leakOccurred && Math.random() < 0.10) {
                leakOccurred = true;
                leakCost = -3000000;
                leakOccPenalty = -0.15; // 稼働率-15%のペナルティ
            }

            // 企業価値
            const recentProfits = [...s.profitHistory.slice(-11), profitEntry];
            const avgProfit = recentProfits.length > 0
                ? recentProfits.reduce((sum, p) => sum + p.profit, 0) / recentProfits.length
                : 0;
            const annualProfit = avgProfit * 52;
            const mult = calculateCh3Multiple(s);
            const propValue = PROPERTIES[s.propertyKey]?.propertyCost || 0;
            const ev = Math.max(0, Math.floor(annualProfit * mult) + Math.floor(propValue * 0.7));

            set({
                weeklyOccupancy: result.occupancy,
                weeklyADR: result.adr,
                weeklyRevPAR: result.revpar,
                weeklySales: result.sales,
                weeklyProfit: result.netProfit,
                weekResult: result,
                money: newMoney + leakCost,
                totalSales: newTotalSales,
                totalProfit: newTotalProfit,
                profitHistory: [...s.profitHistory, profitEntry],
                firstBlackTurn: s.firstBlackTurn ?? (isBlack ? s.turn : null),
                maxOccupancy: Math.max(s.maxOccupancy, result.occupancy),
                minOccupancy: Math.min(s.minOccupancy, result.occupancy),
                directBookingRatio: directRatio,
                otaDependency: otaDep,
                totalOTACommission: s.totalOTACommission + result.otaCommission,
                reputation: Math.round(newRep * 100) / 100,
                repeaterRate,
                snsBoostTurnsLeft,
                otaBoostTurns,
                priceOverride,
                priceOverrideSetTurn,
                dynamicPricingUnlocked,
                milestonesHit: milestones,
                leakOccurred,
                occupancyBonus: leakOccPenalty !== 0 ? s.occupancyBonus + leakOccPenalty : s.occupancyBonus,
                enterpriseValue: ev,
                multiple: mult,
                exitAvailable: s.turn >= 49,
                netWorth: newMoney + ev * 0.3 + propValue * 0.5,
                phase: 'ch3-results',
            });
        }, 100);
    },

    // 結果確認後 → 次ターン
    nextTurn: () => {
        const state = get();
        const nextTurn = state.turn + 1;
        const updates = { turn: nextTurn, currentEvent: null, eventResult: null };

        // ゲーム終了判定（Turn 68以降は強制EXIT）
        if (nextTurn > 68) {
            set({ ...updates, phase: 'ch3-exit', exitAvailable: true });
            return;
        }

        const event = getCh3EventForTurn(nextTurn, { ...state, turn: nextTurn });
        if (event) {
            updates.currentEvent = event;
            updates.phase = 'ch3-event';
            if (event._kenjiCh3Stage) updates.kenjiCh3Stage = event._kenjiCh3Stage;
            if (event.id) updates._triggeredEvents = [...(state._triggeredEvents || []), event.id];
        } else {
            updates.phase = 'ch3-dashboard';
        }
        set(updates);
    },

    // イベント処理
    setEvent: (event) => set({ currentEvent: event, phase: 'ch3-event' }),
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
            updates.phase = 'ch3-event';
        } else {
            effect = event.effect || {};
            updates.currentEvent = null;
            updates.phase = 'ch3-dashboard';
        }

        if (effect) {
            if (effect.money) updates.money = (updates.money ?? state.money) + effect.money;
            if (effect.reputation) updates.reputation = Math.max(1, Math.min(5, state.reputation + effect.reputation));
            if (effect.ayaJoined) updates.ayaJoined = true;
            if (effect.snsBoost) updates.snsBoostTurnsLeft = effect.snsBoostTurns || 3;
            if (effect.occupancyBonus) updates.occupancyBonus = (state.occupancyBonus || 0) + effect.occupancyBonus;
            if (effect.occupancyPenalty) updates.occupancyPenalty = (state.occupancyPenalty || 0) + effect.occupancyPenalty;
            if (effect.selfBookingSite) updates.selfBookingSite = true;
            if (effect.otaCommissionUp) updates.otaCommissionExtra = (state.otaCommissionExtra || 0) + effect.otaCommissionUp;
            if (effect.priceOverride) {
                updates.priceOverride = effect.priceOverride;
                updates.priceOverrideSetTurn = state.turn;
            }
            if (effect.breakfastEnabled) updates.breakfastEnabled = true;
            if (effect.inboundBoost) updates.inboundBoost = true;
            if (effect.repairDone) updates.repairDone = true;
            if (effect.repairPartial) updates.repairPartial = true;
            if (effect.repairDeferred) updates.repairDeferred = true;
            if (effect.staffUpgrade) updates.staffUpgrade = true;
            if (effect.otaBoost) updates.otaBoostTurns = effect.otaBoost;
            if (effect.consumptionTaxEnabled) updates.consumptionTaxEnabled = true;
            if (effect.taxMethod) updates.taxMethod = effect.taxMethod;
            if (effect.monthlyTax) updates.monthlyTax = effect.monthlyTax;
            if (effect.taxWarning) updates.taxWarning = true;
            if (effect.repeaterBonus) updates.repeaterRate = Math.min(0.40, (state.repeaterRate || 0) + 0.05);

            // hire staff from event
            if (effect.hire) {
                const staffInfo = CH3_STAFF[effect.hire];
                const newStaff = [...state.staff, {
                    id: `staff_${Date.now()}`,
                    name: effect.ayaJoined ? 'アヤ' : staffInfo.name,
                    type: effect.hire,
                    monthlyCost: staffInfo.monthly,
                    turnHired: state.turn,
                }];
                updates.staff = newStaff;
                updates.totalLaborCost = newStaff.reduce((sum, s) => sum + s.monthlyCost, 0);
            }
        }

        if (event.id && !state._triggeredEvents?.includes(event.id)) {
            updates._triggeredEvents = [...(state._triggeredEvents || []), event.id];
        }
        set(updates);
    },

    dismissEventResult: () => set({ currentEvent: null, eventResult: null, phase: 'ch3-dashboard' }),

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
            case 'management':
                exitAmount = Math.floor(ev * 0.50);
                extras.managementFee = Math.floor(ev * 0.05);
                break;
            case 'ipo':
                exitAmount = Math.floor(ev * 0.40);
                extras.ipoDividend = Math.floor(ev * 0.02);
                break;
            case 'liquidation':
                const propValue = PROPERTIES[state.propertyKey]?.propertyCost || 0;
                exitAmount = Math.floor(state.money * 0.40 + propValue * 0.5);
                break;
        }

        // Ch.3スキル判定
        const ch3Skills = [];
        const avgOcc = state.profitHistory.length > 0
            ? state.profitHistory.reduce((s, p) => s + (p.occupancy || 0), 0) / state.profitHistory.length
            : 0;
        if (avgOcc >= 0.65) ch3Skills.push('occupancy_master');
        if (state.dynamicPricingUnlocked && state.pricingMode === 'dynamic') ch3Skills.push('dynamic_pricing');
        if (state.directBookingRatio >= 0.40) ch3Skills.push('direct_sales');
        if (state.selfBookingSite) ch3Skills.push('self_booking');
        if (state.repairDone) ch3Skills.push('facility_management');
        if (state.inboundBoost) ch3Skills.push('inbound_experience');
        if (state.consumptionTaxEnabled) ch3Skills.push('tax_master');
        if (state.reputation >= 4.0) ch3Skills.push('hospitality');
        ch3Skills.push('hotel_experience');

        set(s => ({
            money: s.money + exitAmount,
            phase: 'ch3-report',
            decisions: [...s.decisions, { turn: s.turn, type: 'exit', label: `EXIT: ${type} (¥${exitAmount.toLocaleString()})` }],
            exitType: type,
            exitAmount,
            ch3Skills,
            ...extras,
        }));
    },

    // スタッフ雇用
    hireStaff: (type) => {
        const state = get();
        const staffInfo = CH3_STAFF[type];
        if (!staffInfo) return;
        const newStaff = [...state.staff, {
            id: `staff_${Date.now()}`,
            name: staffInfo.name,
            type,
            monthlyCost: staffInfo.monthly,
            turnHired: state.turn,
        }];
        set({
            staff: newStaff,
            totalLaborCost: newStaff.reduce((sum, s) => sum + s.monthlyCost, 0),
        });
    },

    fireStaff: (staffId) => {
        const state = get();
        const newStaff = state.staff.filter(s => s.id !== staffId);
        set({
            staff: newStaff,
            totalLaborCost: newStaff.reduce((sum, s) => sum + s.monthlyCost, 0),
        });
    },

    setPhase: (phase) => set({ phase }),

    resetCh3: () => set({
        chapter: 3, turn: 0, phase: 'idle', money: 0, netWorth: 0,
        ch2Transfer: null, ch2Skills: [], propertyKey: null, rooms: [],
        staff: [], totalLaborCost: 0, totalSales: 0, totalProfit: 0,
        profitHistory: [], decisions: [], milestonesHit: [], _triggeredEvents: [],
        enterpriseValue: 0, reputation: CH3_REPUTATION.initial,
    }),
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// シミュレーション関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━

function calculateWeeklyFixed(state) {
    const prop = PROPERTIES[state.propertyKey];
    if (!prop) return 0;
    const loan = prop.loanPayment / 4;
    const utils = CH3_FIXED_COSTS.utilities_base / 4;
    const insurance = CH3_FIXED_COSTS.insurance / 4;
    const pms = CH3_FIXED_COSTS.communication_pms / 4;
    const repair = CH3_FIXED_COSTS.repairReserve / 4;
    const otaBase = CH3_FIXED_COSTS.otaBase / 4;
    const cleaning = CH3_FIXED_COSTS.cleaning_supplies / 4;
    const labor = state.totalLaborCost / 4;
    const tax = (state.monthlyTax || 0) / 4;
    return loan + utils + insurance + pms + repair + otaBase + cleaning + labor + tax;
}

function simulateHotelWeek(state) {
    const prop = PROPERTIES[state.propertyKey];
    if (!prop) return { occupancy: 0, adr: 0, revpar: 0, sales: 0, netProfit: 0, weather: 'sunny' };

    const preset = ROOM_PRESETS[state.roomPresetKey];
    const ota = OTA_LEVELS[state.otaLevel];
    const totalRoomNights = prop.totalRooms * 7;
    const weather = pickWeather();
    const weatherMult = CH3_WEATHER_MULT[weather];
    const seasonMult = getSeasonMultiplier(state.turn, state.propertyKey);
    const repMult = CH3_REPUTATION.getOccupancyMult(state.reputation);
    const otaReach = ota ? ota.reachPower : 1.0;

    // ベース稼働率
    let baseOcc = prop.baseOccupancy;
    if (preset) baseOcc += preset.occupancyBonus;
    baseOcc += (state.occupancyBonus || 0);
    baseOcc += (state.occupancyPenalty || 0);

    // OTAブースト
    if (state.otaBoostTurns > 0) baseOcc += 0.05;

    // インバウンドブースト
    if (state.inboundBoost) baseOcc += 0.08;

    // リピーター効果
    baseOcc += state.repeaterRate * 0.3;

    // 価格弾力性（ダイナミックプライシング時）
    let priceMult = 1.0;
    if (state.priceOverride) {
        priceMult = state.priceOverride;
    }

    let priceElasticityEffect = 0;
    if (priceMult !== 1.0) {
        const priceDiff = (1 - priceMult); // 正=値下げ
        const elasticity = seasonMult > 1.2
            ? PRICING_ELASTICITY.peakDampen
            : (seasonMult < 0.5 ? PRICING_ELASTICITY.offAmplify : 1.0);
        priceElasticityEffect = priceDiff * 1.5 * elasticity;
    }

    // マーケティング効果
    let marketingMult = 1.0;
    if (state.snsBoostTurnsLeft > 0) marketingMult *= 1.15;
    if (state.selfBookingSite) marketingMult *= 1.05;

    // ワンオペ制約: スタッフ0人の場合、最大SOLO_ROOM_LIMIT室までしか稼働できない
    const staffCapacity = state.staff.length === 0
        ? SOLO_ROOM_LIMIT
        : prop.totalRooms;  // スタッフがいれば全室運営可能
    const capacityCap = staffCapacity / prop.totalRooms;  // 0.0-1.0

    // 日別計算
    let totalRoomsSold = 0;
    let totalSales = 0;
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (let d = 0; d < 7; d++) {
        const dayMult = CH3_WEEKDAY_MULT[dayNames[d]];
        let dailyOcc = baseOcc * seasonMult * repMult * otaReach * dayMult * weatherMult * marketingMult;
        dailyOcc += priceElasticityEffect;
        dailyOcc = Math.max(0, Math.min(1.0, dailyOcc));

        // ランダム変動 ±10%
        dailyOcc *= (0.90 + Math.random() * 0.20);
        dailyOcc = Math.min(1.0, Math.max(0, dailyOcc));

        // ワンオペ制約でキャップ
        dailyOcc = Math.min(dailyOcc, capacityCap);

        const roomsSold = Math.round(prop.totalRooms * dailyOcc);
        totalRoomsSold += roomsSold;

        // 各室タイプのADR計算
        if (state.rooms && state.rooms.length > 0) {
            let roomIdx = 0;
            for (let r = 0; r < roomsSold && roomIdx < state.rooms.length; r++) {
                const room = state.rooms[roomIdx % state.rooms.length];
                let adr = room.basePrice * priceMult;

                // ダイナミックプライシング倍率
                if (state.dynamicPricingUnlocked && state.pricingMode === 'dynamic') {
                    if (d <= 3) adr *= state.priceMultipliers.weekday;
                    else if (d === 4 || d === 5) adr *= state.priceMultipliers.weekend;
                    if (seasonMult > 1.3) adr *= state.priceMultipliers.peak;
                }

                totalSales += Math.floor(adr);
                roomIdx++;
            }
        } else {
            // フォールバック
            totalSales += roomsSold * 8000 * priceMult;
        }
    }

    const occupancy = totalRoomNights > 0 ? totalRoomsSold / totalRoomNights : 0;
    const adr = totalRoomsSold > 0 ? Math.floor(totalSales / totalRoomsSold) : 0;
    const revpar = totalRoomNights > 0 ? Math.floor(totalSales / totalRoomNights) : 0;

    // OTA手数料
    const commRate = (ota?.commissionRate || 0.15) + (state.otaCommissionExtra || 0);
    const otaSalesRatio = state.otaDependency;
    const otaCommission = Math.floor(totalSales * otaSalesRatio * commRate);

    // 変動費
    const amenityCost = totalRoomsSold * CH3_VARIABLE_COSTS.amenity;
    const linenCost = totalRoomsSold * CH3_VARIABLE_COSTS.linen;
    const breakfastCost = state.breakfastEnabled ? totalRoomsSold * CH3_VARIABLE_COSTS.breakfast : 0;
    const breakfastRevenue = state.breakfastEnabled ? totalRoomsSold * CH3_VARIABLE_COSTS.breakfastPrice : 0;
    const variableCosts = amenityCost + linenCost + breakfastCost;

    // 固定費
    const fixedCosts = calculateWeeklyFixed(state);

    const netSales = totalSales + breakfastRevenue;
    const ipoDiv = state.ipoDividend || 0;
    const netProfit = netSales - otaCommission - variableCosts - fixedCosts + ipoDiv;

    return {
        occupancy: Math.round(occupancy * 1000) / 1000,
        adr,
        revpar,
        sales: Math.floor(netSales),
        otaCommission: Math.floor(otaCommission),
        variableCosts: Math.floor(variableCosts),
        fixedCosts: Math.floor(fixedCosts),
        netProfit: Math.floor(netProfit),
        roomsSold: totalRoomsSold,
        totalRoomNights,
        weather,
        season: getCh3Month(state.turn),
        breakfastRevenue: Math.floor(breakfastRevenue),
        ipoDividend: state.ipoDividend || 0,
    };
}

function calculateCh3Multiple(state) {
    let mult = CH3_EXIT_BASE_MULTIPLE;

    if (state.profitHistory.length >= 8) {
        const recent = state.profitHistory.slice(-4).reduce((s, p) => s + p.profit, 0);
        const older = state.profitHistory.slice(-8, -4).reduce((s, p) => s + p.profit, 0);
        const growthRate = older > 0 ? (recent - older) / older : 0;
        if (growthRate >= 0.20) mult += 1.0;
        if (growthRate < 0) mult -= 0.5;
    }

    if (state.reputation >= 4.0) mult += 0.5;
    if (state.directBookingRatio >= 0.30) mult += 0.5;
    if (state.selfBookingSite) mult += 0.3;
    if (state.breakfastEnabled) mult += 0.2;
    if (state.staff.length > 0) mult += 0.2;
    if (state.inboundBoost) mult += 0.3;

    return Math.max(4.0, Math.min(10.0, mult));
}
