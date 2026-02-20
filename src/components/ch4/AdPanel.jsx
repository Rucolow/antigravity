/**
 * 広告設定パネル
 */
import React, { useState } from 'react';
import { useECStore } from '../../store/ecEngine';
import { AD_PLATFORMS, CREATIVE_FRESHNESS, CH4_STAFF } from '../../data/ch4Constants';

export default function AdPanel() {
    const state = useECStore();
    const [budgets, setBudgets] = useState({ ...state.adBudgets });

    const updateBudget = (key, val) => {
        setBudgets(prev => ({ ...prev, [key]: val }));
    };

    const totalBudget = Object.values(budgets).reduce((s, v) => s + (v || 0), 0);
    const freshPct = Math.round((state.creativeFreshness || 0) * 100);

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">広告設定</div>
            </div>

            <div className="ch4-card">
                <div className="ch4-card__title">広告予算（週間）</div>
                {Object.entries(AD_PLATFORMS).map(([key, p]) => (
                    <div key={key} className="ch4-slider">
                        <div className="ch4-slider__header">
                            <span className="ch4-slider__label">{p.name.split('（')[0]}</span>
                            <span className="ch4-slider__value">¥{(budgets[key] || 0).toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={300000}
                            step={10000}
                            value={budgets[key] || 0}
                            onChange={e => updateBudget(key, Number(e.target.value))}
                        />
                    </div>
                ))}
                <div className="ch4-row ch4-row--total" style={{ marginTop: '0.5rem' }}>
                    <span className="ch4-row__label">合計</span>
                    <span className="ch4-row__value">¥{totalBudget.toLocaleString()}/週</span>
                </div>
            </div>

            {/* クリエイティブ鮮度 */}
            <div className="ch4-card">
                <div className="ch4-card__title">クリエイティブ鮮度</div>
                <div className="ch4-gauge">
                    <div className="ch4-gauge__header">
                        <span>現在の鮮度</span>
                        <span>{freshPct}%</span>
                    </div>
                    <div className="ch4-gauge__track">
                        <div
                            className={`ch4-gauge__fill ${freshPct < 30 ? 'ch4-gauge__fill--low' : ''}`}
                            style={{ width: `${freshPct}%` }}
                        />
                    </div>
                </div>
                <p style={{ fontSize: '0.65rem', color: 'var(--ch4-text-sub)', marginTop: '0.3rem' }}>
                    鮮度が0%になるとCPA+50%。毎ターン25%劣化。更新で100%回復。
                </p>
                <button
                    className="ch4-btn ch4-btn--secondary"
                    onClick={state.refreshCreative}
                    disabled={state.money < CREATIVE_FRESHNESS.refreshCost}
                    style={{ marginTop: '0.3rem' }}
                >
                    🎨 新しい素材を作る（¥{CREATIVE_FRESHNESS.refreshCost.toLocaleString()}）
                </button>
            </div>

            {/* スタッフ */}
            <div className="ch4-card">
                <div className="ch4-card__title">スタッフ</div>
                {Object.entries(CH4_STAFF).map(([key, s]) => {
                    const hired = state.staff.some(st => st.skill === key);
                    return (
                        <div key={key} className="ch4-toggle-row">
                            <div className="ch4-toggle-row__info">
                                <div className="ch4-toggle-row__name">
                                    {s.name} {hired && <span className="ch4-badge ch4-badge--success">雇用中</span>}
                                </div>
                                <div className="ch4-toggle-row__desc">
                                    月¥{s.monthly.toLocaleString()} ｜ {s.desc}
                                </div>
                            </div>
                            {!hired ? (
                                <button className="ch4-btn ch4-btn--ghost" style={{ width: 'auto', marginBottom: 0, padding: '0.3rem 0.6rem', fontSize: '0.68rem' }}
                                    onClick={() => state.hireStaff(key)}>
                                    雇用
                                </button>
                            ) : (
                                <button className="ch4-btn ch4-btn--ghost" style={{ width: 'auto', marginBottom: 0, padding: '0.3rem 0.6rem', fontSize: '0.68rem', color: 'var(--ch4-red)' }}
                                    onClick={() => {
                                        const found = state.staff.find(st => st.skill === key);
                                        if (found) state.fireStaff(found.id);
                                    }}>
                                    解雇
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <button className="ch4-btn ch4-btn--primary" onClick={() => state.updateAdBudgets(budgets)}>
                設定を保存してダッシュボードへ
            </button>

            <button className="ch4-btn ch4-btn--ghost" onClick={state.backToDashboard}>
                キャンセル
            </button>
        </>
    );
}
