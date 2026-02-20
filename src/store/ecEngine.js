/**
 * Ch.4 EC・D2C ゲームエンジン (Zustand Store)
 * 設計書: antigravity-ch4-detail-v3.md
 */
import { create } from 'zustand';
import {
    PRODUCT_CATEGORIES, BRAND_CONCEPTS, PACKAGE_DESIGNS,
    AD_PLATFORMS, SALES_CHANNELS, CH4_FIXED_COSTS, CH4_VARIABLE_COSTS,
    CRM_TOOLS, CREATIVE_FRESHNESS, CH4_STAFF, CH4_REPUTATION,
    INCORPORATION, EC_CONSUMPTION_TAX,
    calculateNewCustomers, getECSeasonMultiplier, getCh4Phase,
    CH4_EXIT_BASE_MULTIPLE,
} from '../data/ch4Constants.js';
import { getCh4EventForTurn, createCh4TaxEvent, createIncorporationEvent } from '../data/ch4Events.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 週次シミュレーション
// ━━━━━━━━━━━━━━━━━━━━━━━━━
function simulateECWeek(state) {
    const cat = PRODUCT_CATEGORIES[state.productCategory];
    const brandConcept = BRAND_CONCEPTS[state.brandConcept];
    if (!cat || !brandConcept) return {};

    const seasonMult = getECSeasonMultiplier(state.turn);

    // ── 1. 広告経由の新規顧客 ──
    let totalNewFromAds = 0;
    let totalAdSpendWeek = 0;
    const adResults = {};

    if (!state.adStopTest) {
        for (const [platformKey, budget] of Object.entries(state.adBudgets || {})) {
            if (budget <= 0) continue;
            const newCust = calculateNewCustomers(budget, platformKey, state);
            totalNewFromAds += newCust;
            totalAdSpendWeek += budget;
            const cpa = newCust > 0 ? Math.round(budget / newCust) : 0;
            adResults[platformKey] = { budget, newCustomers: newCust, cpa };
        }
    }

    // ── 2. マーケティングスタッフ補正 ──
    const hasMarketingStaff = (state.staff || []).some(s => s.skill === 'marketing');
    if (hasMarketingStaff) {
        totalNewFromAds = Math.ceil(totalNewFromAds * 1.10);
    }

    // ── 3. オーガニック顧客 ──
    const repMult = CH4_REPUTATION.getConversionMult(state.reputation || 3.5);
    const baseOrganic = Math.floor(state.totalCustomers * (state.repeatRate || 0) * 0.08 * repMult);
    const organicFromSNS = (brandConcept.snsViralChance && Math.random() < brandConcept.snsViralChance)
        ? Math.floor(20 + Math.random() * 30) : 0;
    const organicCustomers = baseOrganic + organicFromSNS + (state.bonusCustomersThisWeek || 0);

    // ── 4. リピーター ──
    let repeatRate = cat.repeatRate + (state.repeatBoost || 0) + (brandConcept.ltvBonus || 0);
    // CRM効果
    for (const [toolKey, enabled] of Object.entries(state.crmEnabled || {})) {
        if (enabled && CRM_TOOLS[toolKey]) {
            repeatRate += CRM_TOOLS[toolKey].repeatBoost;
        }
    }
    // CSスタッフ効果
    const hasCSStaff = (state.staff || []).some(s => s.skill === 'cs');
    if (hasCSStaff) repeatRate += 0.05;
    repeatRate = Math.min(0.80, Math.max(0.05, repeatRate));

    const repeatCustomers = Math.floor(state.totalCustomers * repeatRate * 0.15 * seasonMult);
    const totalNewCustomers = totalNewFromAds + organicCustomers;
    const totalOrders = totalNewCustomers + repeatCustomers;

    // ── 5. 売上計算 ──
    let unitPrice = cat.avgPrice * brandConcept.priceMultiplier;
    if (state.priceOverride) unitPrice *= state.priceOverride;

    // サブスクでの割引
    let subRevenue = 0;
    if (state.crmEnabled?.subscription && state.subscriberCount > 0) {
        const subOrders = Math.floor(state.subscriberCount * (1 - (state.churnRate || 0.05)));
        subRevenue = subOrders * unitPrice * (1 - CRM_TOOLS.subscription.priceDiscount);
    }

    const regularRevenue = totalOrders * unitPrice * seasonMult;
    const grossRevenue = regularRevenue + subRevenue;

    // ── 6. チャネル別手数料 ──
    let totalCommission = 0;
    const ownEcRatio = state.channels?.includes('amazon') || state.channels?.includes('rakuten')
        ? 0.50 : 1.0;
    const amazonRatio = state.channels?.includes('amazon') ? 0.30 : 0;
    const rakutenRatio = state.channels?.includes('rakuten') ? 0.20 : 0;

    totalCommission += grossRevenue * ownEcRatio * SALES_CHANNELS.own_ec.commissionRate;
    if (amazonRatio > 0) totalCommission += grossRevenue * amazonRatio * SALES_CHANNELS.amazon.commissionRate;
    if (rakutenRatio > 0) totalCommission += grossRevenue * rakutenRatio * SALES_CHANNELS.rakuten.commissionRate;

    // OTAスキル適用
    if (state.previousSkills?.includes('OTA攻略')) {
        totalCommission *= 0.97;
    }

    // ── 7. 原価 ──
    let marginPenalty = 0;
    if (state.crmEnabled?.coupon) marginPenalty += CRM_TOOLS.coupon.marginPenalty;
    if (state.wholesaleEnabled) marginPenalty += SALES_CHANNELS.own_ec.commissionRate; // 卸は粗利半減近い
    const effectiveCostRatio = cat.costRatio + marginPenalty;
    const cogs = grossRevenue * effectiveCostRatio;

    // ── 8. 返品コスト ──
    const returnOrders = Math.floor(totalOrders * cat.returnRate);
    const returnCost = returnOrders * unitPrice * effectiveCostRatio;

    // ── 9. 変動費 ──
    const perOrderCost = CH4_VARIABLE_COSTS.shipping + CH4_VARIABLE_COSTS.packaging + CH4_VARIABLE_COSTS.pickPack;
    const variableCosts = (totalOrders + (state.subscriberCount || 0)) * perOrderCost;

    // ── 10. 固定費 ──
    let weeklyFixed = 0;
    for (const val of Object.values(CH4_FIXED_COSTS)) weeklyFixed += val / 4;
    // チャネル月額
    for (const chKey of (state.channels || [])) {
        weeklyFixed += (SALES_CHANNELS[chKey]?.monthlyCost || 0) / 4;
    }
    // CRM月額
    for (const [toolKey, enabled] of Object.entries(state.crmEnabled || {})) {
        if (enabled && CRM_TOOLS[toolKey]) weeklyFixed += CRM_TOOLS[toolKey].monthlyCost / 4;
    }
    // スタッフ
    const laborCost = (state.staff || []).reduce((sum, s) => sum + (CH4_STAFF[s.skill]?.monthly || 0), 0) / 4;
    weeklyFixed += laborCost;
    // 税金
    weeklyFixed += (state.monthlyTax || 0) / 4;
    // 法人化後の追加コスト
    if (state.isIncorporated) {
        weeklyFixed += INCORPORATION.annualAccountingFee / 52;
        weeklyFixed += INCORPORATION.annualMinTax / 52;
    }

    // ── 11. 広告費 ──
    // totalAdSpendWeek は上で計算済

    // ── 12. 副収入 ──
    const consultIncome = state.consultIncome || 0;

    // ── 13. 純利益 ──
    const netSales = grossRevenue - cogs - returnCost;
    const netProfit = netSales - totalCommission - variableCosts - weeklyFixed - totalAdSpendWeek + consultIncome;

    // ── 14. ユニットエコノミクス ──
    const weeklyCac = totalNewFromAds > 0 ? Math.round(totalAdSpendWeek / totalNewFromAds) : 0;
    const avgPurchases = 1 + repeatRate * 3;
    const weeklyLtv = Math.round(unitPrice * avgPurchases * (1 - effectiveCostRatio));
    const ltvCacRatio = weeklyCac > 0 ? +(weeklyLtv / weeklyCac).toFixed(2) : 0;
    const weeklyRoas = totalAdSpendWeek > 0 ? +(grossRevenue / totalAdSpendWeek).toFixed(2) : 0;

    // ── 15. オーガニック比率 ──
    const organicRatio = totalOrders > 0
        ? +((organicCustomers + repeatCustomers) / totalOrders).toFixed(2)
        : 0;

    // ── 16. クリエイティブ鮮度劣化 ──
    const newFreshness = Math.max(0, (state.creativeFreshness || 1) - CREATIVE_FRESHNESS.decayPerTurn);

    // ── 17. 評判推移 ──
    let repChange = CH4_REPUTATION.growthPerTurn;
    if (hasCSStaff) repChange += 0.02;
    const newReputation = Math.min(CH4_REPUTATION.max, (state.reputation || 3.5) + repChange);

    // ── 18. サブスク会員数推移 ──
    let newSubscribers = state.subscriberCount || 0;
    if (state.crmEnabled?.subscription) {
        const newSubs = Math.floor(totalNewCustomers * 0.08);
        const churned = Math.floor(newSubscribers * (state.churnRate || 0.05));
        newSubscribers = newSubscribers + newSubs - churned;
    }

    return {
        weeklyOrders: totalOrders,
        weeklyNewCustomers: totalNewCustomers,
        weeklyRepeatCustomers: repeatCustomers,
        weeklySales: Math.round(grossRevenue),
        weeklyAdSpend: totalAdSpendWeek,
        weeklyCommission: Math.round(totalCommission),
        weeklyCogs: Math.round(cogs),
        weeklyVariableCosts: Math.round(variableCosts),
        weeklyFixedCosts: Math.round(weeklyFixed),
        weeklyProfit: Math.round(netProfit),
        cac: weeklyCac,
        ltv: weeklyLtv,
        ltvCacRatio,
        roas: weeklyRoas,
        organicRatio,
        totalCustomers: (state.totalCustomers || 0) + totalNewCustomers,
        totalAdSpend: (state.totalAdSpend || 0) + totalAdSpendWeek,
        totalSales: (state.totalSales || 0) + Math.round(grossRevenue),
        totalProfit: (state.totalProfit || 0) + Math.round(netProfit),
        money: state.money + Math.round(netProfit),
        creativeFreshness: newFreshness,
        reputation: +newReputation.toFixed(2),
        repeatRate: +repeatRate.toFixed(3),
        subscriberCount: newSubscribers,
        adResults,
        bonusCustomersThisWeek: 0,
        adStopTest: false,
        priceOverride: state.priceOverrideExpiry === state.turn ? null : state.priceOverride,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// EXIT計算
// ━━━━━━━━━━━━━━━━━━━━━━━━━
function calculateExitValue(state) {
    const annualProfit = (state.totalProfit || 0) * (52 / Math.max(1, state.turn));
    const recentGrowth = state.turn > 8
        ? ((state.weeklySales || 0) / Math.max(1, (state.totalSales || 1) / state.turn) - 1)
        : 0;

    let multi = CH4_EXIT_BASE_MULTIPLE;
    // 成長率でマルチプル調整
    if (recentGrowth > 0.15) multi += 2.0;
    else if (recentGrowth > 0.05) multi += 1.0;
    else if (recentGrowth < -0.05) multi -= 1.5;

    // オーガニック比率が高いほど価値UP
    if ((state.organicRatio || 0) > 0.50) multi += 1.5;
    else if ((state.organicRatio || 0) > 0.30) multi += 0.5;

    // ブランド評判
    if ((state.reputation || 3.5) >= 4.5) multi += 1.0;

    // サブスク会員
    if ((state.subscriberCount || 0) > 200) multi += 1.0;

    // LTV/CAC
    if ((state.ltvCacRatio || 0) >= 3.0) multi += 0.5;

    multi = Math.max(2.0, Math.min(12.0, multi));

    const enterpriseValue = Math.round(annualProfit * multi);
    return { enterpriseValue, multiple: +multi.toFixed(1), annualProfit: Math.round(annualProfit), growthRate: +(recentGrowth * 100).toFixed(1) };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// スキル判定
// ━━━━━━━━━━━━━━━━━━━━━━━━━
function evaluateCh4Skills(state) {
    const skills = [];
    if ((state.roas || 0) >= 4.0) skills.push('広告運用力');
    if ((state.ltvCacRatio || 0) >= 3.0) skills.push('LTV最適化');
    if ((state.organicRatio || 0) >= 0.50) skills.push('ブランド構築');
    if ((state.subscriberCount || 0) > 100 && (state.churnRate || 1) <= 0.05) skills.push('サブスク設計');
    if (state.isIncorporated) skills.push('法人経営');
    if (state.channels?.length >= 2) skills.push('プラットフォーム戦略');
    if ((state.weeklySales || 0) * 4 > 10000000) skills.push('スケール思考');
    return skills;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Zustand Store
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const initialState = {
    phase: 'ch4-product-select',
    turn: 0,
    money: 60000000,

    // セットアップ
    productCategory: null,
    brandConcept: null,
    packageDesign: null,
    channels: ['own_ec'],
    adBudgets: {},

    // 広告
    creativeFreshness: 1.0,
    totalAdSpend: 0,

    // ユニットエコノミクス
    cac: 0,
    ltv: 0,
    ltvCacRatio: 0,
    roas: 0,

    // 顧客
    totalCustomers: 0,
    weeklyNewCustomers: 0,
    weeklyRepeatCustomers: 0,
    repeatRate: 0,
    organicRatio: 0,
    repeatBoost: 0,
    bonusCustomersThisWeek: 0,

    // 結果
    weeklyOrders: 0,
    weeklySales: 0,
    weeklyProfit: 0,
    weeklyAdSpend: 0,
    weeklyCommission: 0,
    weeklyCogs: 0,
    weeklyVariableCosts: 0,
    weeklyFixedCosts: 0,
    totalSales: 0,
    totalProfit: 0,

    // CRM
    crmEnabled: { newsletter: false, coupon: false, subscription: false },
    subscriberCount: 0,
    churnRate: 0.05,
    emailListSize: 0,

    // 広告結果
    adResults: {},

    // 法人化
    isIncorporated: false,
    officerSalary: null,
    corporateTaxSaved: 0,
    monthlyTax: 0,
    consumptionTaxEnabled: false,

    // 評判
    reputation: 3.5,

    // スタッフ
    staff: [],
    totalLaborCost: 0,

    // イベント
    currentEvent: null,
    eventResult: null,
    _triggeredEvents: [],
    kenjiCh4Stage: 0,

    // フラグ
    influencerHired: false,
    wholesaleEnabled: false,
    adStopTest: false,
    adStopDeclined: false,
    consultIncome: 0,
    internationalEnabled: false,
    productUpgrade: false,
    priceOverride: null,
    priceOverrideExpiry: null,
    ayaFromCh3: false,
    ayaJoined: false,
    taxWarning: false,
    adStopTestSales: null,

    // EXIT
    enterpriseValue: 0,
    multiple: 0,
    growthRate: 0,
    exitAvailable: false,
    exitType: null,
    exitAmount: 0,

    // スキル
    skills: [],
    previousSkills: [],
    allPreviousSkills: [],

    // セーブ
    savePoints: {},
};

export const useECStore = create((set, get) => ({
    ...initialState,

    // ━━ 初期化 ━━
    initFromCh3: (ch3State) => {
        const prevSkills = ch3State.skills || [];
        let bonus = 0;
        if (prevSkills.includes('直販力')) bonus += 0.05;
        set({
            ...initialState,
            money: ch3State.money || 60000000,
            previousSkills: prevSkills,
            allPreviousSkills: ch3State.allPreviousSkills || prevSkills,
            repeatBoost: bonus,
            ayaFromCh3: ch3State.ayaJoined || ch3State.ayaFromCh2 || false,
        });
    },

    resetCh4: () => set({ ...initialState }),

    // ━━ セットアップ ━━
    selectProduct: (key) => {
        if (!PRODUCT_CATEGORIES[key]) return;
        const cat = PRODUCT_CATEGORIES[key];
        set({
            productCategory: key,
            repeatRate: cat.repeatRate,
            money: get().money - cat.initialInventoryCost,
            phase: 'ch4-brand-select',
        });
    },

    selectBrand: (conceptKey, pkgKey) => {
        if (!BRAND_CONCEPTS[conceptKey] || !PACKAGE_DESIGNS[pkgKey]) return;
        const pkg = PACKAGE_DESIGNS[pkgKey];
        set({
            brandConcept: conceptKey,
            packageDesign: pkgKey,
            reputation: 3.5 + pkg.reputationBonus,
            money: get().money - pkg.cost,
            phase: 'ch4-channel-setup',
        });
    },

    setupChannelsAndAds: (channels, adBudgets) => {
        const state = get();
        let cost = 0;
        for (const ch of channels) {
            cost += SALES_CHANNELS[ch]?.setupCost || 0;
        }
        set({
            channels,
            adBudgets,
            money: state.money - cost,
            turn: 1,
            phase: 'ch4-opening',
        });
    },

    startGameplay: () => set({ phase: 'ch4-dashboard' }),

    // ━━ 広告管理 ━━
    updateAdBudgets: (newBudgets) => {
        set({ adBudgets: newBudgets, phase: 'ch4-dashboard' });
    },

    refreshCreative: () => {
        const state = get();
        if (state.money < CREATIVE_FRESHNESS.refreshCost) return;
        set({
            creativeFreshness: 1.0,
            money: state.money - CREATIVE_FRESHNESS.refreshCost,
        });
    },

    openAdPanel: () => set({ phase: 'ch4-ads' }),

    // ━━ CRM管理 ━━
    enableCRM: (toolKey) => {
        const state = get();
        if (!CRM_TOOLS[toolKey]) return;
        if (state.turn < CRM_TOOLS[toolKey].unlockTurn) return;
        const newCRM = { ...state.crmEnabled, [toolKey]: true };
        set({ crmEnabled: newCRM });
    },

    disableCRM: (toolKey) => {
        const state = get();
        const newCRM = { ...state.crmEnabled, [toolKey]: false };
        set({ crmEnabled: newCRM });
    },

    openCRMPanel: () => set({ phase: 'ch4-crm' }),

    // ━━ スタッフ管理 ━━
    hireStaff: (key) => {
        const state = get();
        const template = CH4_STAFF[key];
        if (!template) return;
        if (state.staff.some(s => s.skill === key)) return;
        const newStaff = [...state.staff, { id: `staff_${key}_${Date.now()}`, ...template }];
        set({
            staff: newStaff,
            totalLaborCost: newStaff.reduce((s, st) => s + (CH4_STAFF[st.skill]?.monthly || 0), 0),
        });
    },

    fireStaff: (id) => {
        const state = get();
        const newStaff = state.staff.filter(s => s.id !== id);
        set({
            staff: newStaff,
            totalLaborCost: newStaff.reduce((s, st) => s + (CH4_STAFF[st.skill]?.monthly || 0), 0),
        });
    },

    // ━━ 週次確定 ━━
    confirmWeek: () => {
        const state = get();
        const result = simulateECWeek(state);

        // ゲームオーバー判定（資金ゼロ以下）
        if (result.money < 0) {
            const exitData = calculateExitValue({ ...state, ...result });
            const skills = evaluateCh4Skills({ ...state, ...result });
            set({
                ...result,
                ...exitData,
                skills,
                exitType: 'bankruptcy',
                exitAmount: 0,
                phase: 'ch4-report',
            });
            return;
        }

        set({
            ...result,
            phase: 'ch4-results',
        });
    },

    // ━━ 次ターン ━━
    nextTurn: () => {
        const state = get();
        const nextTurn = state.turn + 1;
        const updates = { turn: nextTurn, currentEvent: null, eventResult: null };

        // ゲーム終了（Turn 76以降）
        if (nextTurn > 76) {
            const exitData = calculateExitValue(state);
            set({ ...updates, ...exitData, phase: 'ch4-exit', exitAvailable: true });
            return;
        }

        // イベント判定
        const event = getCh4EventForTurn(nextTurn, { ...state, turn: nextTurn });
        if (event) {
            updates.currentEvent = event;
            updates.phase = 'ch4-event';
            if (event._kenjiCh4Stage) updates.kenjiCh4Stage = event._kenjiCh4Stage;
            if (event.id) updates._triggeredEvents = [...(state._triggeredEvents || []), event.id];
        } else {
            updates.phase = 'ch4-dashboard';
        }

        // Phase boundary save
        const prevPhase = getCh4Phase(state.turn);
        const newPhase = getCh4Phase(nextTurn);
        if (prevPhase !== newPhase) {
            updates.savePoints = { ...(state.savePoints || {}), [prevPhase]: { turn: state.turn, money: state.money } };
        }

        set(updates);
    },

    // ━━ イベント処理 ━━
    dismissEvent: (effect) => {
        const state = get();
        const hasResponse = !!(effect?.response);
        const updates = {};

        // responseがあれば結果テキストを表示して留まる
        if (hasResponse) {
            updates.eventResult = effect.response;
        }

        // effectがない or 空のオブジェクトの場合 → ダッシュボードへ
        if (!effect || Object.keys(effect).length === 0) {
            set({ currentEvent: null, eventResult: null, phase: 'ch4-dashboard' });
            return;
        }

        for (const key in effect) {
            if (key === 'response') continue;
            switch (key) {
                case 'money':
                    updates.money = (state.money || 0) + effect.money;
                    break;
                case 'reputation':
                    updates.reputation = Math.min(5.0, Math.max(0, (state.reputation || 3.5) + effect.reputation));
                    break;
                case 'repeatBoost':
                    updates.repeatBoost = (state.repeatBoost || 0) + effect.repeatBoost;
                    break;
                case 'bonusCustomers':
                    updates.bonusCustomersThisWeek = (state.bonusCustomersThisWeek || 0) + effect.bonusCustomers;
                    break;
                case 'organicBoost':
                    updates.organicRatio = Math.min(1, (state.organicRatio || 0) + effect.organicBoost);
                    break;
                case 'consultIncome':
                    updates.consultIncome = effect.consultIncome;
                    break;
                case 'incorporateStart':
                    updates.isIncorporated = true;
                    break;
                case 'consumptionTaxEnabled':
                    updates.consumptionTaxEnabled = true;
                    break;
                case 'monthlyTax':
                    updates.monthlyTax = effect.monthlyTax;
                    break;
                case 'influencerHired':
                    updates.influencerHired = effect.influencerHired;
                    break;
                case 'wholesaleEnabled':
                    updates.wholesaleEnabled = true;
                    break;
                case 'adStopTest':
                    updates.adStopTest = true;
                    break;
                case 'adStopDeclined':
                    updates.adStopDeclined = true;
                    break;
                case 'channelRemove':
                    updates.channels = (state.channels || []).filter(c => c === 'own_ec');
                    break;
                case 'productUpgrade':
                    updates.productUpgrade = true;
                    break;
                case 'priceOverride':
                    updates.priceOverride = effect.priceOverride;
                    updates.priceOverrideExpiry = state.turn + 4;
                    break;
                case 'internationalEnabled':
                    updates.internationalEnabled = true;
                    break;
                case 'adEfficiencyBoost':
                    updates.repeatBoost = (state.repeatBoost || 0) + effect.adEfficiencyBoost;
                    break;
                default:
                    updates[key] = effect[key];
                    break;
            }
        }

        // responseがない場合は即座にダッシュボードへ
        if (!hasResponse) {
            updates.currentEvent = null;
            updates.phase = 'ch4-dashboard';
        }

        set(updates);
    },

    clearEventResult: () => set({ currentEvent: null, eventResult: null, phase: 'ch4-dashboard' }),

    // ━━ EXIT ━━
    selectExit: (type) => {
        const state = get();
        const exitData = calculateExitValue(state);
        let exitAmount = 0;

        if (type === 'mna') {
            exitAmount = Math.round(exitData.enterpriseValue * 0.70);
        } else if (type === 'ipo') {
            exitAmount = Math.round(exitData.enterpriseValue * 0.30);
        } else {
            exitAmount = Math.round(state.money * 0.8);
        }

        const skills = evaluateCh4Skills(state);

        set({
            exitType: type,
            exitAmount,
            ...exitData,
            skills,
            money: state.money + exitAmount,
            phase: 'ch4-report',
        });
    },

    getExitPreview: () => {
        const state = get();
        return calculateExitValue(state);
    },

    // ━━ ダッシュボードに戻る ━━
    backToDashboard: () => set({ phase: 'ch4-dashboard' }),
}));

export default useECStore;
