/**
 * Ch.2 ヘッドレスシミュレーション・プレイテスト
 * ブラウザを使わずに小売店経営エンジンの全フローを検証する
 *
 * 使い方: node tests/ch2_playtest.mjs
 */

import {
    INDUSTRIES, LOCATIONS, INTERIORS, SUPPLIERS, FIXED_COSTS,
    STAFF_COSTS, WEATHER_CHANCE, WEATHER_MULT, WEEKDAY_MULT,
    REPUTATION, CREDIT_TERMS, EC, CH2_EXIT_BASE_MULTIPLE,
    getCh2Phase, getSeason, SEASON_MULT, INVENTORY_STATUS,
} from '../src/data/ch2Constants.js';

import { getCh2EventForTurn, createCh2TaxEvent, KENJI_CH2_ARC } from '../src/data/ch2Events.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// ヘルパー
// ━━━━━━━━━━━━━━━━━━━━━━━━━

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

function fmt(n) { return `¥${Math.floor(n).toLocaleString()}`; }

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// SKU（商品）モデル
// ━━━━━━━━━━━━━━━━━━━━━━━━━

function createSKU(id, name, cost, price, category, industry) {
    return {
        id,
        name,
        cost,        // 仕入原価
        price,       // 売価
        category,    // 'staple' | 'seasonal' | 'trend'
        stock: 0,    // 在庫数
        totalSold: 0,
        turnsInStock: 0,
        status: 'normal',
        degradation: 0,  // 0-1
    };
}

function generateInitialSKUs(industry) {
    const ind = INDUSTRIES[industry];
    const skus = [];
    const baseNames = {
        coffee: ['ブラジルサントス', 'エチオピアモカ', 'コロンビア', 'グアテマラ', 'マンデリン', 'ケニアAA'],
        lifestyle: ['アロマキャンドル', 'レザートート', 'オーガニックタオル', 'ステンレスタンブラー', '手帳カバー', 'ルームフレグランス'],
        food: ['オリーブオイル', '岩塩セット', 'バルサミコ酢', '有機はちみつ', 'ドライフルーツ', 'スパイスセット'],
    };

    const names = baseNames[industry] || baseNames.coffee;
    for (let i = 0; i < 6; i++) {
        const cost = Math.floor(ind.avgUnit * ind.costRatio * (0.8 + Math.random() * 0.4));
        const price = Math.floor(cost / ind.costRatio);
        const category = i < 4 ? 'staple' : 'seasonal';
        skus.push(createSKU(`sku_${i}`, names[i], cost, price, category, industry));
    }
    return skus;
}

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

