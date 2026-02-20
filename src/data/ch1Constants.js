// Ch.1 カフェ経営定数 — 設計書 v3 準拠

// ━━━━━━━━━━━━━━━━━━━━━━
// 立地
// ━━━━━━━━━━━━━━━━━━━━━━
export const LOCATIONS = {
    station: {
        name: '駅前',
        rent: 220000,
        seats: 10,
        baseCustomers: 45,
        desc: '人通り多い。競合も多い。',
        repeaterGrowthMult: 1.0,
    },
    residential: {
        name: '住宅街',
        rent: 120000,
        seats: 14,
        baseCustomers: 25,
        desc: '落ち着いた雰囲気。常連がつきやすい。',
        repeaterGrowthMult: 1.5, // リピーター補正+50%
    },
    backstreet: {
        name: '商店街奥の2F',
        rent: 65000,
        seats: 8,
        baseCustomers: 12,
        desc: '隠れ家的。知る人ぞ知る店。SNS・口コミ頼み。',
        repeaterGrowthMult: 1.0,
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━
// 内装
// ━━━━━━━━━━━━━━━━━━━━━━
export const INTERIORS = {
    premium: { name: '松（こだわり）', cost: 2000000, satisfactionBonus: 0.5, snsBonus: 0.20 },
    standard: { name: '竹（標準）', cost: 1200000, satisfactionBonus: 0.2, snsBonus: 0 },
    minimum: { name: '梅（最低限）', cost: 600000, satisfactionBonus: 0.0, snsBonus: 0 },
};

// ━━━━━━━━━━━━━━━━━━━━━━
// エスプレッソマシン
// ━━━━━━━━━━━━━━━━━━━━━━
export const MACHINES = {
    high: { name: '高級', cost: 800000, qualityCap: 5, speedMod: 1.20 },
    mid: { name: '中級', cost: 400000, qualityCap: 4, speedMod: 1.00 },
    low: { name: '最低限', cost: 150000, qualityCap: 3, speedMod: 0.90 },
};

export const OTHER_EQUIPMENT_COST = 300000; // 冷蔵庫・食器・テーブル etc.

// ━━━━━━━━━━━━━━━━━━━━━━
// メニュー
// ━━━━━━━━━━━━━━━━━━━━━━
export const MENU_ITEMS = [
    // ドリンク（必須。最低2品選択）
    { id: 'coffee_hot', name: 'コーヒー（ホット）', cost: 80, defaultPrice: 450, prepTime: 3, category: 'drink', popularity: 1.4 },
    { id: 'latte', name: 'カフェラテ', cost: 120, defaultPrice: 550, prepTime: 4, category: 'drink', popularity: 1.2 },
    { id: 'coffee_ice', name: 'アイスコーヒー', cost: 90, defaultPrice: 450, prepTime: 2, category: 'drink', popularity: 1.1 },
    { id: 'tea', name: '紅茶', cost: 60, defaultPrice: 400, prepTime: 2, category: 'drink', popularity: 0.8 },
    { id: 'matcha', name: '抹茶ラテ', cost: 150, defaultPrice: 600, prepTime: 4, category: 'drink', popularity: 0.7 },
    { id: 'smoothie', name: 'スムージー', cost: 180, defaultPrice: 650, prepTime: 5, category: 'drink', popularity: 0.5 },
    // フード（任意。0〜3品）
    { id: 'toast', name: 'トースト', cost: 70, defaultPrice: 380, prepTime: 5, category: 'food', popularity: 0.9 },
    { id: 'cake', name: 'ケーキ（仕入）', cost: 200, defaultPrice: 500, prepTime: 1, category: 'food', popularity: 0.7 },
    { id: 'sandwich', name: 'サンドイッチ', cost: 150, defaultPrice: 580, prepTime: 7, category: 'food', popularity: 0.6 },
    { id: 'curry', name: 'カレー', cost: 250, defaultPrice: 900, prepTime: 10, category: 'food', popularity: 0.4 },
];

// メニュー数による効果
export const MENU_COUNT_EFFECTS = {
    3: { lossRate: 0.02, opsEfficiency: 1.10 },
    4: { lossRate: 0.03, opsEfficiency: 1.05 },
    5: { lossRate: 0.05, opsEfficiency: 1.00 },
    6: { lossRate: 0.08, opsEfficiency: 0.90 },
};

// 注文パターン
export const ORDER_PATTERN = {
    drinkOnly: 0.70,
    drinkAndFood: 0.25,
    foodOnly: 0.05,
};

// ━━━━━━━━━━━━━━━━━━━━━━
// 営業時間
// ━━━━━━━━━━━━━━━━━━━━━━
export const OPERATING_HOURS = {
    morning: {
        name: '朝型 7:00-15:00',
        hours: 8,
        dailyCapacity: 35,
        extraUtilities: 0,
        peakDesc: '朝7-9時にピーク。午後は静か。',
        requiresSkill: null,
        ticketBonus: 0,
    },
    allday: {
        name: '通し 10:00-21:00',
        hours: 11,
        dailyCapacity: 45,
        extraUtilities: 15000,
        peakDesc: '分散型。ピークがない分、安定。',
        requiresSkill: null,
        ticketBonus: 0,
    },
    evening: {
        name: '夜型 15:00-23:00',
        hours: 8,
        dailyCapacity: 30,
        extraUtilities: 0,
        peakDesc: '夕方〜夜にピーク。客単価が高い傾向。',
        requiresSkill: 'night_ops', // コンビニバイト経験者のスキル
        ticketBonus: 200, // アルコール提供で客単価+¥200
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━
// 固定費（月額）
// ━━━━━━━━━━━━━━━━━━━━━━
export const FIXED_COSTS = {
    utilities_base: 30000,
    communication: 5000,
    insurance: 8000,
    accounting: 1000, // 青色申告時のみ
};

// ━━━━━━━━━━━━━━━━━━━━━━
// スタッフ
// ━━━━━━━━━━━━━━━━━━━━━━
export const STAFF_COSTS = {
    part: { name: 'パート', monthly: 120000, capacityMult: 2.0 },
    full: { name: '社員', monthly: 220000, capacityMult: 2.5 },
};

// ━━━━━━━━━━━━━━━━━━━━━━
// マーケティング
// ━━━━━━━━━━━━━━━━━━━━━━
export const MARKETING = {
    sns: { name: 'SNS運用', cost: 0, customerMult: 1.10, duration: 1 },
    flyer: { name: 'チラシ', cost: 30000, customerMult: 1.15, duration: 2 },
    googleAd: { name: 'Googleマップ広告', cost: 20000, customerMult: 1.05, duration: 4 },
};

// ━━━━━━━━━━━━━━━━━━━━━━
// 評判
// ━━━━━━━━━━━━━━━━━━━━━━
export const REPUTATION = {
    initial: 2.0,
    growthPerTurn: 0.05,
    decayPerTurn: -0.05,
    claimPenalty: -0.3,
    max: 5.0,
    // 評判→来客補正
    getCustomerMult: (rep) => {
        if (rep <= 1.0) return 0.4;
        if (rep <= 2.0) return 0.6 + (rep - 1.0) * 0.4;
        if (rep <= 3.0) return 1.0 + (rep - 2.0) * 0.3;
        if (rep <= 4.0) return 1.3 + (rep - 3.0) * 0.4;
        return 1.7 + (rep - 4.0) * 0.3; // max 2.0
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━
// 天候・曜日
// ━━━━━━━━━━━━━━━━━━━━━━
export const WEATHER_MULT = { sunny: 1.0, cloudy: 0.9, rainy: 0.7, typhoon: 0.3 };
export const WEATHER_CHANCE = { sunny: 0.50, cloudy: 0.30, rainy: 0.15, typhoon: 0.05 };
export const WEEKDAY_MULT = { weekday: 1.0, saturday: 1.3, sunday: 1.2 };

// ━━━━━━━━━━━━━━━━━━━━━━
// Phase定義（52+ターン制）
// ━━━━━━━━━━━━━━━━━━━━━━
export const CH1_PHASES = {
    A: { start: 1, end: 12, name: 'Phase A', label: '開業〜生存' },
    B: { start: 13, end: 36, name: 'Phase B', label: '成長〜壁' },
    C: { start: 37, end: 72, name: 'Phase C', label: '最適化〜EXIT' },
};

export function getCh1Phase(turn) {
    if (turn <= CH1_PHASES.A.end) return 'A';
    if (turn <= CH1_PHASES.B.end) return 'B';
    return 'C';
}

// テイクアウト
export const TAKEOUT = {
    extraCostPerCup: 50,
    capacityBonus: 0.30,
    repeaterPenalty: -0.20,
};

// EXIT マルチプル
export const EXIT_BASE_MULTIPLE = 5.5;
