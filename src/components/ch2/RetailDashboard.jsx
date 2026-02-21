import React, { useState } from 'react';
import { useRetailStore } from '../../store/retailEngine';
import { LOCATIONS, INDUSTRIES, getCh2Phase, CH2_PHASES } from '../../data/ch2Constants';
import GoalBar from '../GoalBar';
import AdvisorBar from '../AdvisorBar';
import WeeklyFocusBar from '../WeeklyFocusBar';
import { CH2_GOAL } from '../../data/chapterGoals';
import { getWeeklyFocusCards } from '../../data/weeklyFocusCards';

const WEATHER_ICON = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', stormy: '⛈️' };
const STATUS_LABEL = { hot: '🔥売れ筋', normal: '✅通常', slow: '⚠️低回転', dead: '💀死に筋', stockout: '🚫品切れ' };
const STATUS_CLASS = { hot: 'hot', normal: 'normal', slow: 'slow', dead: 'dead', stockout: 'stockout' };

export default function RetailDashboard() {
    const state = useRetailStore(s => s);
    const confirmWeek = useRetailStore(s => s.confirmWeek);
    const loc = LOCATIONS[state.locationKey];
    const ind = INDUSTRIES[state.industryKey];
    const ch2Phase = getCh2Phase(state.turn);
    const phaseInfo = CH2_PHASES[ch2Phase];

    const isSimulating = state.phase === 'ch2-simulating';
    const [selectedFocus, setSelectedFocus] = useState(state._lastFocus || null);

    // 在庫評価額
    const inventoryValue = state.skus.reduce((sum, sku) => sum + sku.stock * sku.cost, 0);

    // 資金燃焼アラート
    const weeklyLoss = state.weeklyProfit < 0 ? Math.abs(state.weeklyProfit) : 0;
    const weeksLeft = weeklyLoss > 0 ? Math.floor(state.money / weeklyLoss) : null;

    return (
        <div className="ch2-dash">
            {/* ヘッダー */}
            <div className="ch2-dash__header">
                <div className="ch2-dash__shop-name">{state.shopName || ind?.name || 'My Shop'}</div>
                <div className="ch2-dash__turn">
                    Week {state.turn} · {phaseInfo?.label || '---'}
                </div>
            </div>

            {/* チャプターゴール */}
            <GoalBar goal={CH2_GOAL} state={state} />
            <AdvisorBar chapter={2} state={state} />
            <WeeklyFocusBar cards={getWeeklyFocusCards(2)} selected={selectedFocus} onSelect={setSelectedFocus} />

            {/* KPI カード行 */}
            <div className="ch2-kpi-row">
                <div className="ch2-kpi">
                    <span className="ch2-kpi__label">現金</span>
                    <span className={`ch2-kpi__value ${state.money < 200000 ? 'ch2-kpi__value--danger' : ''}`}>
                        ¥{state.money.toLocaleString()}
                    </span>
                </div>
                <div className="ch2-kpi">
                    <span className="ch2-kpi__label">評判</span>
                    <span className="ch2-kpi__value">{'★'.repeat(Math.floor(state.reputation))}{'☆'.repeat(5 - Math.floor(state.reputation))}</span>
                    <span className="ch2-kpi__sub">{state.reputation.toFixed(1)}</span>
                </div>
                <div className="ch2-kpi">
                    <span className="ch2-kpi__label">在庫額</span>
                    <span className="ch2-kpi__value">¥{inventoryValue.toLocaleString()}</span>
                </div>
            </div>

            {/* 損益分岐点 */}
            {state.breakEvenSales > 0 && (
                <div className="ch2-breakeven">
                    <div className="ch2-breakeven__label">損益分岐点</div>
                    <div className="ch2-breakeven__bar">
                        <div className="ch2-breakeven__fill"
                            style={{ width: `${Math.min(100, (state.weeklySales / state.breakEvenSales) * 100)}%` }}
                        />
                        <span className="ch2-breakeven__marker" />
                    </div>
                    <div className="ch2-breakeven__text">
                        {state.weeklySales >= state.breakEvenSales
                            ? <span className="ch2-profit">黒字圏！ 売上¥{state.weeklySales.toLocaleString()} / 分岐点¥{state.breakEvenSales.toLocaleString()}</span>
                            : <span className="ch2-loss">あと¥{(state.breakEvenSales - state.weeklySales).toLocaleString()}で黒字</span>
                        }
                    </div>
                </div>
            )}

            {/* アラート */}
            {weeksLeft !== null && weeksLeft < 12 && (
                <div className="ch2-alert ch2-alert--danger">
                    🔴 資金燃焼アラート: 残り約{weeksLeft}週で資金が尽きる
                </div>
            )}

            {/* P&L要約 */}
            {state.turn > 5 && (
                <div className="ch2-pl">
                    <h3>先週のP&L</h3>
                    <div className="ch2-pl__row">
                        <span>売上</span><span>¥{state.weeklySales.toLocaleString()}</span>
                    </div>
                    <div className="ch2-pl__row ch2-pl__row--sub">
                        <span>原価(COGS)</span><span>−¥{(state.weekResult?.cogs || 0).toLocaleString()}</span>
                    </div>
                    <div className="ch2-pl__row">
                        <span>粗利</span><span>¥{(state.weekResult?.grossProfit || 0).toLocaleString()}</span>
                    </div>
                    <div className="ch2-pl__row ch2-pl__row--sub">
                        <span>固定費</span><span>−¥{(state.weekResult?.fixedCosts || 0).toLocaleString()}</span>
                    </div>
                    <div className={`ch2-pl__row ch2-pl__row--total ${state.weeklyProfit >= 0 ? 'ch2-profit' : 'ch2-loss'}`}>
                        <span>純利益</span><span>{state.weeklyProfit >= 0 ? '+' : ''}¥{state.weeklyProfit.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* 在庫リスト */}
            <div className="ch2-inventory">
                <h3>在庫状況</h3>
                {state.skus.map(sku => (
                    <div key={sku.id} className="ch2-inventory__item">
                        <span className="ch2-inventory__name">{sku.name}</span>
                        <span className="ch2-inventory__stock">{sku.stock}個</span>
                        <span className={`ch2-inventory__status ch2-inventory__status--${STATUS_CLASS[sku.status] || 'normal'}`}>
                            {STATUS_LABEL[sku.status] || sku.status}
                        </span>
                    </div>
                ))}
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <button
                        className="ch2-actions__exit"
                        style={{ width: 'auto', display: 'inline-block', padding: '6px 16px', fontSize: '0.72rem' }}
                        onClick={() => useRetailStore.setState({ phase: 'ch2-inventory' })}
                    >
                        在庫管理 →
                    </button>
                </div>
            </div>

            {/* CF計算書 */}
            {state.cfUnlocked && state.cfStatement && (
                <div className="ch2-cf">
                    <h3>📊 CF計算書</h3>
                    <div className="ch2-cf__row">
                        <span>営業CF</span>
                        <span className={state.cfStatement.operatingCF >= 0 ? 'ch2-profit' : 'ch2-loss'}>
                            ¥{state.cfStatement.operatingCF.toLocaleString()}
                        </span>
                    </div>
                    <div className="ch2-cf__row">
                        <span>投資CF</span>
                        <span>¥{state.cfStatement.investingCF.toLocaleString()}</span>
                    </div>
                    <div className="ch2-cf__row ch2-cf__row--total">
                        <span>合計CF</span>
                        <span className={state.cfStatement.totalCF >= 0 ? 'ch2-profit' : 'ch2-loss'}>
                            ¥{state.cfStatement.totalCF.toLocaleString()}
                        </span>
                    </div>
                </div>
            )}

            {/* スタッフ */}
            {state.staff.length > 0 && (
                <div className="ch2-staff-list">
                    <h3>スタッフ</h3>
                    {state.staff.map(s => (
                        <div key={s.id} className="ch2-staff-list__item">
                            <span>{s.name} ({s.type === 'part' ? 'パート' : '社員'})</span>
                            <span>¥{s.monthlyCost.toLocaleString()}/月</span>
                        </div>
                    ))}
                </div>
            )}

            {/* アクションボタン */}
            <div className="ch2-actions">
                {state.turn >= 10 && (
                    <button
                        onClick={() => useRetailStore.setState({ autoMode: !state.autoMode })}
                        style={{
                            width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--ch2-accent, #2563eb)',
                            background: state.autoMode ? 'var(--ch2-accent, #2563eb)' : 'transparent',
                            color: state.autoMode ? '#fff' : 'var(--ch2-accent, #2563eb)',
                            fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', marginBottom: 8,
                        }}
                    >
                        ⚡ オート {state.autoMode ? 'ON' : 'OFF'}
                    </button>
                )}
                <button
                    className="ch2-actions__go"
                    onClick={() => {
                        const card = getWeeklyFocusCards(2).find(c => c.id === selectedFocus);
                        confirmWeek({ _focus: card ? card.apply() : {} });
                        useRetailStore.setState({ _lastFocus: selectedFocus });
                        setSelectedFocus(null);
                    }}
                    disabled={isSimulating || !selectedFocus}
                >
                    {isSimulating ? '計算中…' : !selectedFocus ? '⚡ 判断を選んでください' : '次の週へ →'}
                </button>
            </div>

            {/* EXIT */}
            {state.exitAvailable && (
                <button
                    className="ch2-actions__exit"
                    onClick={() => useRetailStore.setState({ phase: 'ch2-exit' })}
                >
                    EXIT判断を考える
                </button>
            )}
        </div>
    );
}
