import React, { useState } from 'react';
import { useRetailStore } from '../../store/retailEngine';
import Ch3Bridge from './Ch3Bridge';

const SKILL_LABELS = {
    inventory_thinking: '📦 在庫思考',
    cf_analysis: '💰 CF分析力',
    ec_management: '🌐 EC管理',
    retail_staffing: '👥 小売人材管理',
    retail_tax: '🧾 小売税務',
    retail_experience: '🏪 小売店経験',
};

const EXIT_LABELS = {
    mna: 'M&A（事業売却）',
    ipo: 'IPO（上場）',
    succession: '事業承継',
    liquidation: '清算',
};

export default function Ch2Report() {
    const state = useRetailStore(s => s);
    const [showBridge, setShowBridge] = useState(false);

    if (showBridge) return <Ch3Bridge />;

    const avgSales = state.profitHistory.length > 0
        ? Math.floor(state.profitHistory.reduce((s, p) => s + p.sales, 0) / state.profitHistory.length)
        : 0;
    const avgProfit = state.profitHistory.length > 0
        ? Math.floor(state.profitHistory.reduce((s, p) => s + p.profit, 0) / state.profitHistory.length)
        : 0;

    return (
        <div className="ch2-report">
            <h2>📋 Chapter 2 レポート</h2>

            {/* EXIT結果 */}
            <div className="ch2-report__section">
                <h3>EXIT結果</h3>
                <div className="ch2-report__row">
                    <span>EXIT方法</span><span>{EXIT_LABELS[state.exitType] || '---'}</span>
                </div>
                <div className="ch2-report__row ch2-report__row--highlight">
                    <span>EXIT金額</span><span>¥{(state.exitAmount || 0).toLocaleString()}</span>
                </div>
                <div className="ch2-report__row">
                    <span>最終現金</span><span>¥{state.money.toLocaleString()}</span>
                </div>
            </div>

            {/* 経営サマリ */}
            <div className="ch2-report__section">
                <h3>経営サマリ</h3>
                <div className="ch2-report__row">
                    <span>営業週数</span><span>{state.profitHistory.length}週</span>
                </div>
                <div className="ch2-report__row">
                    <span>累計売上</span><span>¥{state.totalSales.toLocaleString()}</span>
                </div>
                <div className="ch2-report__row">
                    <span>累計利益</span><span>¥{state.totalProfit.toLocaleString()}</span>
                </div>
                <div className="ch2-report__row">
                    <span>平均週売上</span><span>¥{avgSales.toLocaleString()}</span>
                </div>
                <div className="ch2-report__row">
                    <span>平均週利益</span><span>¥{avgProfit.toLocaleString()}</span>
                </div>
                <div className="ch2-report__row">
                    <span>最終評判</span><span>{'★'.repeat(Math.floor(state.reputation))} {state.reputation.toFixed(1)}</span>
                </div>
            </div>

            {/* 習得スキル */}
            <div className="ch2-report__section">
                <h3>習得スキル</h3>
                <div className="ch2-report__skills">
                    {(state.ch2Skills || []).map(skill => (
                        <span key={skill} className="ch2-skill-badge">
                            {SKILL_LABELS[skill] || skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* 判断履歴 */}
            <div className="ch2-report__section">
                <h3>判断記録</h3>
                {state.decisions.slice(-10).map((d, i) => (
                    <div key={i} className="ch2-report__row" style={{ fontSize: '0.68rem' }}>
                        <span>Week {d.turn}</span><span>{d.label}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setShowBridge(true)}
                style={{
                    marginTop: 20, width: '100%', padding: '14px', borderRadius: '10px',
                    border: 'none', background: 'linear-gradient(135deg, #2563eb, #4a9eff)',
                    color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                }}
            >
                🏨 Chapter 3 へ進む →
            </button>
        </div>
    );
}
