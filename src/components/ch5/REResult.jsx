/**
 * Ch.5 月次結果表示
 */
import React from 'react';
import { useAutoAdvance } from '../../hooks/useAutoAdvance';
import { useREStore } from '../../store/realEstateEngine';
import { getCh5Month, getCh5Year } from '../../data/ch5Constants';
import { detectBehaviorMilestone } from '../../data/behaviorMilestones';

export default function REResult() {
    const s = useREStore();
    const nextTurn = useREStore(st => st.nextTurn);
    const autoMode = useREStore(st => st.autoMode);

    // 行動変化マイルストーン
    const behaviorMs = detectBehaviorMilestone(5, s, {});
    if (behaviorMs && !(s._behaviorMilestones || []).includes(behaviorMs.id)) {
        useREStore.setState({ _behaviorMilestones: [...(s._behaviorMilestones || []), behaviorMs.id] });
    }
    useAutoAdvance(autoMode && !s.gameClear && !behaviorMs, nextTurn);

    const month = getCh5Month(s.turn);
    const year = getCh5Year(s.turn);

    return (
        <>
            <div className="ch5-header">
                <div className="ch5-header__chapter">Chapter 5 — 不動産投資</div>
                <div className="ch5-header__title">{year}年目 {month} の結果</div>
            </div>

            {/* CF サマリー */}
            <div className="ch5-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--ch5-text-sub)' }}>税引後キャッシュフロー</div>
                <div style={{
                    fontSize: '1.4rem', fontWeight: 800,
                    color: s.monthlyCashFlow >= 0 ? 'var(--ch5-green)' : 'var(--ch5-red)',
                    margin: '0.1rem 0',
                }}>
                    {s.monthlyCashFlow >= 0 ? '+' : ''}¥{(s.monthlyCashFlow || 0).toLocaleString()}
                </div>
            </div>

            {/* 前月比較 */}
            {(s.history || []).length >= 2 && (() => {
                const prev = s.history[s.history.length - 2];
                const cfDiff = (s.monthlyCashFlow || 0) - (prev.monthlyCashFlow || 0);
                const rentDiff = (s.monthlyRent || 0) - (prev.monthlyRent || 0);
                const nwDiff = (s.netWorth || 0) - (prev.netWorth || 0);
                const diffs = [
                    { label: 'CF', diff: cfDiff },
                    { label: '家賃収入', diff: rentDiff },
                    { label: '純資産', diff: nwDiff },
                ];
                return (
                    <div className="ch5-card" style={{ padding: '8px 14px' }}>
                        <div style={{ fontSize: '0.62rem', color: 'var(--ch5-text-sub)', marginBottom: 4 }}>前月比</div>
                        {diffs.map((d, i) => (
                            <div key={i} className="ch5-row" style={{ fontSize: '0.72rem', padding: '2px 0' }}>
                                <span className="ch5-row__label">{d.label}</span>
                                <span className="ch5-row__value" style={{ fontWeight: 600, color: d.diff > 0 ? 'var(--ch5-green)' : d.diff < 0 ? 'var(--ch5-red)' : 'inherit' }}>
                                    {d.diff > 0 ? '↑' : d.diff < 0 ? '↓' : '→'} {d.diff >= 0 ? '+' : ''}¥{d.diff.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* 内訳 */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">月次内訳</div>
                <div className="ch5-row">
                    <span className="ch5-row__label">家賃収入</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-green)' }}>+¥{(s.monthlyRent || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">運営経費</span>
                    <span className="ch5-row__value">-¥{(s.monthlyExpenses || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">ローン返済</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-blue)' }}>-¥{(s.monthlyLoanPayment || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">税金</span>
                    <span className="ch5-row__value">-¥{(s.monthlyTax || 0).toLocaleString()}</span>
                </div>
                {s.totalAnnualDepreciation > 0 && (
                    <div className="ch5-row" style={{ fontSize: '0.62rem' }}>
                        <span className="ch5-row__label" style={{ color: 'var(--ch5-green)' }}>減価償却による節税 /月</span>
                        <span className="ch5-row__value" style={{ color: 'var(--ch5-green)' }}>-¥{Math.round(s.taxSavings / 12).toLocaleString()}</span>
                    </div>
                )}
            </div>

            {/* ポートフォリオ状況 */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">ポートフォリオ状況</div>
                {s.properties.map(p => (
                    <div key={p.id} className="ch5-row">
                        <span className="ch5-row__label">{p.name}</span>
                        <span className="ch5-row__value">
                            稼働{Math.round((p.occupancyRate || 0) * 100)}% ／ DSCR {p.dscr}
                        </span>
                    </div>
                ))}
            </div>

            {/* 純資産 */}
            <div className="ch5-card">
                <div className="ch5-kpi-row ch5-kpi-row--triple">
                    <div className="ch5-kpi">
                        <div className="ch5-kpi__label">総資産</div>
                        <div className="ch5-kpi__value">¥{Math.round((s.totalAssets || 0) / 10000).toLocaleString()}万</div>
                    </div>
                    <div className="ch5-kpi">
                        <div className="ch5-kpi__label">総負債</div>
                        <div className="ch5-kpi__value ch5-kpi__value--blue">¥{Math.round((s.totalLiabilities || 0) / 10000).toLocaleString()}万</div>
                    </div>
                    <div className="ch5-kpi">
                        <div className="ch5-kpi__label">純資産</div>
                        <div className={`ch5-kpi__value ${s.netWorth >= 0 ? 'ch5-kpi__value--green' : 'ch5-kpi__value--red'}`}>
                            ¥{Math.round((s.netWorth || 0) / 10000).toLocaleString()}万
                        </div>
                    </div>
                </div>
                <div className="ch5-progress" style={{ marginTop: '0.3rem' }}>
                    <div className="ch5-progress__bar">
                        <div className="ch5-progress__fill" style={{ width: `${s.netWorthProgress}%` }} />
                    </div>
                    <div className="ch5-progress__target">
                        目標まで ¥{Math.max(0, Math.round((100_000_000 - (s.netWorth || 0)) / 10000)).toLocaleString()}万
                    </div>
                </div>
            </div>

            {/* 累計 */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">累計実績</div>
                <div className="ch5-row">
                    <span className="ch5-row__label">総家賃収入</span>
                    <span className="ch5-row__value">¥{(s.totalRentIncome || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">総経費</span>
                    <span className="ch5-row__value">¥{(s.totalExpensesPaid || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">総返済額</span>
                    <span className="ch5-row__value">¥{(s.totalLoanPaid || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">総税額</span>
                    <span className="ch5-row__value">¥{(s.totalTaxPaid || 0).toLocaleString()}</span>
                </div>
            </div>

            <button className="ch5-btn ch5-btn--primary" onClick={nextTurn}>
                {s.gameClear ? 'ゲームクリア！ →' : '次の月へ →'}
            </button>
        </>
    );
}