function simulateWeek(state) {
    const loc = LOCATIONS[state.locationKey];
    const ind = INDUSTRIES[state.industryKey];
    if (!loc || !ind) return { customers: 0, sales: 0, cogs: 0, grossProfit: 0, fixedCosts: 0, netProfit: 0, weather: 'sunny' };

    const openDays = 6;
    const weekDays = ['weekday', 'weekday', 'weekday', 'weekday', 'weekday', 'saturday', 'sunday'];

    // 天候
    const weather = pickWeather();
    const weatherMult = WEATHER_MULT[weather];

    // 季節
    const season = getSeason(state.turn);
    const seasonMult = SEASON_MULT[season];

    // 評判 → 来客補正
    const repMult = REPUTATION.getCustomerMult(state.reputation);

    // マーケ補正
    let marketingMult = 1.0;
    if (state.snsBoostTurnsLeft > 0) marketingMult *= 1.25;
    if (state.giftWrapping) marketingMult *= 1.05;

    // EC補正
    const ecMult = state.ecEnabled ? (1 + EC.salesBoostPct) : 1.0;

    // サプライチェーン危機による原価上昇
    const costHikeMult = 1.0 + (state.costHikePct || 0);

    // 価格上昇
    const priceHikeMult = 1.0 + (state.priceHikePct || 0);

    // スタッフ効率
    const staffMult = state.staff.length > 0
        ? 1 + state.staff.reduce((sum, s) => sum + (STAFF_COSTS[s.type]?.capacityMult - 1 || 0), 0)
        : 1;

    // 日来客数の計算
    let totalCustomers = 0;
    const baseDaily = loc.baseCustomers;

    for (let d = 0; d < openDays; d++) {
        const dayType = weekDays[d];
        const dayMult = WEEKDAY_MULT[dayType];
        let dailyCustomers = Math.round(
            baseDaily * repMult * weatherMult * dayMult * seasonMult * marketingMult * loc.footTraffic * staffMult
        );
        totalCustomers += Math.max(0, dailyCustomers);
    }

    // EC分の追加売上（来客数としてカウント）
    if (state.ecEnabled) {
        totalCustomers = Math.floor(totalCustomers * ecMult);
    }

    // 売上・原価の計算
    let totalSales = 0;
    let totalCOGS = 0;
    let itemsSold = 0;

    const availableSKUs = state.skus.filter(s => s.stock > 0);
    if (availableSKUs.length === 0) {
        // 品切れ時は最低限の売上（セット販売等）
        const minSale = totalCustomers * ind.avgUnit * 0.3;
        totalSales = Math.floor(minSale);
        totalCOGS = Math.floor(minSale * ind.costRatio);
    } else {
        for (let c = 0; c < totalCustomers; c++) {
            // ランダムに商品を選んで購入
            const purchaseProb = 0.55 + (state.interiorBonus || 0); // 購買率
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

    // IPO配当
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

function updateInventoryStatus(skus, turn) {
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

function restockSKUs(state) {
    // 自動補充: 在庫が20個以下のSKUを50個補充
    const ind = INDUSTRIES[state.industryKey];
    let restockCost = 0;
    for (const sku of state.skus) {
        if (sku.stock < 20) {
            const qty = 50;
            const unitCost = sku.cost * (state.supplierCostMult || 1.0);
            const cost = Math.floor(unitCost * qty);
            sku.stock += qty;
            restockCost += cost;
        }
    }
    return restockCost;
}

function calculateCh2Multiple(state) {
    let mult = CH2_EXIT_BASE_MULTIPLE;

    // 成長率
    if (state.profitHistory.length >= 8) {
        const recent = state.profitHistory.slice(-4).reduce((s, p) => s + p.profit, 0);
        const older = state.profitHistory.slice(-8, -4).reduce((s, p) => s + p.profit, 0);
        const growthRate = older > 0 ? (recent - older) / older : 0;
        if (growthRate >= 0.20) mult += 1.0;
        if (growthRate < 0) mult -= 1.0;
    }

    // 評判
    if (state.reputation >= 4.0) mult += 0.5;

    // EC
    if (state.ecEnabled) mult += 0.5;

    // スタッフ
    if (state.staff.length > 0) mult += 0.25;

    // ギフトサービス
    if (state.giftWrapping) mult += 0.25;

    return Math.max(3.0, Math.min(8.0, mult));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// CF計算書（キャッシュフロー）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
function generateCFStatement(state) {
    const recentProfits = state.profitHistory.slice(-4);
    const totalSales = recentProfits.reduce((s, p) => s + p.sales, 0);
    const totalCOGS = recentProfits.reduce((s, p) => s + (p.sales - p.profit - p.fixedCosts), 0);
    const operatingCF = recentProfits.reduce((s, p) => s + p.profit, 0);

    // 在庫増減
    const inventoryValue = state.skus.reduce((s, sku) => s + sku.stock * sku.cost, 0);
    const investingCF = -(inventoryValue - (state.prevInventoryValue || 0));

    return {
        operatingCF,
        investingCF,
        totalCF: operatingCF + investingCF,
        inventoryValue,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// プレイテスト本体
// ━━━━━━━━━━━━━━━━━━━━━━━━━

const errors = [];
const warnings = [];
const logLines = [];

function assert(condition, msg) {
    if (!condition) errors.push(`❌ ASSERT FAIL: ${msg}`);
}

function warn(msg) { warnings.push(`⚠️ ${msg}`); }
function info(msg) { logLines.push(msg); }

// ── Ch.1からの引き継ぎ状態（M&A EXIT想定） ──
const ch1Result = {
    exitType: 'mna',
    money: 10000000,       // M&A受取額
    ch1Skills: ['pl_thinking', 'break_even', 'staff_management', 'competitor_response', 'tax_knowledge', 'exit_judgment', 'cafe_experience'],
    kenjiStage: 5,         // ケンジ閉店済み
    ayaHired: true,        // アヤ雇用済み
    ipoDividend: 0,        // M&Aなので配当なし
    hiringSpeedBonus: 0,
};

info('');
info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
info('    Ch.2 ヘッドレスシミュレーション プレイテスト');
info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
info('');
info(`  Ch.1 EXIT: ${ch1Result.exitType} / 引き継ぎ金額: ${fmt(ch1Result.money)}`);
info(`  Ch.1 スキル: ${ch1Result.ch1Skills.join(', ')}`);
info(`  ケンジStage: ${ch1Result.kenjiStage} / アヤ雇用: ${ch1Result.ayaHired}`);
info('');

// ━━━━ 初期状態 ━━━━
let state = {
    chapter: 2,
    turn: 0,
    phase: 'ch2-setup-industry',
    money: ch1Result.money,
    netWorth: ch1Result.money,

    // Ch.1引き継ぎ
    exitType: ch1Result.exitType,
    ch1Skills: ch1Result.ch1Skills,
    kenjiStage: ch1Result.kenjiStage,
    ayaFromCh1: ch1Result.ayaHired && ch1Result.exitType !== 'succession',
    ipoDividend: ch1Result.ipoDividend,
    hiringSpeedBonus: ch1Result.hiringSpeedBonus,

    // セットアップ
    industryKey: null,
    locationKey: null,
    interiorGrade: null,
    interiorBonus: 0,
    rent: 0,

    // 在庫
    skus: [],
    prevInventoryValue: 0,

    // 売上
    weeklyCustomers: 0,
    weeklySales: 0,
    weeklyProfit: 0,

    // 評判
    reputation: 2.0,

    // スタッフ
    staff: [],
    totalLaborCost: 0,

    // 累計
    totalSales: 0,
    totalProfit: 0,
    profitHistory: [],
    consecutiveBlackTurns: 0,
    firstBlackTurn: null,

    // フラグ
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

    // イベント
    currentEvent: null,
    _triggeredEvents: [],

    // 判断記録
    decisions: [],
    milestonesHit: [],

    // 企業価値
    enterpriseValue: 0,
    multiple: CH2_EXIT_BASE_MULTIPLE,
    exitAvailable: false,
};

// ━━━━ STEP 1: 業種選択 ━━━━
info('▶ Step 1: 業種選択 → coffee（コーヒー豆専門店）');
state.industryKey = 'coffee';
const selectedIndustry = INDUSTRIES['coffee'];
assert(selectedIndustry, 'INDUSTRIES.coffee が存在する');
const hasCafeBonus = selectedIndustry.cafeBonus && state.ch1Skills.includes('cafe_experience');
info(`  業種: ${selectedIndustry.name}`);
info(`  仕入原価率: ${(selectedIndustry.costRatio * 100).toFixed(0)}%  粗利率: ${(selectedIndustry.grossMargin * 100).toFixed(0)}%`);
info(`  カフェ経験ボーナス: ${hasCafeBonus ? '品質目利き+20%' : 'なし'}`);
state.turn = 1;
state.decisions.push({ turn: 1, type: 'industry', label: `業種: ${selectedIndustry.name}` });

// ━━━━ STEP 2: 立地選択 ━━━━
info('');
info('▶ Step 2: 立地選択 → shopping（商店街）');
state.locationKey = 'shopping';
const loc = LOCATIONS['shopping'];
assert(loc, 'LOCATIONS.shopping が存在する');
state.rent = loc.rent;
info(`  立地: ${loc.name}, 家賃${fmt(loc.rent)}/月, 広さ${loc.floorSpace}坪`);
state.turn = 2;
state.decisions.push({ turn: 2, type: 'location', label: `立地: ${loc.name}` });

// ━━━━ STEP 3: 内装選択 ━━━━
info('');
info('▶ Step 3: 内装選択 → standard');
const interior = INTERIORS['standard'];
assert(interior, 'INTERIORS.standard が存在する');
state.interiorGrade = 'standard';
state.interiorBonus = interior.purchaseRateBonus;
state.money -= interior.cost;
info(`  内装: ${interior.name}, 費用${fmt(interior.cost)}, 購買率+${(interior.purchaseRateBonus * 100).toFixed(0)}%`);
state.decisions.push({ turn: 2, type: 'interior', label: `内装: ${interior.name}` });

// ━━━━ STEP 4: 初期仕入 ━━━━
info('');
info('▶ Step 4: 初期仕入 → 6SKU × 50個');
state.skus = generateInitialSKUs('coffee');
let initialStockCost = 0;
for (const sku of state.skus) {
    sku.stock = 50;
    initialStockCost += sku.cost * 50;
}
state.money -= initialStockCost;
state.turn = 3;
info(`  SKU数: ${state.skus.length}, 初期仕入額: ${fmt(initialStockCost)}`);
state.skus.forEach(s => info(`    ${s.name}: 原価${fmt(s.cost)} / 売価${fmt(s.price)} × ${s.stock}個`));
info(`  残金: ${fmt(state.money)}`);
state.decisions.push({ turn: 3, type: 'purchase', label: `初期仕入: ${fmt(initialStockCost)}` });

// ━━━━ STEP 5: 開業 ━━━━
info('');
info('▶ Step 5: 開業！');
state.turn = 4;
state.phase = 'ch2-dashboard';

// POS + 什器
const posCost = 100000;
const fixtureCost = 700000;
state.money -= (posCost + fixtureCost);
info(`  什器・POS費用: ${fmt(posCost + fixtureCost)}`);
info(`  残金: ${fmt(state.money)}`);

assert(state.money > 0, `開業後に資金が残っている (${fmt(state.money)})`);

let eventsTriggered = [];
let cfStatements = [];
let phaseResults = { A: [], B: [], C: [] };

// ── Turn 1-4のイベントを処理（アヤ合流等） ──
for (let earlyTurn = 1; earlyTurn <= 4; earlyTurn++) {
    state.turn = earlyTurn;
    const event = getCh2EventForTurn(earlyTurn, state);
    if (event) {
        eventsTriggered.push({ turn: earlyTurn, id: event.id, type: event.type, title: event.title });
        if (event.id) state._triggeredEvents.push(event.id);
        if (event.choices && event.choices.length > 0) {
            const choice = event.choices[0];
            applyEffect(state, choice.effect || {});
            state.decisions.push({ turn: earlyTurn, type: 'event', label: `${event.id}: ${choice.label}` });
        } else if (event.effect) {
            applyEffect(state, event.effect);
        }
        info(`  [開業前 Turn ${earlyTurn}] ${event.title} ${state.ayaJoined ? '(アヤ合流✔)' : ''
            }`);
    }
}
info(`  スタッフ: ${state.staff.length}人 / 人件費${fmt(state.totalLaborCost)}/月`);

// ━━━━ 週次ループ (Turn 5〜60) ━━━━
info('');
info('═══════════════════════════════════════');
info('  週次経営ループ開始 (Turn 5〜60)');
info('═══════════════════════════════════════');

// ── エフェクト適用ヘルパー（ループ前に定義） ──
function applyEffect(state, effect) {
    if (effect.money) state.money += effect.money;
    if (effect.reputation) state.reputation = Math.max(1, Math.min(5, state.reputation + effect.reputation));
    if (effect.hire) {
        const staffInfo = STAFF_COSTS[effect.hire];
        state.staff.push({
            id: `staff_${state.turn}`,
            name: effect.ayaJoined || state.staff.length === 0 ? 'アヤ' : `スタッフ${state.staff.length + 1}`,
            type: effect.hire,
            monthlyCost: staffInfo.monthly,
        });
        state.totalLaborCost = state.staff.reduce((s, st) => s + st.monthlyCost, 0);
    }
    if (effect.ayaJoined) state.ayaJoined = true;
    if (effect.ecEnabled) { state.ecEnabled = true; state.ecMonthlyCost = effect.ecMonthlyCost || EC.monthlyFee; }
    if (effect.snsBoost) state.snsBoostTurnsLeft = effect.snsBoostTurns || 3;
    if (effect.giftWrapping) state.giftWrapping = true;
    if (effect.supplierCostMult) state.supplierCostMult = effect.supplierCostMult;
    if (effect.supplierBankrupt) state.supplierBankrupt = true;
    if (effect.costHikePct) state.costHikePct = effect.costHikePct;
    if (effect.priceHikePct) state.priceHikePct = effect.priceHikePct;
    if (effect.seasonalStock) state.seasonalStock += effect.seasonalStock;
    if (effect.deadStockCleared) state.deadStockRemaining = 0;
    if (effect.deadStockRemaining) state.deadStockRemaining = effect.deadStockRemaining;
    if (effect.rivalStock) state.rivalStock = effect.rivalStock;
    if (effect.taxKnowledge) state.taxKnowledge = true;
    if (effect.kenjiGrowth) state.kenjiGrowth = effect.kenjiGrowth;
}

for (let turn = 5; turn <= 60; turn++) {
    state.turn = turn;
    const phase = getCh2Phase(turn);

    // ── イベント判定 ──
    try {
        const event = getCh2EventForTurn(turn, state);
        if (event) {
            eventsTriggered.push({ turn, id: event.id, type: event.type, title: event.title });

            // ケンジステージ更新
            if (event._kenjiCh2Stage) state.kenjiCh2Stage = event._kenjiCh2Stage;
            if (event.id) state._triggeredEvents.push(event.id);

            // 選択肢処理（最初の選択肢を選ぶ）
            if (event.choices && event.choices.length > 0) {
                // イベント別に最適な選択を行う
                let choiceIdx = 0;
                // 季節仕入: 少量仕入（インデックス1）
                if (event.id === 'seasonal_stock') choiceIdx = 1;
                // ライバル在庫: 断る（インデックス1）
                if (event.id === 'rival_closing') choiceIdx = 1;
                const choice = event.choices[Math.min(choiceIdx, event.choices.length - 1)];
                const effect = choice.effect || {};
                applyEffect(state, effect);
                state.decisions.push({ turn, type: 'event', label: `${event.id}: ${choice.label}` });
            } else if (event.effect) {
                applyEffect(state, event.effect);
            }
        }
    } catch (e) {
        errors.push(`❌ Turn ${turn} イベントエラー: ${e.message}`);
    }

    // ── 在庫補充（8ターンごと or 品切れ時） ──
    if (turn % 8 === 0 || state.skus.some(s => s.stock < 3)) {
        const restockCost = restockSKUs(state);
        if (restockCost > 0 && state.money >= restockCost) {
            // 掛け払い対応
            if (state.turn >= CREDIT_TERMS.availableAfterTurns && !state.creditUsed) {
                state.creditUsed = true;
            }
            state.money -= restockCost;
        } else if (restockCost > 0 && state.money < restockCost) {
            // 資金不足 → 補充スキップ（在庫を戻す）
            for (const sku of state.skus) {
                if (sku.stock > 50) sku.stock -= 50;
            }
        }
    }

    // ── 在庫劣化 ──
    for (const sku of state.skus) {
        if (selectedIndustry.shelfLife && sku.turnsInStock > selectedIndustry.shelfLife) {
            sku.degradation = Math.min(1.0, sku.degradation + 0.1);
        }
        if (selectedIndustry.trendDecay > 0) {
            sku.degradation = Math.min(1.0, sku.degradation + selectedIndustry.trendDecay);
        }
    }

    // ── 在庫ステータス更新 ──
    updateInventoryStatus(state.skus, turn);

    // ── 週シミュレーション ──
    try {
        const result = simulateWeek(state);

        assert(result.customers >= 0, `Turn ${turn}: 来客数 >= 0`);
        assert(result.sales >= 0, `Turn ${turn}: 売上 >= 0`);
        assert(!isNaN(result.netProfit), `Turn ${turn}: 純利益がNaNでない`);

        state.weeklyCustomers = result.customers;
        state.weeklySales = result.sales;
        state.weeklyProfit = result.netProfit;
        state.money += result.netProfit;
        state.totalSales += result.sales;
        state.totalProfit += result.netProfit;

        const isBlack = result.netProfit > 0;
        state.consecutiveBlackTurns = isBlack ? state.consecutiveBlackTurns + 1 : 0;
        if (state.firstBlackTurn === null && isBlack) {
            state.firstBlackTurn = turn;
            state.milestonesHit.push({ type: 'first_black', turn, value: result.netProfit });
        }

        state.profitHistory.push({
            turn,
            sales: result.sales,
            profit: result.netProfit,
            fixedCosts: result.fixedCosts,
            customers: result.customers,
        });

        // 評判更新（下限1.5で底張り付き防止）
        const salesTarget = loc.baseCustomers * selectedIndustry.avgUnit * 6 * 0.3;
        if (result.sales >= salesTarget) {
            state.reputation += REPUTATION.growthPerTurn;
        } else {
            state.reputation += REPUTATION.decayPerTurn;
        }
        state.reputation = Math.max(1.5, Math.min(REPUTATION.max, state.reputation));

        // 仕入先倒産コストの自然減衰（5ターンごとに正常化）
        if (state.supplierCostMult > 1.0 && turn % 5 === 0) {
            state.supplierCostMult = Math.max(1.0, state.supplierCostMult - 0.03);
        }
        // サプライチェーン危機コストの減衰
        if (state.costHikePct > 0 && turn % 4 === 0) {
            state.costHikePct = Math.max(0, state.costHikePct - 0.05);
        }

        // SNSブースト減衰
        if (state.snsBoostTurnsLeft > 0) state.snsBoostTurnsLeft--;

        // 企業価値計算
        const recentProfits = state.profitHistory.slice(-12);
        const avgProfit = recentProfits.length > 0
            ? recentProfits.reduce((s, p) => s + p.profit, 0) / recentProfits.length
            : 0;
        const annualProfit = avgProfit * 52;
        state.multiple = calculateCh2Multiple(state);
        state.enterpriseValue = Math.max(0, Math.floor(annualProfit * state.multiple));

        // 在庫価値記録（CF計算用）
        state.prevInventoryValue = state.skus.reduce((s, sku) => s + sku.stock * sku.cost, 0);

        // ログ
        phaseResults[phase].push(result);

        if (turn % 5 === 0 || turn === 5 || turn === 60) {
            const invValue = state.skus.reduce((s, sku) => s + sku.stock * sku.cost, 0);
            info(`  [Turn ${turn}|${phase}] 売上${fmt(result.sales)} / 利益${fmt(result.netProfit)} / 残金${fmt(state.money)} / 評判${state.reputation.toFixed(2)} / 来客${result.customers}人 / EV${fmt(state.enterpriseValue)} / 在庫${fmt(invValue)}`);
        }

        // Phase境界ログ
        if (turn === 16) {
            info('');
            info('  ────── Phase A → B 境界 ──────');
            const cf = generateCFStatement(state);
            info(`  営業CF: ${fmt(cf.operatingCF)} / 投資CF: ${fmt(cf.investingCF)} / 合計CF: ${fmt(cf.totalCF)}`);
            info(`  在庫評価額: ${fmt(cf.inventoryValue)}`);
            cfStatements.push({ turn, ...cf });
            info('');
        }
        if (turn === 40) {
            info('');
            info('  ────── Phase B → C 境界 ──────');
            const cf = generateCFStatement(state);
            info(`  営業CF: ${fmt(cf.operatingCF)} / 投資CF: ${fmt(cf.investingCF)} / 合計CF: ${fmt(cf.totalCF)}`);
            info(`  在庫評価額: ${fmt(cf.inventoryValue)}`);
            cfStatements.push({ turn, ...cf });
            info('');
        }

    } catch (e) {
        errors.push(`❌ Turn ${turn} simulateWeek error: ${e.message}\n${e.stack?.split('\n').slice(0, 3).join('\n')}`);
    }
}

// applyEffect は上部のループ前に定義済み

// ━━━━ 税金計算テスト ━━━━
info('');
info('▶ 税金計算テスト');
try {
    const tax = createCh2TaxEvent(state);
    assert(tax.yearlyIncome !== undefined, '年間所得が定義されている');
    assert(tax.totalTax >= 0, '合計税額 >= 0');
    assert(!isNaN(tax.totalTax), '合計税額がNaNでない');
    info(`  年間所得: ${fmt(tax.yearlyIncome)}`);
    info(`  課税所得: ${fmt(tax.taxableIncome)}`);
    info(`  合計税負担: ${fmt(tax.totalTax)}`);
} catch (e) {
    errors.push(`❌ 税金計算エラー: ${e.message}`);
}

// ━━━━ EXIT テスト ━━━━
info('');
info('▶ EXIT テスト');
const ev = state.enterpriseValue;
const mnaAmount = Math.floor(ev * 0.70);
const ipoAmount = Math.floor(ev * 0.40);
const successAmount = Math.floor(ev * 0.30);
const liqAmount = Math.floor(state.money * 0.40);

assert(ev >= 0, `企業価値 >= 0 (${fmt(ev)})`);
assert(!isNaN(ev), '企業価値がNaNでない');
info(`  企業価値: ${fmt(ev)} (倍率${state.multiple.toFixed(1)}x)`);
info(`  M&A: ${fmt(mnaAmount)}`);
info(`  IPO: ${fmt(ipoAmount)}`);
info(`  事業承継: ${fmt(successAmount)}`);
info(`  清算: ${fmt(liqAmount)}`);
info(`  M&A後純資産: ${fmt(state.money + mnaAmount)}`);

// ━━━━ 在庫状況サマリ ━━━━
info('');
info('▶ 在庫状況サマリ');
const statusCounts = { hot: 0, normal: 0, slow: 0, dead: 0, stockout: 0 };
state.skus.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
Object.entries(statusCounts).forEach(([status, count]) => {
    const inv = INVENTORY_STATUS[status];
    info(`  ${inv?.color || '?'} ${inv?.label || status}: ${count} SKU`);
});
const totalInventoryValue = state.skus.reduce((s, sku) => s + sku.stock * sku.cost, 0);
info(`  在庫合計金額: ${fmt(totalInventoryValue)}`);

// ━━━━ CF計算書最終 ━━━━
info('');
info('▶ CF計算書（最終）');
const finalCF = generateCFStatement(state);
info(`  営業CF: ${fmt(finalCF.operatingCF)}`);
info(`  投資CF: ${fmt(finalCF.investingCF)}`);
info(`  合計CF: ${fmt(finalCF.totalCF)}`);

// ━━━━ ケンジアーク検証 ━━━━
info('');
info('▶ ケンジアーク検証');
assert(KENJI_CH2_ARC.length === 5, `ケンジアーク5段階 (実際: ${KENJI_CH2_ARC.length})`);
info(`  ケンジCh.2ステージ: ${state.kenjiCh2Stage}`);

// ━━━━ Phase別分析 ━━━━
info('');
info('▶ Phase別分析');
for (const [phase, results] of Object.entries(phaseResults)) {
    if (results.length === 0) continue;
    const avgSales = Math.floor(results.reduce((s, r) => s + r.sales, 0) / results.length);
    const avgProfit = Math.floor(results.reduce((s, r) => s + r.netProfit, 0) / results.length);
    const avgCustomers = Math.floor(results.reduce((s, r) => s + r.customers, 0) / results.length);
    info(`  Phase ${phase}: ${results.length}ターン / 平均売上${fmt(avgSales)} / 平均利益${fmt(avgProfit)} / 平均来客${avgCustomers}人`);
}

// ━━━━ イベント統計 ━━━━
info('');
info('▶ イベント統計');
info(`  トリガーされたイベント: ${eventsTriggered.length}件`);
const byType = {};
eventsTriggered.forEach(e => { byType[e.type] = (byType[e.type] || 0) + 1; });
Object.entries(byType).forEach(([type, count]) => {
    info(`    ${type}: ${count}件`);
});
eventsTriggered.forEach(e => {
    info(`    [Turn ${e.turn}] ${e.type}: ${e.title}`);
});

// ━━━━ 設計書整合性チェック ━━━━
info('');
info('▶ 設計書整合性チェック');

// Phase A終了時点
const phaseAEndProfit = phaseResults.A.reduce((s, r) => s + r.netProfit, 0);
info(`  Phase A 累計利益: ${fmt(phaseAEndProfit)}`);

// Phase B終了時点
const phaseBEndProfit = phaseResults.B.reduce((s, r) => s + r.netProfit, 0);
info(`  Phase B 累計利益: ${fmt(phaseBEndProfit)}`);

// EXIT金額が設計書の想定範囲内か
const expectedMnaMin = 10500000;
const expectedMnaMax = 17500000;
if (mnaAmount < expectedMnaMin * 0.5) {
    warn(`M&A受取額 ${fmt(mnaAmount)} が設計書想定の50%未満 (期待: ${fmt(expectedMnaMin)}〜${fmt(expectedMnaMax)})`);
}
if (mnaAmount > expectedMnaMax * 2) {
    warn(`M&A受取額 ${fmt(mnaAmount)} が設計書想定の200%超過`);
}

// 破産チェック
const minMoney = Math.min(...state.profitHistory.map((_, i) => {
    let m = ch1Result.money - interior.cost - initialStockCost - posCost - fixtureCost;
    for (let j = 0; j <= i; j++) m += state.profitHistory[j].profit;
    return m;
}));
if (minMoney < 0) {
    warn(`ゲーム中に破産ポイントあり！ 最低現金: ${fmt(minMoney)}`);
}

// ━━━━ レポートデータ検証 ━━━━
info('');
info('▶ レポートデータ検証');
assert(state.profitHistory.length > 0, 'profitHistory が空でない');
assert(state.decisions.length > 0, 'decisions が空でない');
assert(!isNaN(state.money), '最終残金がNaNでない');

const avgSales = Math.floor(state.profitHistory.reduce((s, p) => s + p.sales, 0) / state.profitHistory.length);
const avgProfit = Math.floor(state.profitHistory.reduce((s, p) => s + p.profit, 0) / state.profitHistory.length);
info(`  総ターン数: ${state.profitHistory.length}`);
info(`  累計売上: ${fmt(state.totalSales)}`);
info(`  累計利益: ${fmt(state.totalProfit)}`);
info(`  平均週売上: ${fmt(avgSales)}`);
info(`  平均週利益: ${fmt(avgProfit)}`);
info(`  最終現金: ${fmt(state.money)}`);
info(`  最終評判: ${state.reputation.toFixed(2)}`);
info(`  スタッフ: ${state.staff.length}人`);
info(`  判断記録: ${state.decisions.length}件`);
info(`  マイルストーン: ${state.milestonesHit.length}件`);

// ━━━━ 結果出力 ━━━━
info('');
info('═══════════════════════════════════════');
info('  テスト結果');
info('═══════════════════════════════════════');

if (errors.length === 0) {
    info('');
    info('✅ 全テスト合格！ エラーなし。');
} else {
    info('');
    errors.forEach(e => info(e));
}

if (warnings.length > 0) {
    info('');
    warnings.forEach(w => info(w));
}

info('');
info(`  エラー: ${errors.length}件 / 警告: ${warnings.length}件`);
info('');

// 出力
console.log(logLines.join('\n'));

if (errors.length > 0) {
    process.exit(1);
}
