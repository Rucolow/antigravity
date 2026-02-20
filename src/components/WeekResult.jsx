import { useGameStore } from '../store/gameEngine';
import { getKenjiLine } from '../data/kenjiLines';

export default function WeekResult() {
    const { weekResult, prevWeekResult, money, nextTurn, stamina, turn, metCharacters } = useGameStore();

    if (!weekResult) return null;

    // ケンジLINE（ケンジ登場後のみ）
    const kenjiLine = metCharacters.includes('kenji') ? getKenjiLine(turn) : null;

    const KenjiWidget = () => kenjiLine ? (
        <div className="kenji-line">
            <div className="kenji-line__header">
                <div className="kenji-line__avatar">ケ</div>
                ケンジ
            </div>
            {kenjiLine}
        </div>
    ) : null;

    // 強制休息ターン（倒壊後）
    if (weekResult.forcedRest) {
        return (
            <div className="screen results" style={{ justifyContent: 'flex-start', paddingTop: 32 }}>
                <div style={{
                    textAlign: 'center',
                    padding: '32px 0',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '0.7rem',
                        color: 'var(--red)',
                        marginBottom: 16,
                        letterSpacing: '0.1em',
                    }}>
                        DOWN...
                    </div>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>
                        ダウンしちゃった…！
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
                        働きすぎて体が限界に…
                        <br />丸一週間ベッドの上で過ごすハメに。
                        <br />
                        <br />
                        <span style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>
                            体は資本！ちゃんと休みも取ろう！
                        </span>
                    </p>
                </div>

                <div className="results__row">
                    <span>生活費</span>
                    <span className="results__value text-red">
                        ¥{weekResult.expenses.toLocaleString()}
                    </span>
                </div>

                <div className="results__total">
                    <span>今週の収支</span>
                    <span className="results__value text-red">
                        -¥{weekResult.expenses.toLocaleString()}
                    </span>
                </div>

                <div className="results__new-money">
                    <div className="results__new-money-label">所持金</div>
                    <div className="results__new-money-value">¥{money.toLocaleString()}</div>
                </div>

                <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--emerald)',
                    textAlign: 'center',
                    marginBottom: 16,
                }}>
                    ゆっくり休んで回復！ 体力 → {stamina}
                </div>

                <KenjiWidget />

                <button className="btn btn-primary" onClick={nextTurn} style={{ marginTop: 12 }}>
                    次の週へ →
                </button>
            </div>
        );
    }

    const rows = [
        { label: 'バイト', value: weekResult.baito, show: weekResult.baito > 0 },
        { label: 'フリマ', value: weekResult.furima, show: weekResult.furima > 0 },
        { label: 'せどり売上', value: weekResult.sedoriIncome, show: weekResult.sedoriIncome > 0 },
        { label: '　仕入れ', value: -weekResult.sedoriCost, show: weekResult.sedoriCost > 0, isExpense: true },
        { label: 'マルシェ売上', value: weekResult.marcheIncome, show: weekResult.marcheIncome > 0 },
        { label: '　材料費', value: -weekResult.marcheCost, show: weekResult.marcheCost > 0, isExpense: true },
        {
            label: weekResult.jointPurchaseFailed ? '共同仕入れ（失敗…）' : '共同仕入れ利益',
            value: weekResult.jointReturn || 0,
            show: (weekResult.jointReturn || 0) > 0 || weekResult.jointPurchaseFailed
        },
        { label: '生活費', value: -weekResult.expenses, show: true, isExpense: true },
    ];

    // 結果に応じたコメント
    const resultComment = weekResult.total >= 30000 ? '大儲け！今週はツイてる！'
        : weekResult.total >= 10000 ? 'なかなかの稼ぎ！'
            : weekResult.total >= 0 ? 'プラスで終われたね'
                : weekResult.total >= -10000 ? 'ちょっと赤字…次は取り返そう'
                    : '大赤字…何があった？';

    return (
        <div className="screen results" style={{ justifyContent: 'flex-start', paddingTop: 32 }}>
            <p className="section-header">今週のレポート</p>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 24 }}>{resultComment}</h2>

            {weekResult.bonus > 0 && (
                <div style={{
                    padding: '6px 12px',
                    background: 'rgba(52, 211, 153, 0.08)',
                    border: '1px solid var(--emerald-dim)',
                    fontSize: '0.8rem',
                    color: 'var(--emerald)',
                    marginBottom: 12,
                }}>
                    気分転換が効いた！ +{(weekResult.bonus * 100).toFixed(0)}%
                </div>
            )}

            {/* 好調ボーナス表示 */}
            {weekResult.staminaMultiplier > 1 && (
                <div style={{
                    padding: '6px 12px',
                    background: 'rgba(64, 232, 112, 0.08)',
                    border: '1px solid var(--emerald-dim)',
                    fontSize: '0.8rem',
                    color: 'var(--emerald)',
                    marginBottom: 12,
                }}>
                    体調バッチリで効率アップ！ ×{(weekResult.staminaMultiplier * 100).toFixed(0)}%
                </div>
            )}

            {/* 疲労ペナルティ表示 */}
            {weekResult.staminaMultiplier < 1 && (
                <div style={{
                    padding: '6px 12px',
                    background: weekResult.staminaMultiplier >= 0.85 ? 'rgba(240,192,64,0.08)' : 'rgba(240,64,64,0.08)',
                    border: `1px solid ${weekResult.staminaMultiplier >= 0.85 ? 'var(--gold-dim)' : 'var(--red-dim)'}`,
                    fontSize: '0.8rem',
                    color: weekResult.staminaMultiplier >= 0.85 ? 'var(--gold)' : 'var(--red)',
                    marginBottom: 12,
                }}>
                    {weekResult.staminaMultiplier >= 0.85
                        ? 'お疲れでペースダウン… ×' + (weekResult.staminaMultiplier * 100).toFixed(0) + '%'
                        : 'ヘトヘトで集中できない… ×' + (weekResult.staminaMultiplier * 100).toFixed(0) + '%'}
                </div>
            )}

            {/* 自炊デバフ */}
            {weekResult.efficiencyMult && weekResult.efficiencyMult < 1 && (
                <div style={{
                    padding: '6px 12px',
                    background: 'rgba(240,192,64,0.08)',
                    border: '1px solid var(--gold-dim)',
                    fontSize: '0.8rem',
                    color: 'var(--gold)',
                    marginBottom: 12,
                }}>
                    自炊で疲れ気味… 効率 ×{(weekResult.efficiencyMult * 100).toFixed(0)}%
                </div>
            )}

            {/* 共同仕入れ失敗表示 */}
            {weekResult.jointPurchaseFailed && (
                <div style={{
                    padding: '8px 12px',
                    background: 'rgba(240,64,64,0.08)',
                    border: '1px solid var(--red-dim)',
                    fontSize: '0.8rem',
                    color: 'var(--red)',
                    marginBottom: 12,
                }}>
                    共同仕入れが失敗…¥50,000の投資が戻ってこなかった。リスクは常にある。
                </div>
            )}

            {rows.filter(r => r.show).map((row, i) => (
                <div key={i} className="results__row">
                    <span>{row.label}</span>
                    <span className={`results__value ${row.isExpense ? 'text-red' : 'text-emerald'}`}>
                        {row.isExpense ? '' : '+'}¥{Math.abs(row.value).toLocaleString()}
                    </span>
                </div>
            ))}

            <div className="results__total">
                <span>今週の収支</span>
                <span className={`results__value ${weekResult.total >= 0 ? 'text-gold' : 'text-red'}`}>
                    {weekResult.total >= 0 ? '+' : ''}¥{weekResult.total.toLocaleString()}
                </span>
            </div>

            {/* 前週比 */}
            {prevWeekResult && !prevWeekResult.forcedRest && (() => {
                const diff = weekResult.total - prevWeekResult.total;
                const isUp = diff > 0;
                const isDown = diff < 0;
                return (
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '6px 12px',
                        background: isUp ? 'rgba(26,158,82,0.06)' : isDown ? 'rgba(216,48,48,0.06)' : 'transparent',
                        fontSize: '0.78rem',
                        color: isUp ? 'var(--emerald)' : isDown ? 'var(--red)' : 'var(--text-muted)',
                        marginBottom: 4,
                    }}>
                        <span>前週比</span>
                        <span style={{ fontWeight: 600 }}>
                            {isUp ? '↑' : isDown ? '↓' : '→'} {diff >= 0 ? '+' : ''}¥{diff.toLocaleString()}
                        </span>
                    </div>
                );
            })()}

            <div className="results__new-money">
                <div className="results__new-money-label">所持金</div>
                <div className="results__new-money-value">¥{money.toLocaleString()}</div>
            </div>

            {/* 体力変動 */}
            <div style={{
                fontSize: '0.85rem',
                color: weekResult.staminaChange > 0 ? 'var(--emerald)'
                    : weekResult.staminaChange < 0 ? 'var(--red)'
                        : 'var(--text-muted)',
                textAlign: 'center',
                marginBottom: 8,
            }}>
                体力 {weekResult.staminaChange > 0 ? '+' : ''}{weekResult.staminaChange} → {stamina}
            </div>

            {/* 倒壊警告 */}
            {weekResult.collapsed && (
                <div style={{
                    padding: '10px 14px',
                    background: 'rgba(240,64,64,0.15)',
                    border: '2px solid var(--red)',
                    fontSize: '0.85rem',
                    color: 'var(--red)',
                    textAlign: 'center',
                    fontWeight: 600,
                    marginBottom: 16,
                }}>
                    体力ゼロ！来週は強制的にお休みだ…
                </div>
            )}

            <KenjiWidget />

            <button className="btn btn-primary" onClick={nextTurn} style={{ marginTop: 12 }}>
                次の週へ →
            </button>
        </div>
    );
}
