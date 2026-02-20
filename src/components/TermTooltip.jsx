import { useState } from 'react';

const GLOSSARY = {
    'せどり': '中古ショップなどで安く仕入れた商品を、ネットで高く売って利益を得る副業のこと。目利き力が重要！',
    'マルシェ': '手作り品や食品を持ち寄って販売する出店イベント。準備＋出店で2日間かかるけど、うまくいけば大きな利益に！',
    'フリマ': 'フリーマーケットの略。不用品や仕入れた商品をネットで売る方法。',
    '利益率': '売上のうち、どれだけが「儲け」として残るかの割合。売値1,000円で仕入れ700円なら利益率30%。高いほど効率よく稼げている証拠。',
    '不良在庫': '仕入れたけど売れ残ってしまった商品のこと。お金を使ったのに回収できない状態。せどりの最大のリスク！',
    '月商': '1ヶ月間の売上の合計金額。「月商100万」は月に100万円の売上があるという意味。利益とは別の数字なので注意。',
    '経費': '事業を運営するためにかかるお金。家賃、材料費、仕入れ代など。売上から経費を引いた残りが利益になる。',
    '赤字': '収入より支出が多い状態。つまり損をしていること。逆に収入が多ければ「黒字」。',
    '福利厚生': '会社が社員に提供する給料以外の待遇。健康保険、住宅手当、社員食堂など。フリーランスや起業家にはない。',
    '社会保険': '病気やケガ、老後に備える公的な保険制度。会社員なら会社が半分負担。フリーランスは全額自分で払う。',
    '日給': '1日働いたときにもらえる給料のこと。時給×勤務時間で計算されることが多い。',
    '時給': '1時間あたりの給料のこと。バイトの基本的な給料の単位。',
    '天井': 'これ以上は上がらない「限界」のこと。時給の天井＝どれだけ頑張っても時間あたりの収入には上限がある。',
    '仕入れ': '売るための商品を買い付けること。安く仕入れて高く売る＝商売の基本。',
    '目利き': '商品の価値を正確に見抜く力。せどりでは、安く売られている「お宝」を見つけるスキル。',
    '出店料': 'マルシェやイベントに出店するために主催者に払う参加費のこと。',
    '年収': '1年間に稼ぐ給料の合計金額。月収×12ヶ月。就職する場合の収入の目安。',
    '収支': '収入と支出をまとめたもの。プラスなら黒字、マイナスなら赤字。',
    '生活費': '食費、家賃、光熱費など、日常生活に最低限かかるお金のこと。',
};

// 用語を長い順にソート（部分一致を防ぐ）
const SORTED_TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

export default function TermTooltip({ term, children }) {
    const [open, setOpen] = useState(false);
    const explanation = GLOSSARY[term];

    if (!explanation) return children || term;

    return (
        <>
            <span
                className="term-tooltip__trigger"
                onClick={(e) => { e.stopPropagation(); setOpen(true); }}
            >
                {children || term}
            </span>

            {open && (
                <div className="term-tooltip__overlay" onClick={() => setOpen(false)}>
                    <div className="term-tooltip__popup" onClick={(e) => e.stopPropagation()}>
                        <div className="term-tooltip__term">{term}とは？</div>
                        <div className="term-tooltip__text">{explanation}</div>
                        <button className="term-tooltip__close" onClick={() => setOpen(false)}>
                            なるほど！
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// 物理的・日常的な文脈で使われる場合は用語解説しないパターン
const EXCLUDE_CONTEXTS = {
    '天井': ['天井を見', '天井を眺', '天井に'],
};

/**
 * テキスト文字列内のGLOSSARY用語を自動的にTermTooltipコンポーネントに変換する
 * @param {string} text - 解析するテキスト
 * @returns {Array} React要素の配列
 */
export function renderWithTooltips(text) {
    if (!text) return text;

    const parts = [];
    let remaining = text;
    let offset = 0; // 元テキスト上のオフセット
    let keyIdx = 0;

    while (remaining.length > 0) {
        // 最も早く出現する用語を探す
        let earliest = null;
        let earliestPos = Infinity;

        for (const term of SORTED_TERMS) {
            const pos = remaining.indexOf(term);
            if (pos !== -1 && pos < earliestPos) {
                earliestPos = pos;
                earliest = term;
            }
        }

        if (!earliest) {
            // 残りに用語なし
            parts.push(remaining);
            break;
        }

        // 除外コンテキストのチェック
        const excludes = EXCLUDE_CONTEXTS[earliest];
        if (excludes) {
            const contextStart = Math.max(0, earliestPos - 2);
            const contextEnd = Math.min(remaining.length, earliestPos + earliest.length + 3);
            const context = remaining.slice(contextStart, contextEnd);
            if (excludes.some(ex => context.includes(ex) || text.includes(ex))) {
                // 物理的な文脈 → 用語解説なしでそのまま出力
                parts.push(remaining.slice(0, earliestPos + earliest.length));
                remaining = remaining.slice(earliestPos + earliest.length);
                continue;
            }
        }

        // 用語の前のテキスト
        if (earliestPos > 0) {
            parts.push(remaining.slice(0, earliestPos));
        }

        // 用語をTermTooltipで囲む
        parts.push(<TermTooltip key={keyIdx++} term={earliest} />);

        remaining = remaining.slice(earliestPos + earliest.length);
    }

    return parts;
}
