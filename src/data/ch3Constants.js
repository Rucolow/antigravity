/**
 * Ch.3 宿泊業（ゲストハウス）経営シミュレーション 定数
 * 設計書: antigravity-ch3-detail-v3.md
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 物件
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const PROPERTIES = {
    tourist: {
        name: '観光地（京都風エリア）',
        totalRooms: 8,
        maxBeds: 24,
        propertyCost: 30000000,
        loanPayment: 150000,     // 月額ローン返済
        seasonSwing: 'large',    // 季節変動幅
        peakMult: 2.0,
        offMult: 0.4,
        baseOccupancy: 0.25,     // 初期稼働率ベース
        inboundBonus: true,
        renovationCost: 0,
    },
    business: {
        name: 'ビジネス街（都市型）',
        totalRooms: 12,
        maxBeds: 24,
        propertyCost: 20000000,
        loanPayment: 100000,
        seasonSwing: 'small',
        peakMult: 1.3,
        offMult: 0.8,
        baseOccupancy: 0.35,
        inboundBonus: false,
        renovationCost: 0,
    },
    resort: {
        name: '海辺のリゾート',
        totalRooms: 6,
        maxBeds: 18,
        propertyCost: 15000000,
        loanPayment: 75000,
        seasonSwing: 'extreme',
        peakMult: 3.0,
        offMult: 0.2,
        baseOccupancy: 0.15,
        inboundBonus: false,
        renovationCost: 5000000,
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 客室プリセット
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const ROOM_PRESETS = {
    balanced: {
        name: 'バランス型',
        desc: 'ドミトリー50% + 個室スタンダード37% + プレミアム13%',
        // 各物件のtotalRoomsに応じて生成される
        distribution: { dormitory: 0.50, standard: 0.37, premium: 0.13 },
        setupCostPerRoom: { dormitory: 800000, standard: 500000, premium: 1200000 },
        adr: { dormitory: 4000, standard: 10000, premium: 20000 },
        occupancyBonus: 0,
    },
    backpacker: {
        name: 'バックパッカー型',
        desc: 'ドミトリー75% + 個室スタンダード25%。稼働率重視',
        distribution: { dormitory: 0.75, standard: 0.25, premium: 0 },
        setupCostPerRoom: { dormitory: 800000, standard: 500000, premium: 1200000 },
        adr: { dormitory: 3500, standard: 8000, premium: 0 },
        occupancyBonus: 0.10,     // 稼働率+10%
    },
    luxury: {
        name: '高級志向型',
        desc: '個室スタンダード50% + プレミアム50%。高ADR狙い',
        distribution: { dormitory: 0, standard: 0.50, premium: 0.50 },
        setupCostPerRoom: { dormitory: 800000, standard: 500000, premium: 1200000 },
        adr: { dormitory: 0, standard: 12000, premium: 25000 },
        occupancyBonus: -0.10,    // 稼働率-10%（高価格帯）
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 共用施設
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const FACILITIES = {
    lounge: { name: 'ラウンジ', cost: 500000, reputationBonus: 0.3, effect: 'satisfaction' },
    kitchen: { name: '共用キッチン', cost: 300000, reputationBonus: 0, effect: 'backpacker_demand', demandBonus: 0.20 },
    laundry: { name: 'コインランドリー', cost: 200000, reputationBonus: 0, effect: 'extended_stay', stayBonus: 0.10 },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// OTA掲載レベル
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const OTA_LEVELS = {
    high: {
        name: 'フル掲載（Booking.com + 楽天 + Airbnb）',
        commissionRate: 0.15,
        reachPower: 1.5,        // 集客倍率
        initialDependency: 0.90,
    },
    mid: {
        name: '2サイト掲載（Booking.com + 楽天）',
        commissionRate: 0.13,
        reachPower: 1.2,
        initialDependency: 0.75,
    },
    low: {
        name: '1サイト掲載（Airbnb のみ）',
        commissionRate: 0.08,
        reachPower: 0.8,
        initialDependency: 0.50,
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 固定費（月額）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH3_FIXED_COSTS = {
    utilities_base: 60000,      // 光熱費ベース
    insurance: 15000,
    communication_pms: 15000,   // 通信費+PMS
    repairReserve: 30000,       // 修繕積立
    otaBase: 10000,             // OTA基本料
    cleaning_supplies: 25000,   // 清掃消耗品
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 変動費（1室泊あたり）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH3_VARIABLE_COSTS = {
    amenity: 500,               // アメニティ
    linen: 700,                 // リネンクリーニング
    breakfast: 600,             // 朝食原価（提供時のみ）
    breakfastPrice: 1200,       // 朝食売価
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 季節カレンダー（月別係数）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const SEASON_CALENDAR = [
    { month: 1, label: '1月 正月後', base: 0.4 },
    { month: 2, label: '2月 閑散期', base: 0.3 },
    { month: 3, label: '3月 春休み', base: 0.8 },
    { month: 4, label: '4月 桜シーズン', base: 1.0 },
    { month: 5, label: '5月 GW', base: 1.2 },
    { month: 6, label: '6月 梅雨', base: 0.5 },
    { month: 7, label: '7月 夏休み開始', base: 1.5 },
    { month: 8, label: '8月 ピーク', base: 2.0 },
    { month: 9, label: '9月 SW後急落', base: 0.8 },
    { month: 10, label: '10月 紅葉', base: 1.0 },
    { month: 11, label: '11月 やや落着', base: 0.9 },
    { month: 12, label: '12月 年末', base: 1.3 },
];

// 物件タイプごとの季節補正
export function getSeasonMultiplier(turn, propertyKey) {
    const prop = PROPERTIES[propertyKey];
    if (!prop) return 1.0;
    const monthIdx = Math.floor((turn - 1) / 4) % 12;
    const baseMult = SEASON_CALENDAR[monthIdx].base;

    // 物件タイプで振れ幅を調整
    if (prop.seasonSwing === 'small') {
        // ビジネス街：振れ幅を圧縮 (0.79-1.30)
        // 中央値1.0付近に寄せつつ方向は維持
        return 0.7 + baseMult * 0.3;
    }
    if (prop.seasonSwing === 'extreme') {
        // リゾート：夏に極端に伸ばし冬に極端に減らす
        return Math.max(0.15, baseMult * (baseMult >= 1.5 ? 1.5 : 0.7));
    }
    // 観光地：そのまま
    return baseMult;
}

export function getCh3Month(turn) {
    const monthIdx = Math.floor((turn - 1) / 4) % 12;
    return SEASON_CALENDAR[monthIdx];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// スタッフ
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH3_STAFF = {
    cleaning: { name: '清掃スタッフ', monthly: 100000, capacityBonus: 4, skill: 'cleaning' },
    front: { name: 'フロントスタッフ', monthly: 150000, capacityBonus: 6, skill: 'front' },
    multi: { name: 'マルチスタッフ', monthly: 180000, capacityBonus: 6, skill: 'multi' },
};

// ワンオペ限界
export const SOLO_ROOM_LIMIT = 6;

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 価格弾力性
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const PRICING_ELASTICITY = {
    // 価格が基準の X% のとき稼働率への影響
    priceDown10: 0.15,    // -10%値下げ → 需要+15%
    priceUp10: -0.12,     // +10%値上げ → 需要-12%
    peakDampen: 0.5,      // 繁忙期は弾力性が半減
    offAmplify: 1.5,      // 閑散期は弾力性が1.5倍
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 評判（口コミ）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH3_REPUTATION = {
    initial: 3.0, // Ch.2より少し高めスタート（カフェ・小売の実績）
    max: 5.0,
    growthPerTurn: 0.06,
    decayPerTurn: -0.04,
    getOccupancyMult: (rep) => 0.5 + (rep / 5.0) * 0.8,  // rep=3→0.98, rep=5→1.30
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 天候
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH3_WEATHER_CHANCE = { sunny: 0.45, cloudy: 0.25, rainy: 0.20, storm: 0.10 };
export const CH3_WEATHER_MULT = { sunny: 1.0, cloudy: 0.95, rainy: 0.75, storm: 0.3 };

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 曜日
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH3_WEEKDAY_MULT = {
    monday: 0.6, tuesday: 0.6, wednesday: 0.6, thursday: 0.7,
    friday: 1.0, saturday: 1.4, sunday: 1.1,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 直販チャネル
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const DIRECT_BOOKING = {
    initialRatio: 0.05,          // 初期直販率5%
    growthPerTurn: 0.005,        // 毎ターン0.5%成長（自然）
    selfSiteBoost: 0.02,        // 自社サイト構築後+2%/ターン
    snsBoost: 0.015,            // SNS活用時+1.5%/ターン
    repeaterBoost: 0.01,        // リピーター施策+1%/ターン
    maxRatio: 0.60,             // 最大60%
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function getCh3Phase(turn) {
    if (turn <= 16) return 'A';
    if (turn <= 48) return 'B';
    return 'C';
}

export const CH3_PHASES = {
    A: { label: 'フェーズA: 開業〜稼働率との戦い', turns: '1-16' },
    B: { label: 'フェーズB: 成長〜価格戦略', turns: '17-48' },
    C: { label: 'フェーズC: 最適化〜EXIT', turns: '49-68' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// EXIT マルチプル
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH3_EXIT_BASE_MULTIPLE = 6.0;

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 消費税
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CONSUMPTION_TAX = {
    threshold: 10000000,         // 年間売上¥10M超で課税
    rate: 0.10,
    simplifiedDeduction: 0.50,   // 簡易課税みなし仕入率50%（第5種）
};
