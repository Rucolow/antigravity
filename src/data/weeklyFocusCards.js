/**
 * WeeklyFocus — 毎週の戦略カード定義
 * 各章3枚。プレイヤーは毎週1枚を選んでからconfirmWeek。
 * apply() は confirmWeek 内でシミュレーション前に呼ばれ、
 * 一時的な状態変調パッチを返す。
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.1 カフェ（学び: 損益分岐点）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CH1_CARDS = [
    {
        id: 'ch1_quality',
        icon: '🎯',
        title: '品質重視',
        desc: '食材にこだわり、評判UP',
        upside: '評判 +0.15',
        downside: '原価率 +5%',
        apply: () => ({
            _focusCostRatioAdj: 0.05,
            _focusReputationAdj: 0.15,
        }),
    },
    {
        id: 'ch1_cost',
        icon: '💰',
        title: 'コスト削減',
        desc: '仕入先を見直し、経費圧縮',
        upside: '原価率 -3%',
        downside: '評判 -0.05',
        apply: () => ({
            _focusCostRatioAdj: -0.03,
            _focusReputationAdj: -0.05,
        }),
    },
    {
        id: 'ch1_marketing',
        icon: '📢',
        title: '集客強化',
        desc: 'チラシ配りとSNS投稿を頑張る',
        upside: '来客 +15%',
        downside: '費用 ¥5,000',
        apply: () => ({
            _focusCustomerMult: 1.15,
            _focusMarketingCost: 5000,
        }),
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.2 小売（学び: キャッシュフロー）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CH2_CARDS = [
    {
        id: 'ch2_negotiate',
        icon: '📦',
        title: '仕入れ交渉',
        desc: '問屋と直接交渉し単価を下げる',
        upside: '仕入原価 -8%',
        downside: '評判 -0.05',
        apply: () => ({
            _focusCostMult: 0.92,
            _focusReputationAdj: -0.05,
        }),
    },
    {
        id: 'ch2_clearance',
        icon: '🏷️',
        title: '在庫セール',
        desc: '動きの悪い在庫を値引き販売',
        upside: '在庫→現金化',
        downside: '粗利率低下',
        apply: () => ({
            _focusClearanceSale: true,
        }),
    },
    {
        id: 'ch2_forecast',
        icon: '🔍',
        title: '需要分析',
        desc: '来週の天気と需要を事前調査',
        upside: '来週の情報公開',
        downside: '費用 ¥10,000',
        apply: () => ({
            _focusForecast: true,
            _focusMarketingCost: 10000,
        }),
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.3 宿泊（学び: RevPAR最適化）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CH3_CARDS = [
    {
        id: 'ch3_premium',
        icon: '💎',
        title: '高単価戦略',
        desc: '客室単価を引き上げる',
        upside: 'ADR +10%',
        downside: '稼働率 -5pt',
        apply: () => ({
            _focusADRMult: 1.10,
            _focusOccAdj: -0.05,
        }),
    },
    {
        id: 'ch3_occupancy',
        icon: '🎪',
        title: '稼働率優先',
        desc: '割引プランで空室を埋める',
        upside: '稼働率 +10pt',
        downside: 'ADR -8%',
        apply: () => ({
            _focusADRMult: 0.92,
            _focusOccAdj: 0.10,
        }),
    },
    {
        id: 'ch3_direct',
        icon: '🌐',
        title: '直販強化',
        desc: '自社サイト予約を促進',
        upside: '直販比率 +3pt',
        downside: '費用 ¥30,000',
        apply: () => ({
            _focusDirectAdj: 0.03,
            _focusMarketingCost: 30000,
        }),
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.4 EC（学び: LTV/CAC）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CH4_CARDS = [
    {
        id: 'ch4_ads',
        icon: '📣',
        title: '広告攻勢',
        desc: '広告予算を増額して新規獲得',
        upside: '広告効果 +20%',
        downside: 'CAC悪化リスク',
        apply: () => ({
            _focusAdMult: 1.20,
        }),
    },
    {
        id: 'ch4_retention',
        icon: '💌',
        title: 'リピーター重視',
        desc: '既存客のフォローに注力',
        upside: 'リピート率 +2pt',
        downside: '新規 -10%',
        apply: () => ({
            _focusRepeatAdj: 0.02,
            _focusNewMult: 0.90,
        }),
    },
    {
        id: 'ch4_brand',
        icon: '🌱',
        title: 'ブランド育成',
        desc: 'SNS・コンテンツでファン作り',
        upside: 'オーガニック +3pt',
        downside: '即効性なし',
        apply: () => ({
            _focusOrganicAdj: 0.03,
        }),
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.5 不動産（学び: レバレッジ）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CH5_CARDS = [
    {
        id: 'ch5_improve',
        icon: '🔧',
        title: '物件改善',
        desc: '共用部清掃・設備更新で入居率UP',
        upside: '入居率 +5pt',
        downside: '費用 ¥200,000',
        apply: () => ({
            _focusOccAdj: 0.05,
            _focusMarketingCost: 200000,
        }),
    },
    {
        id: 'ch5_finance',
        icon: '🏦',
        title: '財務最適化',
        desc: '繰上返済で利息負担を軽減',
        upside: '利息 -3%',
        downside: '現金減',
        apply: () => ({
            _focusInterestAdj: -0.03,
            _focusPrepayment: true,
        }),
    },
    {
        id: 'ch5_scout',
        icon: '📊',
        title: '市場調査',
        desc: '有望物件の情報を収集',
        upside: '次月に物件候補+1',
        downside: '費用 ¥100,000',
        apply: () => ({
            _focusScout: true,
            _focusMarketingCost: 100000,
        }),
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// エクスポート
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const WEEKLY_FOCUS_CARDS = {
    1: CH1_CARDS,
    2: CH2_CARDS,
    3: CH3_CARDS,
    4: CH4_CARDS,
    5: CH5_CARDS,
};

/**
 * チャプター番号からカード配列を取得
 * @param {number} chapter
 * @returns {Array}
 */
export function getWeeklyFocusCards(chapter) {
    return WEEKLY_FOCUS_CARDS[chapter] || [];
}
