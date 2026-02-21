/**
 * 週結果表示画面
 */
import React from 'react';
import { useAutoAdvance } from '../../hooks/useAutoAdvance';
import { useECStore } from '../../store/ecEngine';
import { detectBehaviorMilestone } from '../../data/behaviorMilestones';

export default function ECResult() {
    const state = useECStore();
    const autoMode = state.autoMode;

    // 行動変化マイルストーン
    const behaviorMs = detectBehaviorMilestone(4, state, state.weekResult || {});
    if (behaviorMs && !(state._behaviorMilestones || []).includes(behaviorMs.id)) {
        useECStore.setState({ _behaviorMilestones: [...(state._behaviorMilestones || []), behaviorMs.id] });
    }
    useAutoAdvance(autoMode && !behaviorMs, () => state.nextTurn());

    const profitClass = (state.weeklyProfit || 0) >= 0 ? 'ch4-kpi__value--green' : 'ch4-kpi__value--red';

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">Week {state.turn} 結果</div>
            </div>

            <div className="ch4-result-summary">
                <div className="ch4-result-summary__turn">週間純利益</div>
                <div className={`ch4-result-summary__value ${profitClass}`}>
                    {(state.weeklyProfit || 0) >= 0 ? '' : '-'}¥{Math.abs(state.weeklyProfit || 0).toLocaleString()}
                </div>
                <div className="ch4-result-summary__label">
                    売上 ¥{(state.weeklySales || 0).toLocaleString()} ｜ 注文 {state.weeklyOrders || 0}件
                </div>
            </div>

            {/* ユニットエコノミクス */}
            <div className="ch4-kpi-row ch4-kpi-row--quad">
                <div className="ch4-kpi">
                    <div className="ch4-kpi__label">CAC</div>
                    <div className={`ch4-kpi__value${(state.cac || 0) > 7000 ? ' ch4-kpi__value--red' : ''}`}>
                        ¥{(state.cac || 0).toLocaleString()}
                    </div>
                </div>
                <div className="ch4-kpi">
                    <div className="ch4-kpi__label">LTV</div>
                    <div className="ch4-kpi__value">¥{(state.ltv || 0).toLocaleString()}</div>
                </div>
                <div className="ch4-kpi">
                    <div className="ch4-kpi__label">LTV/CAC</div>
                    <div className={`ch4-kpi__value ${(state.ltvCacRatio || 0) >= 3 ? 'ch4-kpi__value--green' : (state.ltvCacRatio || 0) < 1.5 ? 'ch4-kpi__value--red' : 'ch4-kpi__value--accent'}`}>
                        {state.ltvCacRatio || 0}x
                    </div>
                </div>
                <div className="ch4-kpi">
                    <div className="ch4-kpi__label">ROAS</div>
                    <div className="ch4-kpi__value">{state.roas || 0}x</div>
                </div>
            </div>

            {/* 前週比較 */}
            {state.profitHistory.length >= 2 && (() => {
                const prev = state.profitHistory[state.profitHistory.length - 2];
                const diffs = [
                    { label: '売上', diff: (state.weeklySales || 0) - (prev.sales || 0), fmt: v => `¥${v.toLocaleString()}` },
                    { label: '利益', diff: (state.weeklyProfit || 0) - (prev.profit || 0), fmt: v => `¥${v.toLocaleString()}` },
                    { label: '注文', diff: (state.weeklyOrders || 0) - (prev.orders || 0), fmt: v => `${v}件` },
                ];
                return (
                    <div className="ch4-card" style={{ padding: '8px 14px' }}>
                        <div style={{ fontSize: '0.62rem', color: 'var(--ch4-text-sub)', marginBottom: 4 }}>前週比</div>
                        {diffs.map((d, i) => (
                            <div key={i} className="ch4-row" style={{ fontSize: '0.72rem', padding: '2px 0' }}>
                                <span className="ch4-row__label">{d.label}</span>
                                <span className="ch4-row__value" style={{ fontWeight: 600, color: d.diff > 0 ? 'var(--ch4-green)' : d.diff < 0 ? 'var(--ch4-red)' : 'inherit' }}>
                                    {d.diff > 0 ? '↑' : d.diff < 0 ? '↓' : '→'} {d.diff >= 0 ? '+' : ''}{d.fmt(d.diff)}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* 顧客内訳 */}
            <div className="ch4-card">
                <div className="ch4-card__title">顧客内訳</div>
                <div className="ch4-row">
                    <span className="ch4-row__label">新規顧客（広告経由）</span>
                    <span className="ch4-row__value">{state.weeklyNewCustomers || 0}人</span>
                </div>
                <div className="ch4-row">
                    <span className="ch4-row__label">リピーター</span>
                    <span className="ch4-row__value">{state.weeklyRepeatCustomers || 0}人</span>
                </div>
                <div className="ch4-row">
                    <span className="ch4-row__label">累計顧客数</span>
                    <span className="ch4-row__value">{(state.totalCustomers || 0).toLocaleString()}人</span>
                </div>
                <div className="ch4-row">
                    <span className="ch4-row__label">オーガニック比率</span>
                    <span className="ch4-row__value" style={{
                        color: (state.organicRatio || 0) >= 0.5 ? 'var(--ch4-green)' : 'var(--ch4-text)'
                    }}>
                        {Math.round((state.organicRatio || 0) * 100)}%
                    </span>
                </div>
            </div>

            {/* 累計 */}
            <div className="ch4-card">
                <div className="ch4-card__title">累計</div>
                <div className="ch4-row">
                    <span className="ch4-row__label">総売上</span>
                    <span className="ch4-row__value">¥{(state.totalSales || 0).toLocaleString()}</span>
                </div>
                <div className="ch4-row">
                    <span className="ch4-row__label">広告費累計</span>
                    <span className="ch4-row__value" style={{ color: 'var(--ch4-orange)' }}>
                        ¥{(state.totalAdSpend || 0).toLocaleString()}
                    </span>
                </div>
                <div className="ch4-row ch4-row--total">
                    <span className="ch4-row__label">資金残高</span>
                    <span className="ch4-row__value">¥{(state.money || 0).toLocaleString()}</span>
                </div>
            </div>

            {/* 広告停止テスト結果 */}
            {state.adStopTest && (
                <div className="ch4-card" style={{ borderColor: 'var(--ch4-gold)' }}>
                    <div className="ch4-card__title" style={{ color: 'var(--ch4-gold)' }}>
                        【実験結果】広告停止テスト
                    </div>
                    <p style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--ch4-text)' }}>
                        広告を止めた1週間。<br />
                        売上の約{Math.round((1 - (state.organicRatio || 0.25)) * 100)}%が広告依存だった。<br />
                        残りの{Math.round((state.organicRatio || 0.25) * 100)}%——これが"仕組み"だ。<br /><br />
                        リピーター。ブックマーク。口コミ。検索。<br />
                        広告を止めても残る客。
                    </p>
                </div>
            )}

            <button className="ch4-btn ch4-btn--primary" onClick={state.nextTurn}>
                次の週へ →
            </button>
        </>
    );
}
