import React from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import { LOCATIONS, OPERATING_HOURS, getCh1Phase, CH1_PHASES, MARKETING } from '../../data/ch1Constants';

export default function CafeDashboard() {
    const state = useCafeStore(s => s);
    const confirmWeek = useCafeStore(s => s.confirmWeek);
    const loc = LOCATIONS[state.location];
    const hours = OPERATING_HOURS[state.operatingHours];
    const ch1Phase = getCh1Phase(state.turn);

    // 資金燃焼アラート
    const weeklyLoss = state.weeklyProfit < 0 ? Math.abs(state.weeklyProfit) : 0;
    const weeksLeft = weeklyLoss > 0 ? Math.floor(state.money / weeklyLoss) : null;

    const isSimulating = state.phase === 'ch1-simulating';

    return (
        <div className="ch1-dash">
            {/* ヘッダー */}
            <div className="ch1-dash__header">
                <div className="ch1-dash__cafe-name">{state.cafeName || 'My Cafe'}</div>
                <div className="ch1-dash__turn">
                    Week {state.turn} · {CH1_PHASES[ch1Phase]?.label}
                </div>
            </div>

            {/* KPI カード行 */}
            <div className="ch1-kpi-row">
                <div className="ch1-kpi">
                    <span className="ch1-kpi__label">現金</span>
                    <span className={`ch1-kpi__value ${state.money < 200000 ? 'ch1-kpi__value--danger' : ''}`}>
                        ¥{state.money.toLocaleString()}
                    </span>
                </div>
                <div className="ch1-kpi">
                    <span className="ch1-kpi__label">評判</span>
                    <span className="ch1-kpi__value">{'★'.repeat(Math.floor(state.reputation))}{'☆'.repeat(5 - Math.floor(state.reputation))}</span>
                    <span className="ch1-kpi__sub">{state.reputation.toFixed(1)}</span>
                </div>
                <div className="ch1-kpi">
                    <span className="ch1-kpi__label">稼働率</span>
                    <span className={`ch1-kpi__value ${state.capacityUtilization > 0.8 ? 'ch1-kpi__value--warn' : ''}`}>
                        {Math.round(state.capacityUtilization * 100)}%
                    </span>
                </div>
            </div>

            {/* 損益分岐点 */}
            <div className="ch1-breakeven">
                <div className="ch1-breakeven__label">損益分岐点</div>
                <div className="ch1-breakeven__bar">
                    <div className="ch1-breakeven__fill"
                        style={{ width: `${Math.min(100, state.breakEvenSales > 0 ? (state.weeklySales / state.breakEvenSales) * 100 : 0)}%` }}
                    />
                    <span className="ch1-breakeven__marker" />
                </div>
                <div className="ch1-breakeven__text">
                    {state.breakEvenSales > 0 ? (
                        state.weeklySales >= state.breakEvenSales
                            ? <span className="ch1-profit">黒字圏！ 売上¥{state.weeklySales.toLocaleString()} / 分岐点¥{state.breakEvenSales.toLocaleString()}</span>
                            : <span className="ch1-loss">あと¥{(state.breakEvenSales - state.weeklySales).toLocaleString()}で黒字</span>
                    ) : (
                        <span>—</span>
                    )}
                </div>
            </div>

            {/* 資金燃焼アラート */}
            {weeksLeft !== null && weeksLeft < 12 && (
                <div className="ch1-alert ch1-alert--danger">
                    🔴 資金燃焼アラート: 残り約{weeksLeft}週で資金が尽きる
                </div>
            )}

            {/* ワンオペ天井アラート */}
            {state.capacityUtilization > 0.8 && state.staff.length === 0 && (
                <div className="ch1-alert ch1-alert--warn">
                    ⚠️ 今週{state.customersTurnedAway}人のお客さんをお断りしました。ワンオペの天井が近い。
                </div>
            )}

            {/* P&L要約 */}
            {state.turn > 5 && (
                <div className="ch1-pl">
                    <h3>先週のP&L</h3>
                    <div className="ch1-pl__row">
                        <span>売上</span><span>¥{state.weeklySales.toLocaleString()}</span>
                    </div>
                    <div className="ch1-pl__row ch1-pl__row--sub">
                        <span>原価</span><span>−¥{(state.weekResult?.cogs || 0).toLocaleString()}</span>
                    </div>
                    <div className="ch1-pl__row">
                        <span>粗利</span><span>¥{(state.weekResult?.grossProfit || 0).toLocaleString()}</span>
                    </div>
                    <div className="ch1-pl__row ch1-pl__row--sub">
                        <span>固定費</span><span>−¥{(state.weekResult?.fixedCosts || 0).toLocaleString()}</span>
                    </div>
                    <div className={`ch1-pl__row ch1-pl__row--total ${state.weeklyProfit >= 0 ? 'ch1-profit' : 'ch1-loss'}`}>
                        <span>純利益</span><span>{state.weeklyProfit >= 0 ? '+' : ''}¥{state.weeklyProfit.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* メニュー一覧 */}
            <div className="ch1-menu-list">
                <h3>メニュー</h3>
                {state.menu.map(item => (
                    <div key={item.id} className="ch1-menu-list__item">
                        <span>{item.name}</span>
                        <span>¥{item.price} (原価¥{item.cost})</span>
                    </div>
                ))}
            </div>

            {/* スタッフ */}
            {state.staff.length > 0 && (
                <div className="ch1-staff-list">
                    <h3>スタッフ</h3>
                    {state.staff.map(s => (
                        <div key={s.id} className="ch1-staff-list__item">
                            <span>{s.name} ({s.type === 'part' ? 'パート' : '社員'})</span>
                            <span>¥{s.monthlyCost.toLocaleString()}/月</span>
                        </div>
                    ))}
                </div>
            )}

            {/* アクションボタン */}
            <div className="ch1-actions">
                <button
                    className="ch1-actions__go"
                    onClick={() => confirmWeek({})}
                    disabled={isSimulating}
                >
                    {isSimulating ? '計算中…' : '次の週へ →'}
                </button>
            </div>

            {/* EXIT可能 */}
            {state.exitAvailable && (
                <button
                    className="ch1-actions__exit"
                    onClick={() => useCafeStore.setState({ phase: 'ch1-exit' })}
                >
                    EXIT判断を考える
                </button>
            )}
        </div>
    );
}
