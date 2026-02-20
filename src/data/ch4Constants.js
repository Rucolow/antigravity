/**
 * Ch.4 EC・D2C 経営シミュレーション 定数
 * 設計書: antigravity-ch4-detail-v3.md
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 商品カテゴリ
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const PRODUCT_CATEGORIES = {
    cosmetics: {
        name: 'オリジナルコスメ / スキンケア',
        costRatio: 0.20,
        grossMargin: 0.80,
        repeatRate: 0.50,      // 3ヶ月以内の再購入率
        avgPrice: 5000,
        returnRate: 0.03,
        initialInventoryCost: 1000000,
        desc: '粗利率最高。消耗品リピートの王道。薬機法の制約あり。',
    },
    food: {
        name: 'オリジナル食品 / 健康食品',
        costRatio: 0.30,
        grossMargin: 0.70,
        repeatRate: 0.42,
        avgPrice: 3500,
        returnRate: 0.02,
        initialInventoryCost: 800000,
        desc: '消耗品でリピート率高。食品表示法の遵守が必要。',
    },
    apparel: {
        name: 'アパレル / ファッション雑貨',
        costRatio: 0.35,
        grossMargin: 0.65,
        repeatRate: 0.20,
        avgPrice: 10000,
        returnRate: 0.12,      // サイズ違い等で返品率高い
        initialInventoryCost: 1200000,
        desc: 'トレンド依存。リピート率は低いが客単価が高い。',
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// ブランドコンセプト
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const BRAND_CONCEPTS = {
    premium: {
        name: 'プレミアム路線',
        priceMultiplier: 1.30,
        cacMultiplier: 1.20,
        ltvBonus: 0.15,        // LTV+15%（ロイヤリティ）
        desc: '高単価。LTV高。CACも高め。',
    },
    value: {
        name: 'コスパ路線',
        priceMultiplier: 0.80,
        cacMultiplier: 0.85,
        ltvBonus: -0.10,
        desc: '低価格でCAC低。ただし価格競争に巻き込まれやすい。',
    },
    story: {
        name: 'ストーリー路線',
        priceMultiplier: 1.00,
        cacMultiplier: 1.00,
        ltvBonus: 0.05,
        snsViralChance: 0.08,  // 毎ターン8%でSNSバイラル
        desc: '標準単価。SNSバイラルの可能性あり。',
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// パッケージデザイン
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const PACKAGE_DESIGNS = {
    designer: { name: 'デザイナー起用', cost: 500000, reputationBonus: 0.3, desc: '開封体験◎。SNS映え。' },
    template: { name: 'テンプレート', cost: 50000, reputationBonus: 0, desc: '標準的。問題なし。' },
    diy: { name: '自作', cost: 0, reputationBonus: -0.2, desc: 'チープに見えるリスク。' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 広告プラットフォーム
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const AD_PLATFORMS = {
    instagram: {
        name: 'Instagram / Facebook広告',
        minBudget: 30000,
        baseCPA: 4500,         // 初期CPA
        cpaVariance: 0.20,     // ±20%のブレ
        bestFor: 'cosmetics',
        desc: 'ビジュアル重視。コスメ・アパレルに強い。',
    },
    google: {
        name: 'Google広告（検索＋ショッピング）',
        minBudget: 20000,
        baseCPA: 3500,
        cpaVariance: 0.15,
        bestFor: 'food',
        desc: '検索意図が明確。購入率が高い。',
    },
    tiktok: {
        name: 'TikTok広告',
        minBudget: 50000,
        baseCPA: 3000,
        cpaVariance: 0.45,     // 当たり外れが大きい
        bestFor: 'apparel',
        desc: '若年層。バイラル可能性あり。分散大。',
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 販売チャネル
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const SALES_CHANNELS = {
    own_ec: {
        name: '自社ECサイト',
        setupCost: 200000,
        monthlyCost: 15000,
        commissionRate: 0.035,  // 決済手数料のみ
        reachPower: 0.3,        // 集客力（低。広告依存）
        required: true,
    },
    amazon: {
        name: 'Amazon',
        setupCost: 0,
        monthlyCost: 4900,
        commissionRate: 0.15,
        reachPower: 1.5,
        required: false,
    },
    rakuten: {
        name: '楽天市場',
        setupCost: 0,
        monthlyCost: 50000,
        commissionRate: 0.10,
        reachPower: 1.2,
        required: false,
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 固定費（月額）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH4_FIXED_COSTS = {
    ecPlatform: 15000,       // Shopify等
    warehouse: 30000,        // 倉庫・保管
    accounting: 10000,       // クラウド会計
    communication: 5000,     // 通信費
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 変動費（1注文あたり）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH4_VARIABLE_COSTS = {
    shipping: 600,           // 配送料
    packaging: 200,          // 梱包材
    pickPack: 150,           // ピッキング・梱包作業
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// CRMツール
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CRM_TOOLS = {
    newsletter: {
        name: 'メルマガ / LINE配信',
        monthlyCost: 5000,
        repeatBoost: 0.08,     // リピート率+8%
        unlockTurn: 12,
        desc: '週1配信でリピート率UP。頻度注意。',
    },
    coupon: {
        name: 'クーポン配布（2回目15%OFF）',
        monthlyCost: 0,        // クーポン原資は粗利率低下で反映
        repeatBoost: 0.12,
        marginPenalty: 0.03,   // 粗利率−3%
        unlockTurn: 18,
        desc: 'リピート率+12%。ただし定価で買わなくなるリスク。',
    },
    subscription: {
        name: 'サブスクリプション（定期購入）',
        monthlyCost: 10000,
        repeatBoost: 0.25,     // リピート率大幅UP
        priceDiscount: 0.10,   // 通常価格−10%で提供
        baseChurnRate: 0.05,   // 月解約率5%
        unlockTurn: 45,
        desc: '定期購入モデル。LTVが劇的に向上。',
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// クリエイティブ鮮度
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CREATIVE_FRESHNESS = {
    decayPerTurn: 0.25,     // 4ターンで0%に
    cpaPenaltyAt0: 0.50,    // 鮮度0%でCPA+50%
    refreshCost: 30000,      // 更新費用
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// EC季節カレンダー（月別倍率）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const EC_SEASON_CALENDAR = [
    { month: 1, label: '1月 正月セール', base: 1.3 },
    { month: 2, label: '2月 バレンタイン', base: 0.9 },
    { month: 3, label: '3月 年度末', base: 1.1 },
    { month: 4, label: '4月 新生活', base: 1.0 },
    { month: 5, label: '5月 GW', base: 0.8 },
    { month: 6, label: '6月 梅雨', base: 0.7 },
    { month: 7, label: '7月 夏セール', base: 1.2 },
    { month: 8, label: '8月 お盆', base: 0.9 },
    { month: 9, label: '9月 秋物', base: 1.0 },
    { month: 10, label: '10月 ハロウィン', base: 1.1 },
    { month: 11, label: '11月 ブラックフライデー', base: 1.5 },
    { month: 12, label: '12月 年末商戦', base: 2.0 },
];

export function getECSeasonMultiplier(turn) {
    const monthIdx = Math.floor((turn - 1) / 4) % 12;
    return EC_SEASON_CALENDAR[monthIdx].base;
}

export function getCh4Month(turn) {
    const monthIdx = Math.floor((turn - 1) / 4) % 12;
    return EC_SEASON_CALENDAR[monthIdx];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// CACの逓増計算
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function calculateNewCustomers(weeklyBudget, platformKey, state) {
    const platform = AD_PLATFORMS[platformKey];
    if (!platform || weeklyBudget <= 0) return 0;

    // カテゴリ相性ボーナス
    const categoryBonus = (state.productCategory === platform.bestFor) ? 0.85 : 1.0;

    // クリエイティブ鮮度ペナルティ
    const freshPen = 1 + (1 - (state.creativeFreshness || 1)) * CREATIVE_FRESHNESS.cpaPenaltyAt0;

    // 累計広告費による疲弊（対数曲線）
    const spendFatigue = Math.pow((state.totalAdSpend || 0) / 1000000 + 1, 0.15);

    // ブランド補正
    const brandMult = BRAND_CONCEPTS[state.brandConcept]?.cacMultiplier || 1.0;

    const effectiveCPA = platform.baseCPA * categoryBonus * freshPen * spendFatigue * brandMult;

    // ランダム変動 ±variance
    const variance = 1 - platform.cpaVariance + Math.random() * platform.cpaVariance * 2;
    const finalCPA = effectiveCPA * variance;

    return Math.max(1, Math.floor(weeklyBudget / finalCPA));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// スタッフ
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH4_STAFF = {
    cs: { name: 'CSスタッフ', monthly: 120000, skill: 'cs', desc: 'カスタマーサポート。レビュー評価向上。' },
    marketing: { name: 'マーケ担当', monthly: 200000, skill: 'marketing', desc: '広告運用効率UP。CPA-10%。' },
    logistics: { name: '物流スタッフ', monthly: 100000, skill: 'logistics', desc: '配送・在庫管理。返品処理効率化。' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 評判（口コミ）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH4_REPUTATION = {
    initial: 3.5,
    max: 5.0,
    growthPerTurn: 0.04,
    decayPerTurn: -0.03,
    getConversionMult: (rep) => 0.6 + (rep / 5.0) * 0.6,  // rep=3.5→1.02, rep=5→1.20
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function getCh4Phase(turn) {
    if (turn <= 20) return 'A';
    if (turn <= 52) return 'B';
    return 'C';
}

export const CH4_PHASES = {
    A: { label: 'フェーズA: 立ち上げ〜PMF', turns: '1-20' },
    B: { label: 'フェーズB: スケール〜広告費地獄', turns: '21-52' },
    C: { label: 'フェーズC: 仕組み化〜EXIT', turns: '53-76' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// EXIT マルチプル
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH4_EXIT_BASE_MULTIPLE = 5.0;

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 法人化
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const INCORPORATION = {
    setupCost: 250000,
    annualAccountingFee: 300000,
    annualMinTax: 70000,        // 均等割（赤字でも発生）
    taxThreshold: 9000000,      // 課税所得¥9M超で法人化メリット
    officerSalaryPresets: [
        { label: '控えめ（¥300,000/月）', monthly: 300000, desc: '法人に利益を残す。法人税中心。' },
        { label: 'バランス（¥500,000/月）', monthly: 500000, desc: '法人税と所得税のバランス型。' },
        { label: '高報酬（¥800,000/月）', monthly: 800000, desc: '個人に利益を移す。所得税中心。' },
    ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 消費税
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const EC_CONSUMPTION_TAX = {
    threshold: 10000000,
    rate: 0.10,
    simplifiedDeduction: 0.50,   // 簡易課税みなし仕入率50%
};
