import React, { useState } from 'react';
import GoalBar from '../GoalBar';
import AdvisorBar from '../AdvisorBar';
import WeeklyFocusBar from '../WeeklyFocusBar';
import { CH3_GOAL } from '../../data/chapterGoals';
import { getWeeklyFocusCards } from '../../data/weeklyFocusCards';
import { useHotelStore } from '../../store/hotelEngine';
import KPITooltip from '../KPITooltip';
import BenchmarkBar from '../BenchmarkBar';
import { PROPERTIES, CH3_PHASES, getCh3Phase, getCh3Month, CH3_STAFF, OTA_LEVELS, SOLO_ROOM_LIMIT } from '../../data/ch3Constants';

export default function HotelDashboard() {
    const state = useHotelStore(s => s);
    const confirmWeek = useHotelStore(s => s.confirmWeek);
    const [selectedFocus, setSelectedFocus] = useState(state._lastFocus || null);
    const hireStaff = useHotelStore(s => s.hireStaff);
    const fireStaff = useHotelStore(s => s.fireStaff);
    const setPhase = useHotelStore(s => s.setPhase);

    const prop = PROPERTIES[state.propertyKey];
    const phase = getCh3Phase(state.turn);
    const phaseInfo = CH3_PHASES[phase];
    const monthInfo = getCh3Month(state.turn);
    const ota = OTA_LEVELS[state.otaLevel];
    const occPct = Math.round(state.weeklyOccupancy * 100);
    const occColor = occPct >= 70 ? '--green' : occPct >= 40 ? '--yellow' : '--red';
    const otaDep = Math.round(state.otaDependency * 100);
    const otaColor = otaDep > 80 ? 'var(--ch3-red)' : otaDep > 50 ? 'var(--ch3-gold)' : 'var(--ch3-green)';

    return (
        <div className="ch3-container">
            {/* ヘッダ */}
            <div className="ch3-header">
                <span className="ch3-header__turn">Week {state.turn} / 68</span>
                <span className="ch3-header__phase">{phaseInfo?.label || ''}</span>
                <span className="ch3-header__money">¥{state.money.toLocaleString()}</span>
            </div>

            {/* 季節 */}
            <div className="ch3-card" style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.75rem' }}>
                <span>{monthInfo?.label || ''}</span>
                <span style={{ marginLeft: 10, color: 'var(--ch3-accent)' }}>
                    季節倍率: ×{(state.weekResult?.season?.base || monthInfo?.base || 1.0).toFixed(1)}
                </span>
                {state.weekResult?.weather && (
                    <span style={{ marginLeft: 10 }}>
                        {state.weekResult.weather === 'sunny' ? '☀️' : state.weekResult.weather === 'cloudy' ? '⛅' : state.weekResult.weather === 'rainy' ? '🌧️' : '🌀'}
                    </span>
                )}
            </div>

            {/* チャプターゴール */}
            <GoalBar goal={CH3_GOAL} state={state} />
            <AdvisorBar chapter={3} state={state} />
            <WeeklyFocusBar cards={getWeeklyFocusCards(3)} selected={selectedFocus} onSelect={setSelectedFocus} />

            {/* KPIグリッド */}
            <div className="ch3-kpi-grid">
                <div className="ch3-kpi">
                    <div className="ch3-kpi__label"><KPITooltip term="稼働率">稼働率</KPITooltip></div>
                    <div className={`ch3-kpi__value ch3-kpi__value${occColor}`}>{occPct}%</div>
                </div>
                <div className="ch3-kpi">
                    <div className="ch3-kpi__label"><KPITooltip term="ADR">ADR</KPITooltip></div>
                    <div className="ch3-kpi__value ch3-kpi__value--accent">
                        ¥{state.weeklyADR.toLocaleString()}
                    </div>
                </div>
                <div className="ch3-kpi">
                    <div className="ch3-kpi__label"><KPITooltip term="RevPAR">RevPAR</KPITooltip></div>
                    <div className="ch3-kpi__value ch3-kpi__value--gold">
                        ¥{state.weeklyRevPAR.toLocaleString()}
                    </div>
                </div>
                <div className="ch3-kpi">
                    <div className="ch3-kpi__label">口コミ</div>
                    <div className="ch3-kpi__value ch3-kpi__value--accent">
                        {'★'.repeat(Math.floor(state.reputation))} {state.reputation.toFixed(1)}
                    </div>
                </div>
            </div>

            {/* 業界ベンチマーク */}
            {state.turn >= 4 && (
                <div style={{ padding: '8px 16px' }}>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: '0.1em' }}>業界平均との比較</div>
                    <BenchmarkBar label="稼働率" value={occPct} avg={70} max={100} unit="%" />
                    <BenchmarkBar label="ADR" value={state.weeklyADR} avg={8000} max={20000} unit="" />
                    <BenchmarkBar label="RevPAR" value={state.weeklyRevPAR} avg={5600} max={15000} unit="" />
                    <BenchmarkBar label="口コミ" value={state.reputation} avg={3.8} max={5} unit="" />
                </div>
            )}

            {/* 稼働率ゲージ */}
            <div className="ch3-card">
                <div className="ch3-section-title">稼働率</div>
                <div className="ch3-gauge">
                    <div
                        className={`ch3-gauge__fill ch3-gauge__fill${occColor}`}
                        style={{ width: `${Math.min(100, occPct)}%` }}
                    />
                </div>
                <div className="ch3-occ-label">
                    <span>0%</span>
                    <span>{occPct}%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* OTA依存度 */}
            <div className="ch3-card">
                <div className="ch3-section-title">OTA依存度</div>
                <div className="ch3-gauge">
                    <div className="ch3-gauge__fill ch3-gauge__fill--blue" style={{ width: `${otaDep}%` }} />
                </div>
                <div className="ch3-occ-label">
                    <span style={{ color: otaColor }}>OTA: {otaDep}%</span>
                    <span style={{ color: 'var(--ch3-green)' }}>直販: {Math.round(state.directBookingRatio * 100)}%</span>
                </div>
                {state.selfBookingSite && (
                    <p style={{ fontSize: '0.68rem', color: 'var(--ch3-green)', marginTop: 4 }}>
                        ✅ 自社予約サイト運用中
                    </p>
                )}
            </div>

            {/* P\u0026L */}
            <div className="ch3-card">
                <div className="ch3-section-title">損益（前週）</div>
                <div className={`ch3-row`}>
                    <span className="ch3-row__label">売上</span>
                    <span className="ch3-row__value">¥{state.weeklySales.toLocaleString()}</span>
                </div>
                <div className="ch3-row">
                    <span className="ch3-row__label">OTA手数料</span>
                    <span className="ch3-row__value" style={{ color: 'var(--ch3-red)' }}>
                        -¥{(state.weekResult?.otaCommission || 0).toLocaleString()}
                    </span>
                </div>
                <div className="ch3-row">
                    <span className="ch3-row__label">変動費</span>
                    <span className="ch3-row__value">-¥{(state.weekResult?.variableCosts || 0).toLocaleString()}</span>
                </div>
                <div className="ch3-row">
                    <span className="ch3-row__label">固定費</span>
                    <span className="ch3-row__value">-¥{(state.weekResult?.fixedCosts || 0).toLocaleString()}</span>
                </div>
                <div className={`ch3-row ${state.weeklyProfit >= 0 ? 'ch3-row--profit' : 'ch3-row--loss'}`} style={{ borderTop: '1px solid var(--ch3-border)', paddingTop: 6, fontWeight: 700 }}>
                    <span className="ch3-row__label">純利益</span>
                    <span className="ch3-row__value">¥{state.weeklyProfit.toLocaleString()}</span>
                </div>
                {state.breakfastEnabled && (
                    <div className="ch3-row">
                        <span className="ch3-row__label">☕ 朝食収入</span>
                        <span className="ch3-row__value" style={{ color: 'var(--ch3-green)' }}>
                            +¥{(state.weekResult?.breakfastRevenue || 0).toLocaleString()}
                        </span>
                    </div>
                )}
            </div>

            {/* スタッフ */}
            <div className="ch3-card">
                <div className="ch3-section-title">スタッフ</div>
                {state.staff.length === 0 ? (
                    <p style={{ fontSize: '0.72rem', color: 'var(--ch3-text-sub)' }}>
                        ワンオペ中（{state.totalRooms}室中 上限{SOLO_ROOM_LIMIT}室の管理）
                    </p>
                ) : (
                    <div className="ch3-staff-list">
                        {state.staff.map(s => (
                            <div key={s.id} className="ch3-staff-row">
                                <span className="ch3-staff-row__name">{s.name}</span>
                                <span>¥{s.monthlyCost.toLocaleString()}/月</span>
                                <button className="ch3-staff-row__fire" onClick={() => fireStaff(s.id)}>解雇</button>
                            </div>
                        ))}
                    </div>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {Object.entries(CH3_STAFF).map(([key, info]) => (
                        <button
                            key={key}
                            className="ch3-btn ch3-btn--secondary"
                            style={{ flex: 1, minWidth: 80, fontSize: '0.68rem', padding: '6px 8px' }}
                            onClick={() => hireStaff(key)}
                        >
                            +{info.name}<br />¥{info.monthly.toLocaleString()}/月
                        </button>
                    ))}
                </div>
            </div>

            {/* ダイナミックプライシングボタン */}
            {state.dynamicPricingUnlocked && (
                <button
                    className="ch3-btn ch3-btn--secondary"
                    style={{ marginBottom: 10 }}
                    onClick={() => setPhase('ch3-pricing')}
                >
                    📊 ダイナミックプライシング設定
                </button>
            )}

            {/* EXIT */}
            {state.exitAvailable && (
                <button
                    className="ch3-btn ch3-btn--secondary"
                    style={{ borderColor: 'var(--ch3-gold)', color: 'var(--ch3-gold)', marginBottom: 10 }}
                    onClick={() => setPhase('ch3-exit')}
                >
                    🚪 EXITを検討する
                </button>
            )}

            {/* オートモード */}
            {state.turn >= 10 && (
                <button
                    onClick={() => useHotelStore.setState({ autoMode: !state.autoMode })}
                    className="ch3-btn"
                    style={{
                        background: state.autoMode ? 'var(--ch3-accent)' : 'transparent',
                        color: state.autoMode ? '#fff' : 'var(--ch3-accent)',
                        border: '1px solid var(--ch3-accent)',
                        fontSize: '0.72rem', marginBottom: 8,
                    }}
                >
                    ⚡ オート {state.autoMode ? 'ON' : 'OFF'}
                </button>
            )}

            {/* 経営確定 */}
            <button className="ch3-btn" disabled={!selectedFocus} onClick={() => {
                const card = getWeeklyFocusCards(3).find(c => c.id === selectedFocus);
                confirmWeek({ _focus: card ? card.apply() : {} });
                useHotelStore.setState({ _lastFocus: selectedFocus });
                setSelectedFocus(null);
            }}>
                {!selectedFocus ? '⚡ 判断を選んでください' : '今週の経営を確定 →'}
            </button>

            {/* 累計 */}
            <div style={{ fontSize: '0.65rem', color: 'var(--ch3-text-sub)', textAlign: 'center', marginTop: 10 }}>
                累計売上 ¥{state.totalSales.toLocaleString()} / 企業価値 ¥{state.enterpriseValue.toLocaleString()}
            </div>
        </div>
    );
}
