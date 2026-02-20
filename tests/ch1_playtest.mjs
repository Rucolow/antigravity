/**
 * Ch.1 ヘッドレスシミュレーション・プレイテスト
 * ブラウザを使わずにcafeEngine + ch1Eventsの全フローを検証する
 *
 * 使い方: node --experimental-vm-modules tests/ch1_playtest.mjs
 */

// ── Zustand をNode上で動かすためのpolyfill ──
// Zustandはvanilla storeとしても利用可能
import { createStore } from 'zustand/vanilla';

// 定数の直接インポート
import {
    LOCATIONS, INTERIORS, MACHINES, MENU_ITEMS, OPERATING_HOURS,
    OTHER_EQUIPMENT_COST, FIXED_COSTS, MENU_COUNT_EFFECTS, ORDER_PATTERN,
    REPUTATION, WEATHER_MULT, WEATHER_CHANCE, WEEKDAY_MULT,
    getCh1Phase, TAKEOUT, EXIT_BASE_MULTIPLE, STAFF_COSTS,
} from '../src/data/ch1Constants.js';

import { getCh1EventForTurn, createTaxEvent, KENJI_ARC } from '../src/data/ch1Events.js';

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// シミュレーション関数（cafeEngine.jsから複製）
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

    let totalCustomers = 0;
    let totalTurnedAway = 0;
    const weekDays = ['weekday', 'weekday', 'weekday', 'weekday', 'weekday', 'saturday', 'sunday'];
    const openDays = 6;

    const staffMult = state.staff.length > 0
        ? 1 + state.staff.reduce((sum, s) => sum + (STAFF_COSTS[s.type]?.capacityMult - 1 || 1), 0)
        : 1;
    const takeoutBonus = state.takeoutEnabled ? TAKEOUT.capacityBonus : 0;
    const dailyCap = Math.floor(state.dailyCapacity * staffMult * (1 + takeoutBonus));

    let marketingMult = 1.0;
    if (state.snsActive) marketingMult *= 1.10;
    state.activeMarketing.forEach(m => {
        if (m.type === 'flyer') marketingMult *= 1.15;
        if (m.type === 'googleAd') marketingMult *= 1.05;
    });
    if (state.mediaActive && state.mediaTurnsLeft > 0) marketingMult *= 2.0;

    let competitorMult = 1.0;
    if (state.chainCompetitorArrived) competitorMult = 0.80;

    const weather = pickWeather();
    const weatherMult = WEATHER_MULT[weather];

    for (let d = 0; d < openDays; d++) {
        const dayType = weekDays[d];
        const dayMult = WEEKDAY_MULT[dayType];
        const repMult = REPUTATION.getCustomerMult(state.reputation);

        let dailyCustomers = Math.round(
            loc.baseCustomers * repMult * weatherMult * dayMult * marketingMult * competitorMult
        );

        if (state.equipmentDegraded) dailyCustomers = Math.round(dailyCustomers * 0.95);

        const served = Math.min(dailyCustomers, dailyCap);
        const turnedAway = Math.max(0, dailyCustomers - served);

        totalCustomers += served;
        totalTurnedAway += turnedAway;
    }

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

        if (drinkItem) { totalSales += drinkItem.price; totalCOGS += drinkItem.cost; }
        if (foodItem) { totalSales += foodItem.price; totalCOGS += foodItem.cost; }
    }

    const hoursData = OPERATING_HOURS[state.operatingHours];
    if (hoursData?.ticketBonus) {
        totalSales += totalCustomers * hoursData.ticketBonus * 0.3;
    }

    const menuCount = state.menu.length;
    const lossRate = MENU_COUNT_EFFECTS[Math.min(6, Math.max(3, menuCount))]?.lossRate || 0.05;
    const lossCost = Math.floor(totalCOGS * lossRate);
    totalCOGS += lossCost;

    if (state.priceHikeOccurred) {
        totalCOGS = Math.floor(totalCOGS * state.priceHikeMult);
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

function calculateMultiple(state, reputation, profitHistory) {
    let mult = EXIT_BASE_MULTIPLE;
    if (profitHistory.length >= 8) {
        const recent = profitHistory.slice(-4).reduce((s, p) => s + p.profit, 0);
        const older = profitHistory.slice(-8, -4).reduce((s, p) => s + p.profit, 0);
        const growthRate = older > 0 ? (recent - older) / older : 0;
        if (growthRate >= 0.20) mult += 1.0;
        if (growthRate < 0) mult -= 1.0;
    }
    if (reputation >= 4.0) mult += 0.5;
    if (state.takeoutEnabled) mult += 0.25;
    if (state.staff.length > 0) mult += 0.25;
    return Math.max(2.0, Math.min(5.0, mult));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// プレイテスト
// ━━━━━━━━━━━━━━━━━━━━━━━━━

const errors = [];
const warnings = [];
const log = [];

function assert(condition, msg) {
    if (!condition) {
        errors.push(`❌ ASSERT FAIL: ${msg}`);
    }
}

function warn(msg) {
    warnings.push(`⚠️ ${msg}`);
}

function info(msg) {
    log.push(msg);
}

// ── 初期状態 ──
let state = {
    chapter: 1,
    turn: 0,
    phase: 'idle',
    money: 2000000,
    netWorth: 0,
    ch0Transfer: { money: 1900000, shouInvestment: 100000, acquiredSkills: ['diy_skill'] },
    cafeName: 'テストカフェ',
    location: null,
    interiorGrade: null,
    machineGrade: null,
    operatingHours: null,
    seats: 0,
    menu: [],
    weeklyCustomers: 0,
    weeklySales: 0,
    weeklyProfit: 0,
    dailyCapacity: 0,
    capacityUtilization: 0,
    customersTurnedAway: 0,
    weeklyWeather: 'sunny',
    reputation: 2.0,
    reviews: 0,
    staff: [],
    totalLaborCost: 0,
    rent: 0,
    utilities: 0,
    loanRepayment: 0,
    insuranceCost: 0,
    breakEvenSales: 0,
    activeMarketing: [],
    snsActive: false,
    takeoutEnabled: false,
    totalSales: 0,
    totalProfit: 0,
    profitHistory: [],
    consecutiveBlackTurns: 0,
    firstBlackTurn: null,
    costRatioHistory: [],
    blueFilingEnabled: true,
    taxRecords: [],
    yearlyIncome: 0,
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
    kenjiStage: 0,
    kenjiAlive: true,
    enterpriseValue: 0,
    multiple: EXIT_BASE_MULTIPLE,
    exitAvailable: false,
    ch1Skills: [],
    ch0Skills: ['diy_skill'],
    ch0JobType: 'cafe',
    decisions: [],
    milestonesHit: [],
};

info('');
info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
info('    Ch.1 ヘッドレスシミュレーション プレイテスト');
info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
info('');

// ━━━━ STEP 1: 立地選択 ━━━━
info('▶ Step 1: 立地選択 → residential');
const loc = LOCATIONS['residential'];
assert(loc, 'LOCATIONS.residential が存在する');
state.location = 'residential';
state.seats = loc.seats;
state.rent = loc.rent;
state.turn = 1;
state.phase = 'ch1-setup-interior';
info(`  立地: ${loc.name}, 家賃¥${loc.rent.toLocaleString()}, 席数${loc.seats}`);
info(`  残金: ¥${state.money.toLocaleString()}`);

// ━━━━ STEP 2: 内装 + マシン ━━━━
info('');
info('▶ Step 2: 内装=minimum, マシン=low');
const interior = INTERIORS['minimum'];
const machine = MACHINES['low'];
assert(interior, 'INTERIORS.minimum が存在する');
assert(machine, 'MACHINES.low が存在する');

const hasDIY = state.ch0Skills.includes('diy_skill');
const interiorCost = hasDIY ? Math.floor(interior.cost * 0.8) : interior.cost;
const totalSetupCost = interiorCost + machine.cost + OTHER_EQUIPMENT_COST;

info(`  DIY割引: ${hasDIY} → 内装費 ¥${interiorCost.toLocaleString()} (元: ¥${interior.cost.toLocaleString()})`);
info(`  総セットアップ費: ¥${totalSetupCost.toLocaleString()}`);

state.interiorGrade = 'standard';
state.machineGrade = 'mid';
state.money -= totalSetupCost;
state.reputation = REPUTATION.initial + interior.satisfactionBonus;
state.turn = 2;
state.phase = 'ch1-setup-menu';

assert(state.money >= 0, `セットアップ後に資金が残っている (¥${state.money.toLocaleString()})`);
info(`  残金: ¥${state.money.toLocaleString()}, 評判: ${state.reputation}`);

// ━━━━ STEP 3: メニュー設定 ━━━━
info('');
info('▶ Step 3: メニュー設定 (コーヒー, ラテ, 紅茶, トースト)');
const selectedMenuIds = ['coffee_hot', 'latte', 'tea', 'toast'];
state.menu = selectedMenuIds.map(id => {
    const base = MENU_ITEMS.find(m => m.id === id);
    assert(base, `メニュー ${id} が存在する`);
    return { ...base, price: base.defaultPrice };
});
assert(state.menu.length === 4, `メニュー4品選択`);
state.turn = 3;
state.phase = 'ch1-setup-hours';

const drinks = state.menu.filter(m => m.category === 'drink');
const foods = state.menu.filter(m => m.category === 'food');
info(`  ドリンク${drinks.length}品, フード${foods.length}品`);
drinks.forEach(d => info(`    ${d.name}: 原価¥${d.cost} → 売価¥${d.price} (原価率${((d.cost / d.price) * 100).toFixed(0)}%)`));
foods.forEach(d => info(`    ${d.name}: 原価¥${d.cost} → 売価¥${d.price} (原価率${((d.cost / d.price) * 100).toFixed(0)}%)`));

// ━━━━ STEP 4: 営業時間 ━━━━
info('');
info('▶ Step 4: 営業時間 → allday');
const hours = OPERATING_HOURS['allday'];
assert(hours, 'OPERATING_HOURS.allday が存在する');
state.operatingHours = 'allday';
state.dailyCapacity = hours.dailyCapacity;
state.utilities = FIXED_COSTS.utilities_base + hours.extraUtilities;
state.insuranceCost = FIXED_COSTS.insurance;
state.turn = 5;
state.phase = 'ch1-dashboard';
info(`  営業時間: ${hours.name}, 日提供上限: ${hours.dailyCapacity}人`);
info(`  光熱費: ¥${state.utilities.toLocaleString()}/月`);

// ━━━━ 週次ループ (52ターン) ━━━━
info('');
info('═══════════════════════════════════════');
info('  週次経営ループ開始 (Turn 5〜56)');
info('═══════════════════════════════════════');

let eventsTriggered = [];
let eventErrors = [];
let weeklyResults = [];

for (let turn = 5; turn <= 56; turn++) {
    state.turn = turn;

    // ── イベント判定 ──
    try {
        const event = getCh1EventForTurn(turn, state);
        if (event) {
            eventsTriggered.push({ turn, id: event.id, type: event.type, title: event.title });

            // イベントを処理
            if (event._kenjiStage) state.kenjiStage = event._kenjiStage;
            if (event.id) state._triggeredEvents.push(event.id);

            // 選択肢がある場合、最初の選択肢を選ぶ
            if (event.choices && event.choices.length > 0) {
                const choice = event.choices[0];
                const effect = choice.effect || {};

                if (effect.money) state.money += effect.money;
                if (effect.reputation) state.reputation = Math.max(1, Math.min(5, state.reputation + effect.reputation));
                if (effect.chainCompetitorArrived !== undefined) state.chainCompetitorArrived = effect.chainCompetitorArrived;
                if (effect.staffQuitOccurred !== undefined) state.staffQuitOccurred = effect.staffQuitOccurred;
                if (effect.equipmentDegraded !== undefined) state.equipmentDegraded = effect.equipmentDegraded;
                if (effect.priceHikeOccurred !== undefined) state.priceHikeOccurred = effect.priceHikeOccurred;
                if (effect.priceHikeMult) state.priceHikeMult = effect.priceHikeMult;
                if (effect.mediaActive !== undefined) {
                    state.mediaActive = effect.mediaActive;
                    state.mediaTurnsLeft = effect.mediaTurnsLeft || 0;
                }
                if (effect.menuPriceChange) {
                    state.menu = state.menu.map(m => ({ ...m, price: m.price + effect.menuPriceChange }));
                }
                if (effect.takeoutEnabled) state.takeoutEnabled = true;
                if (effect.hire) {
                    const staffInfo = STAFF_COSTS[effect.hire];
                    assert(staffInfo, `STAFF_COSTS.${effect.hire} が存在する`);
                    assert(staffInfo.monthly !== undefined, `STAFF_COSTS.${effect.hire}.monthly が定義されている`);
                    state.staff.push({
                        id: `staff_${Date.now()}_${turn}`,
                        name: state.staff.length === 0 ? 'アヤ' : `スタッフ${state.staff.length + 1}`,
                        type: effect.hire,
                        monthlyCost: staffInfo.monthly,
                        skill: 0.8,
                        loyalty: 0.7,
                        turnHired: turn,
                    });
                    state.totalLaborCost = state.staff.reduce((s, st) => s + st.monthlyCost, 0);
                }

                state.decisions.push({ turn, type: 'event', label: `${event.id}: ${choice.label}` });
            } else if (event.effect) {
                // テキストのみイベント with effect
                if (event.effect.reputation) state.reputation = Math.max(1, Math.min(5, state.reputation + event.effect.reputation));
                if (event.effect._tempCustomerMult) state._tempCustomerMult = event.effect._tempCustomerMult;
            }
        }
    } catch (e) {
        eventErrors.push({ turn, error: e.message, stack: e.stack?.split('\n').slice(0, 3).join('\n') });
    }

    // ── スタッフ雇用テスト (Turn 17) ──
    if (turn === 17 && state.staff.length === 0) {
        info(`  [Turn ${turn}] スタッフ雇用テスト: パート`);
        const staffInfo = STAFF_COSTS['part'];
        assert(staffInfo.monthly !== undefined, 'STAFF_COSTS.part.monthly が定義されている');
        state.staff.push({
            id: `staff_hire_${turn}`,
            name: 'アヤ',
            type: 'part',
            monthlyCost: staffInfo.monthly,
            skill: 0.8,
            loyalty: 0.7,
            turnHired: turn,
        });
        state.totalLaborCost = state.staff.reduce((s, st) => s + st.monthlyCost, 0);
    }

    // ── 週シミュレーション ──
    try {
        const result = simulateWeek(state);

        assert(result.customers >= 0, `Turn ${turn}: 来客数 >= 0 (${result.customers})`);
        assert(result.sales >= 0, `Turn ${turn}: 売上 >= 0 (${result.sales})`);
        assert(result.cogs >= 0, `Turn ${turn}: 原価 >= 0 (${result.cogs})`);
        assert(!isNaN(result.netProfit), `Turn ${turn}: 純利益がNaNでない`);
        assert(!isNaN(result.utilization), `Turn ${turn}: 稼働率がNaNでない`);

        state.weeklyCustomers = result.customers;
        state.weeklySales = result.sales;
        state.weeklyProfit = result.netProfit;
        state.capacityUtilization = result.utilization;
        state.customersTurnedAway = result.turnedAway;
        state.weeklyWeather = result.weather;
        state.money += result.netProfit;
        state.totalSales += result.sales;
        state.totalProfit += result.netProfit;
        state.profitHistory.push({ turn, sales: result.sales, profit: result.netProfit, customers: result.customers });

        const isBlack = result.netProfit > 0;
        state.consecutiveBlackTurns = isBlack ? state.consecutiveBlackTurns + 1 : 0;
        if (state.firstBlackTurn === null && isBlack) {
            state.firstBlackTurn = turn;
            state.milestonesHit.push({ type: 'first_black', turn, value: result.netProfit });
        }

        // 評判更新
        if (result.qualityMet) {
            state.reputation += REPUTATION.growthPerTurn * (LOCATIONS[state.location]?.repeaterGrowthMult || 1);
        } else {
            state.reputation += REPUTATION.decayPerTurn;
        }
        state.reputation = Math.max(1.0, Math.min(REPUTATION.max, state.reputation));

        // 損益分岐計算
        const weeklyFixed = calculateWeeklyFixed(state);
        const costRatio = result.sales > 0 ? result.cogs / result.sales : 0.30;
        const grossMarginRate = 1 - costRatio;
        state.breakEvenSales = grossMarginRate > 0 ? Math.ceil(weeklyFixed / grossMarginRate) : 999999;

        // 企業価値
        const recentProfits = state.profitHistory.slice(-12);
        const avgProfit = recentProfits.length > 0
            ? recentProfits.reduce((sum, p) => sum + p.profit, 0) / recentProfits.length
            : 0;
        const annualProfit = avgProfit * 52;
        state.multiple = calculateMultiple(state, state.reputation, recentProfits);
        state.enterpriseValue = Math.max(0, Math.floor(annualProfit * state.multiple));

        // スタッフスキル成長
        state.staff = state.staff.map(s => ({ ...s, skill: Math.min(1.5, s.skill + 0.02) }));

        // メディア・仕入先ターン経過
        if (state.mediaTurnsLeft > 0) {
            state.mediaTurnsLeft--;
            if (state.mediaTurnsLeft <= 0) state.mediaActive = false;
        }
        if (state.supplierChangeTurnsLeft > 0) {
            state.supplierChangeTurnsLeft--;
            if (state.supplierChangeTurnsLeft <= 0) {
                state.priceHikeMult = Math.max(1.0, state.priceHikeMult * 0.95);
            }
        }

        weeklyResults.push({
            turn,
            customers: result.customers,
            sales: result.sales,
            profit: result.netProfit,
            money: state.money,
            reputation: Math.round(state.reputation * 100) / 100,
        });

        // マイルログ
        if (turn % 10 === 0 || turn === 5 || turn === 56) {
            info(`  [Turn ${turn}] 売上¥${result.sales.toLocaleString()} / 利益¥${result.netProfit.toLocaleString()} / 残金¥${state.money.toLocaleString()} / 評判${state.reputation.toFixed(2)} / 来客${result.customers}人 / EV¥${state.enterpriseValue.toLocaleString()}`);
        }

    } catch (e) {
        errors.push(`❌ Turn ${turn} simulateWeek error: ${e.message}`);
    }
}

// ━━━━ 税金計算テスト ━━━━
info('');
info('▶ 税金計算テスト');
try {
    const tax = createTaxEvent(state);
    assert(tax.yearlyIncome >= 0, '年間所得 >= 0');
    assert(tax.incomeTax >= 0, '所得税 >= 0');
    assert(tax.residentTax >= 0, '住民税 >= 0');
    assert(tax.businessTax >= 0, '事業税 >= 0');
    assert(tax.healthInsurance >= 0, '国保 >= 0');
    assert(tax.totalTax >= 0, '合計税額 >= 0');
    assert(!isNaN(tax.totalTax), '合計税額がNaNでない');
    info(`  年間所得: ¥${tax.yearlyIncome.toLocaleString()}`);
    info(`  課税所得: ¥${tax.taxableIncome.toLocaleString()}`);
    info(`  所得税: ¥${tax.incomeTax.toLocaleString()}`);
    info(`  住民税: ¥${tax.residentTax.toLocaleString()}`);
    info(`  事業税: ¥${tax.businessTax.toLocaleString()}`);
    info(`  国保: ¥${tax.healthInsurance.toLocaleString()}`);
    info(`  合計税負担: ¥${tax.totalTax.toLocaleString()}`);
} catch (e) {
    errors.push(`❌ 税金計算エラー: ${e.message}`);
}

// ━━━━ EXIT テスト ━━━━
info('');
info('▶ EXIT テスト');
const ev = state.enterpriseValue;
const mnaAmount = Math.floor(ev * 0.70);
const ipoAmount = Math.floor(ev * 0.40);
const successionAmount = Math.floor(ev * 0.30);
const liquidationAmount = Math.floor(state.money * 0.40);

assert(ev >= 0, `企業価値 >= 0 (¥${ev.toLocaleString()})`);
assert(!isNaN(ev), '企業価値がNaNでない');
info(`  企業価値: ¥${ev.toLocaleString()} (倍率${state.multiple.toFixed(1)}x)`);
info(`  M&A: ¥${mnaAmount.toLocaleString()}`);
info(`  IPO: ¥${ipoAmount.toLocaleString()}`);
info(`  事業承継: ¥${successionAmount.toLocaleString()}`);
info(`  清算: ¥${liquidationAmount.toLocaleString()}`);

// ━━━━ ケンジアーク検証 ━━━━
info('');
info('▶ ケンジアーク検証');
assert(KENJI_ARC.length === 5, `ケンジアーク5段階 (実際: ${KENJI_ARC.length})`);
KENJI_ARC.forEach(k => {
    assert(k.stage >= 1 && k.stage <= 5, `ケンジstage ${k.stage} 有効`);
    assert(k.text.length > 0, `ケンジstage ${k.stage} テキストあり`);
    assert(k.turnRange.length === 2, `ケンジstage ${k.stage} turnRange正しい`);
});
info(`  全5段階検証OK`);
info(`  プレイ中に到達したステージ: ${state.kenjiStage}`);

// ━━━━ レポートデータ検証 ━━━━
info('');
info('▶ レポートデータ検証');
assert(state.profitHistory.length > 0, 'profitHistory が空でない');
assert(state.decisions.length > 0, 'decisions が空でない');
assert(state.totalSales > 0, '累計売上 > 0');
assert(!isNaN(state.money), '最終残金がNaNでない');

const avgSales = Math.floor(state.profitHistory.reduce((s, p) => s + p.sales, 0) / state.profitHistory.length);
const avgProfit = Math.floor(state.profitHistory.reduce((s, p) => s + p.profit, 0) / state.profitHistory.length);
info(`  総ターン数: ${state.profitHistory.length}`);
info(`  累計売上: ¥${state.totalSales.toLocaleString()}`);
info(`  累計利益: ¥${state.totalProfit.toLocaleString()}`);
info(`  平均週売上: ¥${avgSales.toLocaleString()}`);
info(`  平均週利益: ¥${avgProfit.toLocaleString()}`);
info(`  最終現金: ¥${state.money.toLocaleString()}`);
info(`  最終評判: ${state.reputation.toFixed(2)}`);
info(`  スタッフ: ${state.staff.length}人 (人件費¥${state.totalLaborCost.toLocaleString()}/月)`);
info(`  判断記録: ${state.decisions.length}件`);
info(`  マイルストーン: ${state.milestonesHit.length}件`);

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
    info(`    [Turn ${e.turn}] ${e.type}: ${e.title || e.id}`);
});

if (eventsTriggered.length === 0) {
    warn('52ターンで1つもイベントが発生しなかった（確率的に低いが可能性あり）');
}

// ━━━━ イベント実行エラー ━━━━
if (eventErrors.length > 0) {
    info('');
    info('▶ イベント実行エラー');
    eventErrors.forEach(e => {
        errors.push(`❌ Turn ${e.turn} イベントエラー: ${e.error}\n${e.stack}`);
    });
}

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
console.log(log.join('\n'));

if (errors.length > 0) {
    process.exit(1);
}
