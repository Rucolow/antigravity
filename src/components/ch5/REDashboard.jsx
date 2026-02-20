/**
 * Ch.5 ダッシュボード
 */
import React from 'react';
import { useREStore } from '../../store/realEstateEngine';
import { getCh5Phase, getCh5Month, getCh5Year, NET_WORTH_TARGET } from '../../data/ch5Constants';

export default function REDashboard() {
    const s = useREStore();

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

            {/* KPI */}
            <div className="ch5-kpi-row ch5-kpi-row--quad">
                <div className="ch5-kpi">
                    <div className="ch5-kpi__label">純資産</div>
                    <div className="ch5-kpi__value">¥{Math.round((s.netWorth || 0) / 10000).toLocaleString()}万</div>
                </div>
                <div className="ch5-kpi">
                    <div className="ch5-kpi__label">LTV</div>
                    <div className={`ch5-kpi__value ${s.ltvRatio >= 80 ? 'ch5-kpi__value--red' : 'ch5-kpi__value--blue'}`}>
                        {s.ltvRatio}%
                    </div>
                </div>
                <div className="ch5-kpi">
                    <div className="ch5-kpi__label">DSCR</div>
                    <div className={`ch5-kpi__value ${dscrClass === 'safe' ? 'ch5-kpi__value--green' : dscrClass === 'danger' ? 'ch5-kpi__value--red' : ''}`}>
                        {dscrMin === 99 ? '—' : dscrMin}
                    </div>
                </div>
                <div className="ch5-kpi">
                    <div className="ch5-kpi__label">月間CF</div>
                    <div className={`ch5-kpi__value ${s.monthlyCashFlow >= 0 ? 'ch5-kpi__value--green' : 'ch5-kpi__value--red'}`}>
                        ¥{Math.round((s.monthlyCashFlow || 0) / 1000)}K
                    </div>
                </div>
            </div>

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

            <button className="ch5-btn ch5-btn--primary" onClick={s.confirmMonth}>
                次の月へ →
            </button>
        </>
    );
}
