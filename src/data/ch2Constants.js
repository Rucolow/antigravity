/**
 * Ch.2 小売店経営シミュレーション 定数
 * 設計書: antigravity-ch2-detail-v3.md
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 業種
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const INDUSTRIES = {
    coffee: {
        name: 'コーヒー豆・茶葉専門店',
        costRatio: 0.45,      // 仕入原価率
        grossMargin: 0.55,
        shelfLife: 8,          // 焙煎後 8ターンで劣化開始
        degradationType: 'flavor',
        customerUnit: [2000, 4000], // 客単価レンジ
        avgUnit: 2800,
        baseCustomers: 18,     // 日来客数ベース
        cafeBonus: true,       // cafe_experience スキルで品質目利き+20%
        trendDecay: 0,
    },
    lifestyle: {
        name: 'セレクト雑貨・ライフスタイルショップ',
        costRatio: 0.40,
        grossMargin: 0.60,
        shelfLife: null,       // 賞味期限なし
        degradationType: 'trend',
        customerUnit: [1500, 5000],
        avgUnit: 2500,
        baseCustomers: 22,
        cafeBonus: false,
        trendDecay: 0.03,      // 毎ターン3%トレンド劣化
    },
    food: {
        name: '食品セレクトショップ',
        costRatio: 0.50,
        grossMargin: 0.50,
        shelfLife: 12,         // 12ターンで廃棄
        degradationType: 'expiry',
        customerUnit: [1200, 3000],
        avgUnit: 1800,
        baseCustomers: 28,
        cafeBonus: false,
        trendDecay: 0,
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 立地
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const LOCATIONS = {
    station: {
        name: '駅前・商業施設',
        rent: 350000,
        floorSpace: 20,       // 坪
        footTraffic: 1.3,     // 来客補正
        initialCustomerBase: 50,
        baseCustomers: 45,     // 日来客数ベース
    },
    shopping: {
        name: '商店街',
        rent: 180000,
        floorSpace: 15,
        footTraffic: 1.0,
        initialCustomerBase: 30,
        baseCustomers: 35,
    },
    roadside: {
        name: 'ロードサイド',
        rent: 120000,
        floorSpace: 25,
        footTraffic: 0.7,
        initialCustomerBase: 15,
        baseCustomers: 25,
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 内装・什器
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const INTERIORS = {
    premium: { name: 'デザイナーズ', cost: 800000, purchaseRateBonus: 0.10, snsAppeal: 1.2 },
    standard: { name: 'スタンダード', cost: 500000, purchaseRateBonus: 0.05, snsAppeal: 1.0 },
    minimum: { name: 'ミニマル', cost: 200000, purchaseRateBonus: 0.0, snsAppeal: 0.8 },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 仕入先
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const SUPPLIERS = {
    wholesale: {
        name: '大手卸',
        costMult: 1.0,        // 標準価格
        minOrder: 50,         // 最低ロット
        leadTime: 1,          // リードタイム（ターン）
        creditAvailable: false,
    },
    maker: {
        name: 'メーカー直販',
        costMult: 0.85,       // 15%割引
        minOrder: 100,
        leadTime: 2,
        creditAvailable: true,
    },
    import: {
        name: '輸入業者',
        costMult: 0.75,       // 25%割引
        minOrder: 200,
        leadTime: 3,
        creditAvailable: false,
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 在庫ステータス
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const INVENTORY_STATUS = {
    hot: { label: '売れ筋', turnoverRate: [4, Infinity], salesMult: 1.2, color: '🔥' },
    normal: { label: '通常', turnoverRate: [2, 4], salesMult: 1.0, color: '✅' },
    slow: { label: '低回転', turnoverRate: [1, 2], salesMult: 0.8, color: '⚠️' },
    dead: { label: '死に筋', turnoverRate: [0, 1], salesMult: 0.3, color: '💀' },
    stockout: { label: '品切れ', turnoverRate: null, salesMult: 0.0, color: '🚫' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 固定費
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const FIXED_COSTS = {
    utilities_base: 35000,
    insurance: 15000,
    communication: 8000,
    accounting: 30000,
    pos_lease: 8000,   // POS月額
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// スタッフ
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const STAFF_COSTS = {
    part: { monthly: 80000, capacityMult: 1.3, name: 'パート' },
    full: { monthly: 180000, capacityMult: 1.6, name: '社員' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 天候
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const WEATHER_CHANCE = { sunny: 0.5, cloudy: 0.25, rainy: 0.2, storm: 0.05 };
export const WEATHER_MULT = { sunny: 1.0, cloudy: 0.9, rainy: 0.7, storm: 0.4 };
export const WEEKDAY_MULT = { weekday: 0.8, saturday: 1.3, sunday: 1.2 };

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 評判
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const REPUTATION = {
    initial: 2.0,
    max: 5.0,
    growthPerTurn: 0.08,
    decayPerTurn: -0.05,
    getCustomerMult: (rep) => 0.6 + (rep / 5.0) * 0.7,  // rep=2→0.88, rep=5→1.30
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 掛け払い（信用取引）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CREDIT_TERMS = {
    availableAfterTurns: 12,  // 12ターン後に解禁
    deferralTurns: 2,          // 支払いを2ターン繰り延べ
    interestRate: 0.02,        // 月利2%
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// EC（電子商取引）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const EC = {
    setupCost: 300000,
    monthlyFee: 15000,
    salesBoostPct: 0.30,      // 売上+30%
    shippingCostPerOrder: 500,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// EXIT マルチプル
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH2_EXIT_BASE_MULTIPLE = 5.0;

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function getCh2Phase(turn) {
    if (turn <= 16) return 'A';
    if (turn <= 40) return 'B';
    return 'C';
}

export const CH2_PHASES = {
    A: { label: 'フェーズA: 立上げ期', turns: '1-16' },
    B: { label: 'フェーズB: 成長期', turns: '17-40' },
    C: { label: 'フェーズC: EXIT期', turns: '41-60' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 季節
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function getSeason(turn) {
    // 4ターン=1ヶ月, 周期的
    const month = Math.floor((turn - 1) / 4) % 12;
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
}

export const SEASON_MULT = {
    spring: 1.0,
    summer: 0.85,
    autumn: 1.15,
    winter: 1.1,
};
