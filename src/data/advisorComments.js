/**
 * リアクティブ・アドバイザー
 * キャラクター（ケンジ/アヤ/ショウ）がプレイヤーの数字に反応してコメントする
 * 固定ターンではなく、ゲーム状態に基づいて動的に出現
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.1 カフェ
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CH1_COMMENTS = [
    { char: 'ショウ', cond: s => (s.weekResult?.costRatio || 0) > 30, msg: s => `原価率${s.weekResult?.costRatio || 0}%か。飲食業の目安は25-30%。メニュー数を減らすとロス率が下がるぞ`, priority: 10 },
    { char: 'ケンジ', cond: s => s.profitHistory?.length >= 3 && s.profitHistory.slice(-3).every(p => p.profit < 0), msg: () => '先輩、3週連続赤字っすよ…。固定費を見直しませんか？', priority: 20 },
    { char: 'アヤ', cond: s => (s.capacityUtilization || 0) > 0.85 && s.staff.length === 0, msg: s => `来客の${s.customersTurnedAway || 0}人をお断りしてるよ。スタッフ雇わない？`, priority: 15 },
    { char: 'ショウ', cond: s => s.reputation < 2.5 && s.turn > 10, msg: () => '評判が落ちてるな。品質を犠牲にしたコスト削減は長期では負ける', priority: 18 },
    { char: 'ケンジ', cond: s => s._goalBlackWeeks >= 2, msg: () => '先輩すごい！あと1回黒字出したらショウさんが2号店の話してくれるかも！', priority: 5 },
    { char: 'アヤ', cond: s => s.reputation >= 4.0, msg: () => '評判4.0超えてるね！口コミだけでお客さん来るレベルだよ', priority: 3 },
    { char: 'ショウ', cond: s => s.turn >= 30 && !s.snsActive, msg: () => 'SNSやらないのか？今どき口コミはSNSが主戦場だぞ', priority: 8 },
    { char: 'ケンジ', cond: s => s.weeklyProfit > 30000, msg: () => '週3万の利益！俺もこうなりたいっす！', priority: 2 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.2 小売
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CH2_COMMENTS = [
    { char: 'ショウ', cond: s => { const iv = s.skus?.reduce((sum, sku) => sum + sku.stock * sku.cost, 0) || 0; return iv > s.money * 0.5; }, msg: () => '在庫が現金の半分を超えてる。在庫＝眠っている現金、忘れるなよ', priority: 15 },
    { char: 'アヤ', cond: s => s.skus?.some(sku => sku.status === 'dead'), msg: () => '死に筋商品があるよ。処分セールで現金化したほうがいいかも', priority: 12 },
    { char: 'ケンジ', cond: s => s._goalTurnoverWeeks >= 3, msg: () => '先輩、回転率キープしてますね！あと1週で問屋に掛け取引認めてもらえるかも！', priority: 5 },
    { char: 'ショウ', cond: s => s.cfStatement && s.cfStatement.operatingCF < 0, msg: () => '営業CFがマイナスだ。利益が出てても現金が減ってるぞ。PLだけ見るな', priority: 18 },
    { char: 'アヤ', cond: s => s.reputation >= 3.8, msg: () => 'リピーター増えてきたね！仕入れの精度が上がってる証拠', priority: 3 },
    { char: 'ショウ', cond: s => s.skus?.some(sku => sku.status === 'stockout'), msg: () => '品切れか。機会損失が発生してる。需要予測を見直せ', priority: 14 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.3 宿泊
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CH3_COMMENTS = [
    { char: 'ショウ', cond: s => (s.weeklyOccupancy || 0) < 0.5 && s.turn > 10, msg: s => `稼働率${Math.round((s.weeklyOccupancy || 0) * 100)}%か。ホテルの在庫は翌日に持ち越せない。今夜の空室は永遠に売れない`, priority: 15 },
    { char: 'アヤ', cond: s => (s.weekResult?.revpar || 0) >= 10000, msg: () => 'RevPAR1万超えてる！単価と稼働率のバランスが見事', priority: 3 },
    { char: 'ショウ', cond: s => (s.weeklyADR || 0) > 15000 && (s.weeklyOccupancy || 0) < 0.6, msg: () => '単価を上げすぎて客が減ってないか？ RevPAR＝ADR×稼働率で考えろ', priority: 18 },
    { char: 'ケンジ', cond: s => s._goalRevparWeeks >= 3, msg: () => '先輩！RevPAR￥８,000をあと1週キープしたら、星付き認定ですよ！', priority: 5 },
    { char: 'アヤ', cond: s => s.weekResult?.otaCommission > 50000, msg: () => 'OTA手数料が高いね…。自社サイト予約を増やせば利益が残るよ', priority: 10 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.4 EC
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CH4_COMMENTS = [
    { char: 'アヤ', cond: s => (s.cac || 0) > 7000, msg: s => `CAC¥${(s.cac || 0).toLocaleString()}は高すぎ。広告で稼いで広告に払う循環になってないか確認して`, priority: 15 },
    { char: 'ショウ', cond: s => (s.ltvCacRatio || 0) < 1.5 && s.turn > 8, msg: () => 'LTV/CACが1.5倍以下。このままでは広告費を回収できないぞ', priority: 18 },
    { char: 'ケンジ', cond: s => (s.organicRatio || 0) >= 0.35, msg: () => 'オーガニック35%超え！あとちょっとで広告なしでも半分来る！', priority: 5 },
    { char: 'アヤ', cond: s => (s.repeatRate || 0) > 0.30, msg: () => 'リピート率30%超！広告費下げてもお客さん戻ってくるね', priority: 3 },
    { char: 'ショウ', cond: s => s.turn >= 15 && !(s.crmEnabled?.subscription), msg: () => 'サブスクまだやらないのか？安定収益の柱になるぞ', priority: 8 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.5 不動産
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CH5_COMMENTS = [
    { char: 'ショウ', cond: s => (s.dscr || 0) < 1.3 && (s.dscr || 0) > 0, msg: s => `DSCR ${(s.dscr || 0).toFixed(2)}。1.3を下回ると銀行が危険信号を出す。返済余力を確保しろ`, priority: 20 },
    { char: 'アヤ', cond: s => (s.netWorth || 0) >= 30000000, msg: () => '純資産3,000万！5,000万まであと少し', priority: 5 },
    { char: 'ショウ', cond: s => s.properties?.some(p => (p.occupancyRate || 0) < 0.7), msg: () => '空室が多い物件がある。家賃を下げるか、バリューアップで入居率を上げろ', priority: 12 },
    { char: 'ケンジ', cond: s => (s.dscr || 0) >= 2.0, msg: () => 'DSCR 2.0超！安全すぎるぐらい。もう少し攻めてもいいかも', priority: 8 },
    { char: 'ショウ', cond: s => s.properties?.length >= 3, msg: () => '3物件目か。分散投資の効果で1物件の空室リスクが薄まる', priority: 3 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// メイン関数: 現在の状態から最適なコメントを1つ返す
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CHAPTER_COMMENTS = {
    1: CH1_COMMENTS,
    2: CH2_COMMENTS,
    3: CH3_COMMENTS,
    4: CH4_COMMENTS,
    5: CH5_COMMENTS,
};

/**
 * @param {number} chapter - チャプター番号 (1-5)
 * @param {object} state - 現在のゲーム状態
 * @returns {{ char: string, msg: string } | null}
 */
