import React from 'react';
import { useHotelStore } from '../../store/hotelEngine';

export default function HotelResult() {
    const state = useHotelStore(s => s);
    const nextTurn = useHotelStore(s => s.nextTurn);
    const result = state.weekResult;

    if (!result) return null;

    const profit = state.weeklyProfit;
    const occPct = Math.round(state.weeklyOccupancy * 100);
    const isProfit = profit >= 0;

    // メッセージ生成
    let message = '';
    if (occPct >= 90) message = '🎉 ほぼ満室！素晴らしい稼働率。';
    else if (occPct >= 70) message = '✅ 安定した稼働率。';
    else if (occPct >= 50) message = '📊 まずまずの稼働率。まだ伸ばせる。';
    else if (occPct >= 30) message = '⚠️ 空室が目立つ…固定費が重い。';
    else message = '🚨 深刻な稼働不足。現金が流出している。';

    // マイルストーンチェック
    const newMilestone = state.milestonesHit.find(m => m.turn === state.turn);

    return (
        <div className="ch3-container">
            <h2 className="ch3-title">📊 Week {state.turn} 結果</h2>

            <p style={{ textAlign: 'center', fontSize: '0.82rem', marginBottom: 14 }}>
                {message}
            </p>

            {/* マイルストーン */}
            {newMilestone && (
                <div className="ch3-card" style={{ borderColor: 'var(--ch3-gold)', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem' }}>
                        {newMilestone.type === 'full_house' ? '🎊' : '🏆'}
                    </p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ch3-gold)' }}>
                        {newMilestone.type === 'full_house' && 'マイルストーン達成: 初の満室！'}
                        {newMilestone.type === 'revpar_8k' && 'マイルストーン達成: RevPAR ¥8,000突破！'}
                    </p>
                </div>
            )}

            {/* KPI */}
            <div className="ch3-kpi-grid">
                <div className="ch3-kpi">
                    <div className="ch3-kpi__label">稼働率</div>
                    <div className={`ch3-kpi__value ${occPct >= 70 ? 'ch3-kpi__value--green' : occPct >= 40 ? 'ch3-kpi__value--gold' : 'ch3-kpi__value--red'}`}>
                        {occPct}%
                    </div>
                    <div className="ch3-kpi__unit">{result.roomsSold} / {result.totalRoomNights} 室泊</div>
                </div>
                <div className="ch3-kpi">
                    <div className="ch3-kpi__label">ADR</div>
                    <div className="ch3-kpi__value ch3-kpi__value--accent">¥{state.weeklyADR.toLocaleString()}</div>
                </div>
                <div className="ch3-kpi">
                    <div className="ch3-kpi__label">RevPAR</div>
                    <div className="ch3-kpi__value ch3-kpi__value--gold">¥{state.weeklyRevPAR.toLocaleString()}</div>
                </div>
                <div className="ch3-kpi">
                    <div className="ch3-kpi__label">天候</div>
                    <div className="ch3-kpi__value">
                        {result.weather === 'sunny' ? '☀️' : result.weather === 'cloudy' ? '⛅' : result.weather === 'rainy' ? '🌧️' : '🌀'}
                    </div>
                </div>
            </div>

            {/* 損益詳細 */}
            <div className="ch3-card">
                <div className="ch3-section-title">損益計算</div>
                <div className="ch3-row">
                    <span className="ch3-row__label">客室売上</span>
                    <span className="ch3-row__value">¥{result.sales.toLocaleString()}</span>
                </div>
                {result.breakfastRevenue > 0 && (
                    <div className="ch3-row">
                        <span className="ch3-row__label">☕ 朝食売上</span>
                        <span className="ch3-row__value" style={{ color: 'var(--ch3-green)' }}>+¥{result.breakfastRevenue.toLocaleString()}</span>
                    </div>
                )}
                <div className="ch3-row">
                    <span className="ch3-row__label">OTA手数料</span>
                    <span className="ch3-row__value" style={{ color: 'var(--ch3-red)' }}>-¥{result.otaCommission.toLocaleString()}</span>
                </div>
                <div className="ch3-row">
                    <span className="ch3-row__label">変動費</span>
                    <span className="ch3-row__value">-¥{result.variableCosts.toLocaleString()}</span>
                </div>
                <div className="ch3-row">
                    <span className="ch3-row__label">固定費</span>
                    <span className="ch3-row__value">-¥{result.fixedCosts.toLocaleString()}</span>
                </div>
                <div className={`ch3-row ${isProfit ? 'ch3-row--profit' : 'ch3-row--loss'}`} style={{ borderTop: '1px solid var(--ch3-border)', paddingTop: 6, fontWeight: 700 }}>
                    <span className="ch3-row__label">純利益</span>
                    <span className="ch3-row__value">¥{profit.toLocaleString()}</span>
                </div>
            </div>

            {/* 直販進捗 */}
            <div className="ch3-card">
                <div className="ch3-section-title">チャネル構成</div>
                <div className="ch3-row">
                    <span className="ch3-row__label">OTA経由</span>
                    <span className="ch3-row__value">{Math.round(state.otaDependency * 100)}%</span>
                </div>
                <div className="ch3-row ch3-row--highlight">
                    <span className="ch3-row__label">直販</span>
                    <span className="ch3-row__value">{Math.round(state.directBookingRatio * 100)}%</span>
                </div>
            </div>

            {/* 雨漏り */}
            {state.leakOccurred && (
                <div className="ch3-card" style={{ borderColor: 'var(--ch3-red)' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--ch3-red)', fontWeight: 700 }}>
                        💧 雨漏り発生！ 修繕費 ¥3,000,000 + 営業への影響
                    </p>
                </div>
            )}

            {/* 手元残高 */}
            <div style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, margin: '14px 0' }}>
                手元資金: <span style={{ color: state.money >= 0 ? 'var(--ch3-green)' : 'var(--ch3-red)' }}>
                    ¥{state.money.toLocaleString()}
                </span>
            </div>

            <button className="ch3-btn" onClick={nextTurn}>
                次の週へ →
            </button>
        </div>
    );
}
