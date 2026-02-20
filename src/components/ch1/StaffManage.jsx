import React from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import { STAFF_COSTS } from '../../data/ch1Constants';

export default function StaffManage() {
    const staff = useCafeStore(s => s.staff);
    const money = useCafeStore(s => s.money);
    const hireStaff = useCafeStore(s => s.hireStaff);
    const fireStaff = useCafeStore(s => s.fireStaff);
    const setPhase = useCafeStore(s => s.setPhase);

    const totalLaborCost = staff.reduce((sum, s) => sum + s.monthlyCost, 0);
    const weeklyLabor = Math.floor(totalLaborCost / 4);

    const handleHire = (type) => {
        const cost = STAFF_COSTS[type];
        hireStaff({ type, monthlyCost: cost.monthly });
    };

    return (
        <div className="ch1-setup">
            <div className="ch1-setup__header">
                <span className="ch1-setup__step">スタッフ管理</span>
                <h2>👥 雇用・人件費</h2>
                <p className="ch1-setup__subtitle">
                    人件費合計: ¥{totalLaborCost.toLocaleString()}/月（¥{weeklyLabor.toLocaleString()}/週）
                </p>
            </div>

            {/* 現在のスタッフ */}
            {staff.length > 0 && (
                <div className="ch1-pl" style={{ marginBottom: 16 }}>
                    <h3>在籍スタッフ</h3>
                    {staff.map((s, i) => (
                        <div key={s.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#3e2b1a' }}>
                                    {s.name} （{s.type === 'part' ? 'パート' : '社員'}）
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#8b7355' }}>
                                    ¥{s.monthlyCost.toLocaleString()}/月 ・ スキル {(s.skill * 100).toFixed(0)}%
                                </div>
                            </div>
                            <button
                                style={{
                                    padding: '4px 10px', borderRadius: 6, border: '1px solid #ef9a9a',
                                    background: '#fff', color: '#d32f2f', fontSize: '0.7rem', cursor: 'pointer'
                                }}
                                onClick={() => fireStaff(s.id)}
                            >
                                解雇
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 新規雇用 */}
            <h3 className="ch1-section-title">新規雇用</h3>
            <div className="ch1-setup__cards">
                {/* パート */}
                <div
                    className="ch1-card"
                    onClick={() => handleHire('part')}
                    style={{ cursor: money >= 0 ? 'pointer' : 'not-allowed', opacity: money >= 0 ? 1 : 0.5 }}
                >
                    <div className="ch1-card__title">👤 パート（週4日・6時間）</div>
                    <div className="ch1-card__stats">
                        <div className="ch1-card__stat">
                            <span>月額</span>
                            <strong>¥{STAFF_COSTS.part.monthly.toLocaleString()}</strong>
                        </div>
                        <div className="ch1-card__stat">
                            <span>週額</span>
                            <strong>¥{Math.floor(STAFF_COSTS.part.monthly / 4).toLocaleString()}</strong>
                        </div>
                    </div>
                    <div className="ch1-card__desc">
                        提供上限+100%。ただし損益分岐点も上がる。
                    </div>
                </div>

                {/* 社員 */}
                <div
                    className="ch1-card"
                    onClick={() => handleHire('full')}
                    style={{ cursor: money >= 0 ? 'pointer' : 'not-allowed', opacity: money >= 0 ? 1 : 0.5 }}
                >
                    <div className="ch1-card__title">👤 正社員（社保込み）</div>
                    <div className="ch1-card__stats">
                        <div className="ch1-card__stat">
                            <span>月額</span>
                            <strong>¥{STAFF_COSTS.full.monthly.toLocaleString()}</strong>
                        </div>
                        <div className="ch1-card__stat">
                            <span>週額</span>
                            <strong>¥{Math.floor(STAFF_COSTS.full.monthly / 4).toLocaleString()}</strong>
                        </div>
                    </div>
                    <div className="ch1-card__desc">
                        提供上限+150%。高品質サービス。ただし人件費も高い。
                    </div>
                </div>
            </div>

            <button
                className="ch1-actions__back"
                onClick={() => setPhase('ch1-dashboard')}
            >
                ← ダッシュボードに戻る
            </button>
        </div>
    );
}
