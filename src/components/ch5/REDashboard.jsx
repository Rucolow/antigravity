/**
 * Ch.5 ダッシュボード
 */
import React, { useState } from 'react';
import GoalBar from '../GoalBar';
import AdvisorBar from '../AdvisorBar';
import WeeklyFocusBar from '../WeeklyFocusBar';
import { CH5_GOAL } from '../../data/chapterGoals';
import { getWeeklyFocusCards } from '../../data/weeklyFocusCards';
import { useREStore } from '../../store/realEstateEngine';
import { getCh5Phase, getCh5Month, getCh5Year, NET_WORTH_TARGET } from '../../data/ch5Constants';
import KPITooltip from '../KPITooltip';
import BenchmarkBar from '../BenchmarkBar';

export default function REDashboard() {
    const s = useREStore();
    const [selectedFocus, setSelectedFocus] = useState(s._lastFocus || null);
    const state = s; // alias for WeeklyFocusBar

    const phase = getCh5Phase(s.turn);
    const month = getCh5Month(s.turn);
    const year = getCh5Year(s.turn);

    const dscrMin = s.properties.reduce((min, p) => Math.min(min, p.dscr || 99), 99);
    const dscrClass = dscrMin >= 1.3 ? 'safe' : dscrMin >= 1.0 ? 'warn' : 'danger';

    const canBuyMore = phase !== 'A' && s.money > 5_000_000;

    return (
        <>
            {/* ヘッダ */}
            <div className="ch5-header">
                <div className="ch5-header__chapter">Chapter 5 — 不動産投資 ／ Phase {phase}</div>
                <div className="ch5-header__title">Turn {s.turn}（{year}年目 {month}）</div>
            </div>

            {/* 純資産プログレス */}
            <div className="ch5-progress">
                <div className="ch5-progress__header">
                    <span className="ch5-progress__label">純資産 → ¥1億</span>
                    <span className="ch5-progress__pct">{s.netWorthProgress}%</span>
                </div>
                <div className="ch5-progress__bar">
                    <div className="ch5-progress__fill" style={{ width: `${s.netWorthProgress}%` }} />
                </div>
                <div className="ch5-progress__target">
                    ¥{(s.netWorth || 0).toLocaleString()} ／ ¥{NET_WORTH_TARGET.toLocaleString()}
                </div>
            </div>

            {/* チャプターゴール */}
            <GoalBar goal={CH5_GOAL} state={state} />
            <AdvisorBar chapter={5} state={state} />
            <WeeklyFocusBar cards={getWeeklyFocusCards(5)} selected={selectedFocus} onSelect={setSelectedFocus} />

            {/* KPI */}
            <div className="ch5-kpi-row ch5-kpi-row--quad">
                <div className="ch5-kpi">
                    <div className="ch5-kpi__label"><KPITooltip term="純資産">純資産</KPITooltip></div>
                    <div className="ch5-kpi__value">¥{Math.round((s.netWorth || 0) / 10000).toLocaleString()}万</div>
                </div>
                <div className="ch5-kpi">
                    <div className="ch5-kpi__label"><KPITooltip term="LTV比率">LTV</KPITooltip></div>
                    <div className={`ch5-kpi__value ${s.ltvRatio >= 80 ? 'ch5-kpi__value--red' : 'ch5-kpi__value--blue'}`}>
                        {s.ltvRatio}%
                    </div>
                </div>
                <div className="ch5-kpi">
                    <div className="ch5-kpi__label"><KPITooltip term="DSCR">DSCR</KPITooltip></div>
                    <div className={`ch5-kpi__value ${dscrClass === 'safe' ? 'ch5-kpi__value--green' : dscrClass === 'danger' ? 'ch5-kpi__value--red' : ''}`}>
                        {dscrMin === 99 ? '—' : dscrMin}
                    </div>
                </div>
                <div className="ch5-kpi">
                    <div className="ch5-kpi__label"><KPITooltip term="CF">月間CF</KPITooltip></div>
                    <div className={`ch5-kpi__value ${s.monthlyCashFlow >= 0 ? 'ch5-kpi__value--green' : 'ch5-kpi__value--red'}`}>
                        ¥{Math.round((s.monthlyCashFlow || 0) / 1000)}K
                    </div>
                </div>
            </div>

            {/* 業界ベンチマーク */}
            {s.turn >= 4 && (
                <div style={{ padding: '8px 16px' }}>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: '0.1em' }}>業界平均との比較</div>
                    <BenchmarkBar label="DSCR" value={dscrMin === 99 ? 0 : dscrMin} avg={1.3} max={3} unit="x" />
                    <BenchmarkBar label="LTV比率" value={s.ltvRatio} avg={70} max={100} unit="%" lowerIsBetter />
                    <BenchmarkBar label="月間CF" value={Math.round((s.monthlyCashFlow || 0) / 10000)} avg={10} max={50} unit="万" />
                </div>
            )}

            {/* P&L */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">月次損益</div>
                <div className="ch5-row">
                    <span className="ch5-row__label">家賃収入</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-green)' }}>¥{(s.monthlyRent || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">− 運営経費</span>
                    <span className="ch5-row__value">¥{(s.monthlyExpenses || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">− ローン返済</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-blue)' }}>¥{(s.monthlyLoanPayment || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">− 税金</span>
                    <span className="ch5-row__value">¥{(s.monthlyTax || 0).toLocaleString()}</span>
                </div>
                {s.taxSavings > 0 && (
                    <div className="ch5-row" style={{ fontSize: '0.62rem' }}>
                        <span className="ch5-row__label" style={{ color: 'var(--ch5-green)' }}>　（減価償却による節税）</span>
                        <span className="ch5-row__value" style={{ color: 'var(--ch5-green)' }}>-¥{Math.round(s.taxSavings / 12).toLocaleString()}</span>
                    </div>
                )}
                <div className="ch5-row" style={{ borderTop: '1px solid var(--ch5-card-border)', paddingTop: '0.2rem', fontWeight: 700 }}>
                    <span className="ch5-row__label">税引後CF</span>
                    <span className="ch5-row__value" style={{ color: s.monthlyCashFlow >= 0 ? 'var(--ch5-green)' : 'var(--ch5-red)' }}>
                        {s.monthlyCashFlow >= 0 ? '' : '-'}¥{Math.abs(s.monthlyCashFlow || 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* ポートフォリオ */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">ポートフォリオ（{s.properties.length}物件）</div>
                {s.properties.map(p => {
                    const dClass = p.dscr >= 1.3 ? 'safe' : p.dscr >= 1.0 ? 'warn' : 'danger';
                    return (
                        <div key={p.id} className="ch5-property-card">
                            <div className="ch5-property-card__header">
                                <span className="ch5-property-card__name">{p.name}</span>
                                <span className={`ch5-property-card__dscr ch5-property-card__dscr--${dClass}`}>
                                    DSCR {p.dscr}
                                </span>
                            </div>
                            <div className="ch5-occupancy-bar">
                                <div className="ch5-occupancy-bar__fill" style={{ width: `${(p.occupancyRate || 0) * 100}%` }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--ch5-text-sub)' }}>
                                <span>稼働 {p.occupiedUnits}/{p.totalUnits}室 ({Math.round((p.occupancyRate || 0) * 100)}%)</span>
                                <span>家賃 ¥{(p.monthlyRentPerUnit * p.occupiedUnits).toLocaleString()}/月</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--ch5-text-sub)', marginTop: '0.08rem' }}>
                                <span>時価 ¥{Math.round(p.currentValue / 10000).toLocaleString()}万</span>
                                <span>築{Math.floor(p.age)}年</span>
                                <span>償却残{Math.max(0, Math.floor(p.remainingUsefulLife))}年</span>
                            </div>
                            {p.subleaseActive && (
                                <div style={{ fontSize: '0.56rem', color: 'var(--ch5-blue)', marginTop: '0.06rem' }}>🏠 サブリース中（85%保証）</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 資金 */}
            <div className="ch5-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--ch5-text-sub)' }}>現金残高</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: s.money >= 0 ? 'var(--ch5-accent)' : 'var(--ch5-red)' }}>
                    ¥{(s.money || 0).toLocaleString()}
                </div>
            </div>

            {/* アクションバー */}
            <div className="ch5-action-bar">
                <button className="ch5-btn ch5-btn--secondary" onClick={s.viewBS}>B/S確認</button>
                {canBuyMore && (
                    <button className="ch5-btn ch5-btn--secondary" onClick={s.goToPropertyBuy}>物件購入</button>
                )}
            </div>

            {s.turn >= 10 && (
                <button
                    onClick={() => useREStore.setState({ autoMode: !s.autoMode })}
                    className="ch5-btn ch5-btn--secondary"
                    style={{
                        background: s.autoMode ? 'var(--ch5-accent)' : 'transparent',
                        color: s.autoMode ? '#fff' : 'var(--ch5-accent)',
                        border: '1px solid var(--ch5-accent)',
                        fontSize: '0.72rem', marginBottom: 8,
                    }}
                >
                    ⚡ オート {s.autoMode ? 'ON' : 'OFF'}
                </button>
            )}
            <button className="ch5-btn ch5-btn--primary" disabled={!selectedFocus} onClick={() => {
                const card = getWeeklyFocusCards(5).find(c => c.id === selectedFocus);
                useREStore.setState({ _weeklyFocus: card ? card.apply() : {}, _lastFocus: selectedFocus });
                s.confirmMonth();
                setSelectedFocus(null);
            }}>
                {!selectedFocus ? '⚡ 判断を選んでください' : '次の月へ →'}
            </button>
        </>
    );
}
