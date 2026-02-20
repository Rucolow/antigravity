// Ch.0 スキル定義 — 設計書 v3 準拠
// 取得判定はエンディング到達時に一括実行

export const SKILLS = [
    {
        id: 'coffee_knowledge',
        name: 'コーヒー知識',
        icon: '☕',
        desc: 'カフェバイトで培った豆や抽出の知識',
        ch1Bonus: 'コーヒー品質+1（メニュー初期解放）',
        condition: (state) => state.baitoType === 'cafe' && state.baitoDaysWorked >= 12,
    },
    {
        id: 'night_ops',
        name: '夜間運営力',
        icon: '🌙',
        desc: '深夜帯の客層と運営ノウハウ',
        ch1Bonus: '深夜営業オプション解放',
        condition: (state) => state.baitoType === 'convenience' && state.baitoDaysWorked >= 12,
    },
    {
        id: 'diy_skill',
        name: 'DIYスキル',
        icon: '🔧',
        desc: '引越しで身についた力仕事と内装の知識',
        ch1Bonus: '内装工事費−20%',
        condition: (state) => state.baitoType === 'moving' && state.baitoDaysWorked >= 10,
    },
    {
        id: 'eye_for_value',
        name: '目利き力',
        icon: '🔍',
        desc: 'せどりで磨いた相場観と鑑定眼',
        ch1Bonus: '仕入れ判断の精度UP',
        condition: (state) => state.sedoriItemsBought >= 20,
    },
    {
        id: 'hospitality',
        name: '接客力',
        icon: '🤝',
        desc: 'マルシェで学んだ対面販売のスキル',
        ch1Bonus: '顧客満足度の初期値UP',
        condition: (state) => state.marcheSessions >= 5,
    },
    {
        id: 'pricing_sense',
        name: '値付けの勘',
        icon: '💰',
        desc: 'フリマで培った価格設定のセンス',
        ch1Bonus: 'メニュー価格設定の参考データ表示',
        condition: (state) => state.furima.totalSold >= 10,
    },
    {
        id: 'frugality',
        name: '倹約の知恵',
        icon: '🏠',
        desc: '生活費を見直し、固定費を削った経験',
        ch1Bonus: '固定費管理のアドバイス表示',
        condition: (state) => {
            const reductions = [state.hasCooking, state.hasSharehouse, state.hasCheapSim];
            return reductions.filter(Boolean).length >= 2;
        },
    },
    {
        id: 'investment_eye',
        name: '投資の目',
        icon: '📈',
        desc: '共同仕入れで体験したリスクとリターン',
        ch1Bonus: '設備投資のROI表示',
        condition: (state) => state.jointPurchaseInvested || state.decisions.some(d => d.type === 'joint'),
    },
    {
        id: 'network',
        name: '人脈',
        icon: '🔗',
        desc: 'タクヤとの協力関係から得た情報網',
        ch1Bonus: '仕入先情報の早期入手',
        condition: (state) => state.rivalRelation === 'cooperate',
    },
    {
        id: 'closure_experience',
        name: '閉店経験',
        icon: '🚪',
        desc: 'バイト先の閉店を目撃した生々しい記憶',
        ch1Bonus: '損益分岐点の警告が早く表示される',
        condition: (state) => state.baitoType === 'cafe' && state.baitoPayOverride !== null,
    },
];

/**
 * 現在の状態からスキル取得判定を実行
 * @returns {Array} 取得したスキルの配列
 */
export function evaluateSkills(state) {
    return SKILLS.filter(skill => skill.condition(state));
}