// 前回表示コメントのIDを記憶（チャプターごと）
const _lastCommentId = {};

export function getAdvisorComment(chapter, state) {
    const comments = CHAPTER_COMMENTS[chapter];
    if (!comments || !state || state.turn < 3) return null;

    // 条件を満たすコメントを取得し、priority順にソート
    const candidates = comments
        .filter(c => {
            try { return c.cond(state); } catch { return false; }
        })
        .sort((a, b) => b.priority - a.priority);

    if (candidates.length === 0) return null;

    // 前回と同じコメントを避ける
    const lastId = _lastCommentId[chapter];
    let chosen = candidates[0];

    // 前回と同じキャラ+同じ条件なら次の候補を選ぶ
    const chosenId = `${chosen.char}_${chosen.priority}`;
    if (chosenId === lastId && candidates.length > 1) {
        chosen = candidates[1];
    }

    const msg = typeof chosen.msg === 'function' ? chosen.msg(state) : chosen.msg;
    _lastCommentId[chapter] = `${chosen.char}_${chosen.priority}`;
    return { char: chosen.char, msg };
}

const CHAR_EMOJI = {
    'ショウ': '🧔',
    'ケンジ': '👦',
    'アヤ': '👩',
};

export function getCharEmoji(name) {
    return CHAR_EMOJI[name] || '💬';
}
