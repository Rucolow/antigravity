/**
 * B/S（貸借対照表）表示
 */
import React from 'react';
import { useREStore } from '../../store/realEstateEngine';

export default function BSDisplay() {
    const s = useREStore();
    const backToDashboard = useREStore(st => st.backToDashboard);

    const totalPropertyValue = s.properties.reduce((sum, p) => sum + p.currentValue, 0);
    const totalLoanBalance = s.loans.reduce((sum, l) => sum + l.balance, 0);
    const totalAssets = totalPropertyValue + s.money;
    const netWorth = totalAssets - totalLoanBalance;

    return (
        <>
            <div className="ch5-header">
                <div className="ch5-header__chapter">Chapter 5 — 不動産投資</div>
                <div className="ch5-header__title">貸借対照表（B/S）</div>
            </div>

            {/* B/S テーブル */}
            <div className="ch5-card">
                <div className="ch5-bs">
                    {/* 左: 資産の部 */}
                    <div className="ch5-bs__side ch5-bs__side--left">
                        <div className="ch5-bs__title">【資産の部】</div>
                        <div className="ch5-bs__item">
                            <span>現金</span>
                            <span>¥{(s.money || 0).toLocaleString()}</span>
                        </div>
                        {s.properties.map(p => (
                            <div key={p.id} className="ch5-bs__item">
                                <span style={{ fontSize: '0.58rem' }}>{p.name.substring(0, 8)}</span>
                                <span>¥{p.currentValue.toLocaleString()}</span>
                            </div>
                        ))}
                        {s.properties.some(p => p.accDepreciation > 0) && (
                            <div className="ch5-bs__item" style={{ color: 'var(--ch5-text-sub)', fontSize: '0.56rem' }}>
                                <span>（減価償却累計）</span>
                                <span>△¥{s.properties.reduce((sum, p) => sum + p.accDepreciation, 0).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="ch5-bs__total">
                            <span>資産合計</span>
                            <span style={{ color: 'var(--ch5-accent)' }}>¥{totalAssets.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* 右: 負債＋純資産の部 */}
                    <div className="ch5-bs__side">
                        <div className="ch5-bs__title">【負債の部】</div>
                        {s.loans.map(l => (
                            <div key={l.id} className="ch5-bs__item">
                                <span style={{ fontSize: '0.58rem' }}>借入金</span>
                                <span>¥{l.balance.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="ch5-bs__item" style={{ marginTop: '0.15rem', borderTop: '1px solid var(--ch5-card-border)', paddingTop: '0.12rem' }}>
                            <span>負債合計</span>
                            <span style={{ color: 'var(--ch5-blue)' }}>¥{totalLoanBalance.toLocaleString()}</span>
                        </div>

                        <div className="ch5-bs__title" style={{ marginTop: '0.3rem' }}>【純資産の部】</div>
                        <div className="ch5-bs__item">
                            <span>純資産</span>
                            <span style={{ color: netWorth >= 0 ? 'var(--ch5-green)' : 'var(--ch5-red)', fontWeight: 700 }}>
                                ¥{netWorth.toLocaleString()}
                            </span>
                        </div>

                        <div className="ch5-bs__total">
                            <span>負債+純資産</span>
                            <span style={{ color: 'var(--ch5-accent)' }}>¥{totalAssets.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* レバレッジ分析 */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">レバレッジ分析</div>
                <div className="ch5-row">
                    <span className="ch5-row__label">LTV比率（負債÷資産）</span>
                    <span className="ch5-row__value" style={{ color: s.ltvRatio >= 80 ? 'var(--ch5-red)' : 'var(--ch5-blue)' }}>
                        {s.ltvRatio}%
                    </span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">レバレッジ倍率</span>
                    <span className="ch5-row__value">
                        {netWorth > 0 ? (totalAssets / netWorth).toFixed(1) : '—'}倍
                    </span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">年間減価償却費</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-green)' }}>
                        ¥{(s.totalAnnualDepreciation || 0).toLocaleString()}
                    </span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">節税効果 /年</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-green)' }}>
                        ¥{(s.taxSavings || 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* ゲームクリア進捗 */}
            <div className="ch5-card">
                <div className="ch5-progress">
                    <div className="ch5-progress__header">
                        <span className="ch5-progress__label">純資産 → ¥1億</span>
                        <span className="ch5-progress__pct">{s.netWorthProgress}%</span>
                    </div>
                    <div className="ch5-progress__bar">
                        <div className="ch5-progress__fill" style={{ width: `${s.netWorthProgress}%` }} />
                    </div>
                </div>
            </div>

            <button className="ch5-btn ch5-btn--primary" onClick={backToDashboard}>
                ← ダッシュボードに戻る
            </button>
        </>
    );
}
