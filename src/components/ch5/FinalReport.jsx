/**
 * 最終レポート（全ゲーム総括）
 */
import React from 'react';
import { useREStore } from '../../store/realEstateEngine';
import { gradeCh5 } from '../../data/chapterGrade';
import GradeDisplay from '../GradeDisplay';

export default function FinalReport() {
    const s = useREStore();

    const allSkills = [...new Set([...(s.allPreviousSkills || []), ...(s.skills || [])])];
    const isBankrupt = s.exitType === 'bankruptcy';
    const ph = s.history || [];
    const avgCashFlow = ph.length > 0 ? Math.round(ph.reduce((sum, p) => sum + (p.monthlyCashFlow || 0), 0) / ph.length) : 0;
    const avgDSCR = ph.length > 0 ? parseFloat((ph.reduce((sum, p) => sum + (p.dscr || 1), 0) / ph.length).toFixed(2)) : 1;

    return (
        <>
            <div className="ch5-header">
                <div className="ch5-header__chapter">ANTIGRAVITY</div>
                <div className="ch5-header__title">{isBankrupt ? 'GAME OVER' : 'FINAL REPORT'}</div>
            </div>

            {isBankrupt && (
                <div className="ch5-card" style={{ borderColor: 'var(--ch5-red)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--ch5-red)', fontWeight: 700 }}>
                        資金不足により経営継続が不可能になりました。
                    </div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--ch5-text-sub)', marginTop: '0.15rem' }}>
                        レバレッジは使い方を誤ると——倒産のアクセルになる。
                    </div>
                </div>
            )}

            <GradeDisplay result={gradeCh5({
                netWorth: s.netWorth || 0,
                avgCashFlow,
                avgDSCR,
                skillCount: (s.skills || []).length,
                gameClear: s.gameClear,
            })} chapter={5} />

            {/* 純資産推移 */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">最終純資産</div>
                <div className="ch5-clear-value" style={{ padding: '0.5rem' }}>
                    <div className="ch5-clear-value__amount" style={{ fontSize: '1.5rem' }}>
                        ¥{(s.netWorth || 0).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* 不動産実績 */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">不動産投資実績</div>
                <div className="ch5-row">
                    <span className="ch5-row__label">運営期間</span>
                    <span className="ch5-row__value">{s.turn}ヶ月</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">保有物件</span>
                    <span className="ch5-row__value">{s.properties.length}物件</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">融資回数</span>
                    <span className="ch5-row__value">{s.loanCount}回</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">売却回数</span>
                    <span className="ch5-row__value">{s.soldPropertyCount || 0}回</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">最終LTV</span>
                    <span className="ch5-row__value">{s.ltvRatio}%</span>
                </div>
            </div>

            {/* ファイナンス */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">ファイナンスサマリー</div>
                <div className="ch5-row">
                    <span className="ch5-row__label">総家賃収入</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-green)' }}>
                        ¥{(s.totalRentIncome || 0).toLocaleString()}
                    </span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">総経費</span>
                    <span className="ch5-row__value">¥{(s.totalExpensesPaid || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">総ローン返済</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-blue)' }}>
                        ¥{(s.totalLoanPaid || 0).toLocaleString()}
                    </span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">総税額</span>
                    <span className="ch5-row__value">¥{(s.totalTaxPaid || 0).toLocaleString()}</span>
                </div>
                <div className="ch5-row" style={{ borderTop: '1px solid var(--ch5-card-border)', fontWeight: 700 }}>
                    <span className="ch5-row__label">累計利益</span>
                    <span className="ch5-row__value" style={{ color: (s.totalProfit || 0) >= 0 ? 'var(--ch5-green)' : 'var(--ch5-red)' }}>
                        ¥{(s.totalProfit || 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* B/S最終 */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">最終B/S</div>
                <div className="ch5-bs">
                    <div className="ch5-bs__side ch5-bs__side--left">
                        <div className="ch5-bs__title">資産</div>
                        <div className="ch5-bs__item">
                            <span>現金</span>
                            <span>¥{(s.money || 0).toLocaleString()}</span>
                        </div>
                        {s.properties.map(p => (
                            <div key={p.id} className="ch5-bs__item">
                                <span style={{ fontSize: '0.56rem' }}>{p.name.substring(0, 8)}</span>
                                <span>¥{p.currentValue.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="ch5-bs__total">
                            <span>合計</span>
                            <span>¥{(s.totalAssets || 0).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="ch5-bs__side">
                        <div className="ch5-bs__title">負債+純資産</div>
                        {s.loans.map(l => (
                            <div key={l.id} className="ch5-bs__item">
                                <span>借入金</span>
                                <span>¥{l.balance.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="ch5-bs__item" style={{ fontWeight: 700, color: 'var(--ch5-green)' }}>
                            <span>純資産</span>
                            <span>¥{(s.netWorth || 0).toLocaleString()}</span>
                        </div>
                        <div className="ch5-bs__total">
                            <span>合計</span>
                            <span>¥{(s.totalAssets || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 獲得スキル */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">全Chapter獲得スキル</div>
                <div className="ch5-skill-grid">
                    {allSkills.map(sk => (
                        <span key={sk} className="ch5-skill-badge">{sk}</span>
                    ))}
                </div>
            </div>

            {/* 〆 */}
            <div className="ch5-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ch5-accent)', marginBottom: '0.15rem' }}>
                    {isBankrupt ? '挑戦は終わらない——' : '¥0 → ¥100,000,000'}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--ch5-text-sub)' }}>
                    {isBankrupt
                        ? 'レバレッジの怖さを知ることも学びの一つ。'
                        : 'カフェから始まった旅。すべての数字に、物語がある。'}
                </div>
                <div style={{ fontSize: '0.82rem', marginTop: '0.3rem', fontWeight: 800, color: 'var(--ch5-accent)' }}>
                    ANTIGRAVITY — 完
                </div>
            </div>
        </>
    );
}
