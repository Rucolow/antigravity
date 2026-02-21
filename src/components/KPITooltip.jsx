/**
 * KPIツールチップ — ダッシュボード上の指標名をタップすると解説表示
 */
import React, { useState } from 'react';

const KPI_GLOSSARY = {
    // Ch.1
    '損益分岐点': '固定費をまかなうために必要な最低限の売上額。これを超えれば黒字、下回れば赤字。',
    '粗利': '売上から原価（材料費）を引いた金額。ここから固定費を払って残ったものが純利益。',
    '原価率': '売上に対する原材料費の割合。30%なら、100円売って30円が材料費。低いほど利益が残りやすい。',

    // Ch.2
    'COGS': 'Cost of Goods Sold＝売上原価。売れた商品の仕入れ値の合計。在庫として残っている分は含まない。',
    '在庫回転率': '在庫が何回入れ替わったかを示す指標。高いほど在庫が効率よく売れている。',
    '企業価値': '会社全体の価値。利益×倍率で計算されることが多い。M&AやIPOの時の売却価格の目安。',

    // Ch.3
    '稼働率': '全客室のうち、実際に泊まり客がいた割合。稼働率80%なら、10室中8室が埋まっている状態。',
    'ADR': 'Average Daily Rate＝平均客室単価。売れた部屋の1泊あたりの平均料金。高いほど単価が取れている。',
    'RevPAR': 'Revenue Per Available Room＝販売可能客室あたり収益。ADR × 稼働率。ホテルの総合力を測る最も重要な指標。',
    'OTA': 'Online Travel Agent＝オンライン旅行代理店。じゃらん、Booking.comなど。手数料15-20%が一般的。',
    '直販': '自社ウェブサイトなどOTAを通さない予約。手数料がかからず利益率が高い。',

    // Ch.4
    'CAC': 'Customer Acquisition Cost＝顧客獲得コスト。1人の新規顧客を獲得するためにかかった広告費。低いほど効率的。',
    'LTV': 'Life Time Value＝顧客生涯価値。1人の顧客が取引全体で生み出す売上の合計。リピーターほどLTVが高い。',
    'LTV/CAC': 'LTVをCACで割った比率。3倍以上が健全の目安。1倍以下なら「客を買うほど赤字」の状態。',
    'ROAS': 'Return On Ad Spend＝広告費用対効果。広告費に対してどれだけ売上が返ってきたか。2倍なら広告費の2倍の売上。',
    'オーガニック比率': '広告を使わずに来た顧客の割合。高いほど「広告を止めても売上が残る」健全な状態。',

    // Ch.5
    'DSCR': 'Debt Service Coverage Ratio＝返済余裕率。家賃収入÷ローン返済額。1.0以下なら家賃で返済を賄えない危険な状態。1.3以上が安全圏。',
    'LTV比率': 'Loan To Value＝借入比率。物件価格に対する借入金の割合。80%なら2割が自己資金。高いほどレバレッジが効くがリスクも高い。',
    '純資産': '総資産から総負債を引いた金額。あなたの「本当の」資産。',
    'CF': 'Cash Flow＝キャッシュフロー。実際に手元に入ってくるお金の流れ。利益が出ていてもCFがマイナスなら現金が減る。',
    '減価償却': '建物の価値が時間とともに減少する分を経費として計上すること。現金は出ていかないが、税金が減る。「お金が出ない経費」。',
    '表面利回り': '年間家賃収入÷物件価格。物件の収益力の目安。ただし経費やローンを考慮していないので要注意。',
    '実質利回り': '(年間家賃−年間経費)÷物件価格。表面利回りより現実的な収益力を示す。',
};

export default function KPITooltip({ term, children }) {
    const [open, setOpen] = useState(false);
    const explanation = KPI_GLOSSARY[term];

    if (!explanation) return children || term;

    return (
        <>
            <span
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                style={{
                    cursor: 'pointer',
                    borderBottom: '1px dotted currentColor',
                    opacity: 0.85,
                }}
            >
                {children || term}
                <span style={{ fontSize: '0.55rem', marginLeft: 2, opacity: 0.5 }}>ⓘ</span>
            </span>

            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, padding: 24,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#1a1a2e', borderRadius: 12, padding: '16px 20px',
                            maxWidth: 320, width: '100%', border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 6, color: '#fff' }}>
                            {term}とは？
                        </div>
                        <div style={{ fontSize: '0.72rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}>
                            {explanation}
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            style={{
                                marginTop: 12, width: '100%', padding: '8px 0',
                                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: 6, color: '#fff', fontSize: '0.72rem', cursor: 'pointer',
                            }}
                        >
                            なるほど！
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
