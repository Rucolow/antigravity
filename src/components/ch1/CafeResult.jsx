import React from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import { useAutoAdvance } from '../../hooks/useAutoAdvance';
import { detectBehaviorMilestone } from '../../data/behaviorMilestones';

export default function CafeResult() {
    const state = useCafeStore(s => s);
    const nextTurn = useCafeStore(s => s.nextTurn);
    const autoMode = useCafeStore(s => s.autoMode);
    const result = state.weekResult;

    if (!result) return null;

    const weatherEmoji = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', typhoon: '🌀' };
    const isBlack = result.netProfit >= 0;

    // マイルストーン検出
    const newMilestones = state.milestonesHit.filter(m => m.turn === state.turn);
    const isFirstBlack = newMilestones.some(m => m.type === 'first_black');

    // 行動変化マイルストーン
    const behaviorMs = detectBehaviorMilestone(1, state, result);
    if (behaviorMs && !(state._behaviorMilestones || []).includes(behaviorMs.id)) {
        useCafeStore.setState({ _behaviorMilestones: [...(state._behaviorMilestones || []), behaviorMs.id] });
    }

    // autoMode: マイルストーンなし時のみ自動進行
    useAutoAdvance(autoMode && !isFirstBlack && newMilestones.length === 0 && !behaviorMs, nextTurn);

    return (
        <div className="ch1-result">
            <div className="ch1-result__header">
                <h2>Week {state.turn} 結果</h2>
                <span className="ch1-result__weather">{weatherEmoji[result.weather] || '☀️'} {result.weather}</span>
            </div>

            {/* 初黒字演出 */}
            {isFirstBlack && (
                <div className="ch1-milestone">
                    <div className="ch1-milestone__icon">✨</div>
                    <h3>初の黒字！</h3>
                    <p>赤字続きだった日々が、たった¥{result.netProfit.toLocaleString()}だけど、<br />
                        ようやく黒字に変わった。</p>
                    <p>この¥{result.netProfit.toLocaleString()}は、バイト時代の同額とは全く違う重み。<br />
                        自分の判断で、自分の店で、自分が生み出した利益だ。</p>
                </div>
            )}

            {/* 行動変化マイルストーン */}
            {behaviorMs && (
                <div className="ch1-milestone">
                    <div className="ch1-milestone__icon">{behaviorMs.icon}</div>
                    <h3>{behaviorMs.title}</h3>
                    {behaviorMs.text.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
            )}

            {/* 来客 */}
            <div className="ch1-result__customers">
                <div className="ch1-result__big-num">{result.customers}人</div>
                <div className="ch1-result__sub">来客数</div>
                {result.turnedAway > 0 && (
                    <div className="ch1-result__turnedaway">
                        ⚠️ {result.turnedAway}人をお断り
                    </div>
                )}
            </div>

            {/* P&L */}
            <div className="ch1-result__pl">
                <div className="ch1-result__row">
                    <span>売上</span>
                    <span className="ch1-result__val">¥{result.sales.toLocaleString()}</span>
                </div>
                <div className="ch1-result__row ch1-result__row--indent">
                    <span>原価 (原価率{result.costRatio}%)</span>
                    <span>−¥{result.cogs.toLocaleString()}</span>
                </div>
                <div className="ch1-result__divider" />
                <div className="ch1-result__row">
                    <span>粗利</span>
                    <span>¥{result.grossProfit.toLocaleString()}</span>
                </div>
                <div className="ch1-result__row ch1-result__row--indent">
                    <span>固定費</span>
                    <span>−¥{result.fixedCosts.toLocaleString()}</span>
                </div>
                <div className="ch1-result__divider" />
                <div className={`ch1-result__row ch1-result__row--total ${isBlack ? 'ch1-profit' : 'ch1-loss'}`}>
                    <span>純利益</span>
                    <span>{isBlack ? '+' : ''}¥{result.netProfit.toLocaleString()}</span>
                </div>
            </div>

            {/* 前週比較 */}
            {state.profitHistory.length >= 2 && (() => {
                const prev = state.profitHistory[state.profitHistory.length - 2];
                const diffs = [
                    { label: '売上', diff: result.sales - prev.sales },
                    { label: '利益', diff: result.netProfit - prev.profit },
                    { label: '来客', diff: result.customers - prev.customers, unit: '人' },
                ];
                return (
                    <div className="ch1-result__pl" style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.62rem', color: '#8b7355', marginBottom: 4 }}>前週比</div>
                        {diffs.map((d, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', padding: '2px 0' }}>
                                <span style={{ color: '#8b7355' }}>{d.label}</span>
                                <span style={{ fontWeight: 600, color: d.diff > 0 ? '#34d399' : d.diff < 0 ? '#ef4444' : '#8b7355' }}>
                                    {d.diff > 0 ? '↑' : d.diff < 0 ? '↓' : '→'} {d.diff >= 0 ? '+' : ''}{d.unit ? d.diff : `¥${d.diff.toLocaleString()}`}{d.unit || ''}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* 損益分岐点 */}
            <div className="ch1-result__breakeven">
                {state.breakEvenSales > 0 && (
                    result.sales >= state.breakEvenSales
                        ? <span className="ch1-profit">✅ 損益分岐点クリア（¥{state.breakEvenSales.toLocaleString()}）</span>
                        : <span className="ch1-loss">❌ 分岐点まであと¥{(state.breakEvenSales - result.sales).toLocaleString()}</span>
                )}
            </div>

            {/* 現金残高 */}
            <div className="ch1-result__balance">
                <span>現金残高</span>
                <span className={`ch1-result__balance-val ${state.money < 200000 ? 'ch1-loss' : ''}`}>
                    ¥{state.money.toLocaleString()}
                </span>
            </div>

            <button className="ch1-setup__confirm" onClick={nextTurn}>
                次の週へ →
            </button>
        </div>
    );
}
