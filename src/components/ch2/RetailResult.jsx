import React from 'react';
import { useAutoAdvance } from '../../hooks/useAutoAdvance';
import { useRetailStore } from '../../store/retailEngine';
import { detectBehaviorMilestone } from '../../data/behaviorMilestones';

const WEATHER_ICON = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', stormy: '⛈️' };
const SEASON_LABEL = { spring: '🌸春', summer: '🌻夏', autumn: '🍂秋', winter: '❄️冬' };

export default function RetailResult() {
    const state = useRetailStore(s => s);
    const nextTurn = useRetailStore(s => s.nextTurn);
    const autoMode = useRetailStore(s => s.autoMode);
    const result = state.weekResult;

    if (!result) return null;

    // 行動変化マイルストーン
    const behaviorMs = detectBehaviorMilestone(2, state, result);
    if (behaviorMs && !(state._behaviorMilestones || []).includes(behaviorMs.id)) {
        useRetailStore.setState({ _behaviorMilestones: [...(state._behaviorMilestones || []), behaviorMs.id] });
    }
    useAutoAdvance(autoMode && !behaviorMs, nextTurn);

    const isProfit = state.weeklyProfit >= 0;
    const isNewMilestone = state.milestonesHit.some(m => m.turn === state.turn);

    return (
        <div className="ch2-result">
            <div className="ch2-result__header">
                <h2>Week {state.turn} の結果</h2>
                <span className="ch2-result__weather">
                    {WEATHER_ICON[result.weather] || '☀️'} {SEASON_LABEL[result.season] || ''}
                </span>
            </div>

            {/* 来客数 */}
            <div className="ch2-result__customers">
                <div className="ch2-result__big-num">{result.customers}</div>
                <div className="ch2-result__sub">人が来店</div>
                {result.itemsSold > 0 && (
                    <div className="ch2-result__sub">{result.itemsSold}点が売れた</div>
                )}
            </div>

            {/* マイルストーン */}
            {isNewMilestone && (
                <div className="ch2-milestone">
                    <div className="ch2-milestone__icon">🎉</div>
                    <h3>初めての黒字！</h3>
                    <p>在庫を現金に変えることができた。</p>
                    <p>「眠っている現金」を目覚めさせる感覚を覚えよう。</p>
                </div>
            )}

            {/* 行動変化マイルストーン */}
            {behaviorMs && (
                <div className="ch2-milestone">
                    <div className="ch2-milestone__icon">{behaviorMs.icon}</div>
                    <h3>{behaviorMs.title}</h3>
                    {behaviorMs.text.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
            )}

            {/* P&L */}
            <div className="ch2-result__pl">
                <div className="ch2-result__row">
                    <span>売上</span><span>¥{result.sales.toLocaleString()}</span>
                </div>
                <div className="ch2-result__row ch2-result__row--indent">
                    <span>原価 (COGS)</span><span>−¥{result.cogs.toLocaleString()}</span>
                </div>
                <div className="ch2-result__divider" />
                <div className="ch2-result__row">
                    <span>粗利</span><span>¥{result.grossProfit.toLocaleString()}</span>
                </div>
                <div className="ch2-result__row ch2-result__row--indent">
                    <span>固定費</span><span>−¥{result.fixedCosts.toLocaleString()}</span>
                </div>
                {result.ipoDividend > 0 && (
                    <div className="ch2-result__row ch2-result__row--indent">
                        <span>IPO配当</span><span>+¥{result.ipoDividend.toLocaleString()}</span>
                    </div>
                )}
                <div className="ch2-result__divider" />
                <div className={`ch2-result__row ch2-result__row--total ${isProfit ? 'ch2-profit' : 'ch2-loss'}`}>
                    <span>純利益</span>
                    <span>{isProfit ? '+' : ''}¥{result.netProfit.toLocaleString()}</span>
                </div>
            </div>

            {/* 前週比較 */}
            {state.profitHistory.length >= 2 && (() => {
                const prev = state.profitHistory[state.profitHistory.length - 2];
                const diffs = [
                    { label: '売上', diff: result.sales - prev.sales },
                    { label: '利益', diff: result.netProfit - prev.profit },
                ];
                return (
                    <div className="ch2-result__pl" style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.62rem', color: 'var(--ch2-text-sub, #7a8ba0)', marginBottom: 4 }}>前週比</div>
                        {diffs.map((d, i) => (
                            <div key={i} className="ch2-result__row" style={{ fontSize: '0.72rem', padding: '2px 0' }}>
                                <span>{d.label}</span>
                                <span style={{ fontWeight: 600, color: d.diff > 0 ? '#34d399' : d.diff < 0 ? '#ef4444' : 'inherit' }}>
                                    {d.diff > 0 ? '↑' : d.diff < 0 ? '↓' : '→'} {d.diff >= 0 ? '+' : ''}¥{d.diff.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* 残高 */}
            <div className="ch2-result__balance">
                <span>現金残高</span>
                <span className={`ch2-result__balance-val ${state.money < 0 ? 'ch2-loss' : ''}`}>
                    ¥{state.money.toLocaleString()}
                </span>
            </div>

            {/* 在庫評価 */}
            <div className="ch2-result__balance">
                <span>在庫評価額</span>
                <span className="ch2-result__balance-val">
                    ¥{state.skus.reduce((s, sku) => s + sku.stock * sku.cost, 0).toLocaleString()}
                </span>
            </div>

            {/* 企業価値 */}
            {state.enterpriseValue > 0 && (
                <div className="ch2-result__balance">
                    <span>企業価値</span>
                    <span className="ch2-result__balance-val" style={{ color: 'var(--ch2-primary)' }}>
                        ¥{state.enterpriseValue.toLocaleString()}
                    </span>
                </div>
            )}

            <div className="ch2-actions">
                <button className="ch2-actions__go" onClick={nextTurn}>
                    次の週へ →
                </button>
            </div>
        </div>
    );
}
