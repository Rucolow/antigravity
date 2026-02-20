/**
 * ECダッシュボード — メインゲームプレイ画面
 */
import React from 'react';
import { useECStore } from '../../store/ecEngine';
import {
    PRODUCT_CATEGORIES, BRAND_CONCEPTS, AD_PLATFORMS, CRM_TOOLS,
    CREATIVE_FRESHNESS, getCh4Phase, CH4_PHASES, getCh4Month,
} from '../../data/ch4Constants';

export default function ECDashboard() {
    const state = useECStore();
    const phase = getCh4Phase(state.turn);
    const phaseLabel = CH4_PHASES[phase]?.label || '';
    const monthInfo = getCh4Month(state.turn);

    const freshPct = Math.round((state.creativeFreshness || 0) * 100);
    const ltvCacClass = (state.ltvCacRatio || 0) >= 3.0 ? '--green'
        : (state.ltvCacRatio || 0) >= 1.5 ? '--accent' : '--red';

    const noResult = state.turn <= 1 && state.weeklyOrders === 0;

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">Week {state.turn} ｜ {monthInfo?.label || ''}</div>
                <div className="ch4-header__phase">{phaseLabel}</div>
            </div>

            {/* ── KPI ── */}
            <div className="ch4-kpi-row ch4-kpi-row--quad">
                <div className="ch4-kpi">
                    <div className="ch4-kpi__label">CAC</div>
                    <div className={`ch4-kpi__value${(state.cac || 0) > 7000 ? ' ch4-kpi__value--red' : ''}`}>
                        {noResult ? '—' : `¥${(state.cac || 0).toLocaleString()}`}
                    </div>
                </div>
                <div className="ch4-kpi">
                    <div className="ch4-kpi__label">LTV</div>
                    <div className="ch4-kpi__value">
                        {noResult ? '—' : `¥${(state.ltv || 0).toLocaleString()}`}
                    </div>
                </div>
                <div className="ch4-kpi">
                    <div className="ch4-kpi__label">LTV/CAC</div>
                    <div className={`ch4-kpi__value ch4-kpi__value${ltvCacClass}`}>
                        {noResult ? '—' : `${state.ltvCacRatio || 0}x`}
                    </div>
                </div>
                <div className="ch4-kpi">
                    <div className="ch4-kpi__label">ROAS</div>
                    <div className={`ch4-kpi__value${(state.roas || 0) < 2.0 ? ' ch4-kpi__value--red' : ''}`}>
                        {noResult ? '—' : `${state.roas || 0}x`}
                    </div>
                </div>
            </div>

            {/* ── 資金 + 売上 ── */}
            <div className="ch4-kpi-row">
                <div className="ch4-kpi">
                    <div className="ch4-kpi__label">資金</div>
                    <div className="ch4-kpi__value" style={{ fontSize: '0.95rem' }}>
                        ¥{(state.money || 0).toLocaleString()}
                    </div>
                </div>
                <div className="ch4-kpi">
                    <div className="ch4-kpi__label">週間売上</div>
                    <div className="ch4-kpi__value" style={{ fontSize: '0.95rem' }}>
                        {noResult ? '—' : `¥${(state.weeklySales || 0).toLocaleString()}`}
                    </div>
                </div>
            </div>

            {/* ── 広告パフォーマンス ── */}
            {!noResult && Object.keys(state.adResults || {}).length > 0 && (
                <div className="ch4-card">
                    <div className="ch4-card__title">広告パフォーマンス</div>
                    <table className="ch4-ad-table">
                        <thead>
                            <tr>
                                <th>媒体</th>
                                <th>予算</th>
                                <th>新規</th>
                                <th>CPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(state.adResults).map(([key, r]) => (
                                <tr key={key}>
                                    <td>{AD_PLATFORMS[key]?.name?.split('（')[0] || key}</td>
                                    <td>¥{r.budget.toLocaleString()}</td>
                                    <td>{r.newCustomers}人</td>
                                    <td style={{ color: r.cpa > 7000 ? 'var(--ch4-red)' : 'var(--ch4-text)' }}>
                                        ¥{r.cpa.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* クリエイティブ鮮度 */}
                    <div className="ch4-gauge" style={{ marginTop: '0.5rem' }}>
                        <div className="ch4-gauge__header">
                            <span>クリエイティブ鮮度</span>
                            <span>{freshPct}%</span>
                        </div>
                        <div className="ch4-gauge__track">
                            <div
                                className={`ch4-gauge__fill ${freshPct < 30 ? 'ch4-gauge__fill--low' : ''}`}
                                style={{ width: `${freshPct}%` }}
                            />
                        </div>
                        {freshPct < 30 && (
                            <div style={{ fontSize: '0.6rem', color: 'var(--ch4-orange)', marginTop: '0.2rem' }}>
                                ⚠ クリエイティブが疲弊しています。新しい素材を作りましょう。
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── P&L ── */}
            {!noResult && (
                <div className="ch4-card">
                    <div className="ch4-card__title">P&L（週次）</div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">売上</span>
                        <span className="ch4-row__value">¥{(state.weeklySales || 0).toLocaleString()}</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">　原価</span>
                        <span className="ch4-row__value">-¥{(state.weeklyCogs || 0).toLocaleString()}</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">　チャネル手数料</span>
                        <span className="ch4-row__value">-¥{(state.weeklyCommission || 0).toLocaleString()}</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">　変動費（配送等）</span>
                        <span className="ch4-row__value">-¥{(state.weeklyVariableCosts || 0).toLocaleString()}</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">　固定費</span>
                        <span className="ch4-row__value">-¥{(state.weeklyFixedCosts || 0).toLocaleString()}</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">　広告費</span>
                        <span className="ch4-row__value" style={{ color: 'var(--ch4-orange)' }}>
                            -¥{(state.weeklyAdSpend || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className={`ch4-row ch4-row--total ${(state.weeklyProfit || 0) >= 0 ? 'ch4-row--profit' : 'ch4-row--loss'}`}>
                        <span className="ch4-row__label">純利益</span>
                        <span className="ch4-row__value">
                            {(state.weeklyProfit || 0) >= 0 ? '' : '-'}¥{Math.abs(state.weeklyProfit || 0).toLocaleString()}
                        </span>
                    </div>
                </div>
            )}

            {/* ── 顧客情報 ── */}
            {!noResult && (
                <div className="ch4-card">
                    <div className="ch4-card__title">顧客</div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">累計顧客数</span>
                        <span className="ch4-row__value">{(state.totalCustomers || 0).toLocaleString()}人</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">今週の注文</span>
                        <span className="ch4-row__value">{state.weeklyOrders || 0}件</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">リピート率</span>
                        <span className="ch4-row__value">{Math.round((state.repeatRate || 0) * 100)}%</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">オーガニック比率</span>
                        <span className="ch4-row__value" style={{
                            color: (state.organicRatio || 0) >= 0.5 ? 'var(--ch4-green)' : 'var(--ch4-text)'
                        }}>
                            {Math.round((state.organicRatio || 0) * 100)}%
                        </span>
                    </div>
                    {state.subscriberCount > 0 && (
                        <div className="ch4-row">
                            <span className="ch4-row__label">サブスク会員</span>
                            <span className="ch4-row__value">{state.subscriberCount}人</span>
                        </div>
                    )}
                    <div className="ch4-row">
                        <span className="ch4-row__label">ブランド評判</span>
                        <span className="ch4-row__value">
                            {'★'.repeat(Math.floor(state.reputation || 3.5))} {(state.reputation || 3.5).toFixed(1)}
                        </span>
                    </div>
                </div>
            )}

            {/* ── イベント結果 ── */}
            {state.eventResult && (
                <div className="ch4-event__result">{state.eventResult}</div>
            )}

            {/* ── アクションボタン ── */}
            <button className="ch4-btn ch4-btn--primary" onClick={state.confirmWeek}>
                今週を確定する →
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="ch4-btn ch4-btn--secondary" style={{ flex: 1 }} onClick={state.openAdPanel}>
                    広告設定
                </button>
                <button className="ch4-btn ch4-btn--secondary" style={{ flex: 1 }} onClick={state.openCRMPanel}>
                    CRM施策
                </button>
            </div>

            {state.creativeFreshness < 0.30 && (
                <button
                    className="ch4-btn ch4-btn--ghost"
                    onClick={state.refreshCreative}
                >
                    🎨 新しいクリエイティブを作る（¥{CREATIVE_FRESHNESS.refreshCost.toLocaleString()}）
                </button>
            )}

            {state.exitAvailable && (
                <button
                    className="ch4-btn ch4-btn--gold"
                    onClick={() => useECStore.setState({ phase: 'ch4-exit' })}
                >
                    EXIT判断へ
                </button>
            )}

            {/* ── ステータスバー ── */}
            <div style={{ fontSize: '0.58rem', color: 'var(--ch4-text-sub)', textAlign: 'center', marginTop: '0.5rem' }}>
                {state.isIncorporated && '🏢 法人 '}
                {state.consumptionTaxEnabled && '📋 課税事業者 '}
                {state.staff.length > 0 && `👥 スタッフ${state.staff.length}人 `}
            </div>
        </>
    );
}
