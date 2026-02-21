import React from 'react';
import { useHotelStore } from '../../store/hotelEngine';
import { gradeCh3 } from '../../data/chapterGrade';
import GradeDisplay from '../GradeDisplay';

const SKILL_LABELS = {
    occupancy_master: '🏨 稼働率マスター',
    dynamic_pricing: '📊 ダイナミックプライシング',
    direct_sales: '📱 直販力',
    self_booking: '🌐 自社予約サイト',
    facility_management: '🔧 施設管理',
    inbound_experience: '🌏 インバウンド経験',
    tax_master: '🧾 消費税対応',
    hospitality: '💎 ホスピタリティ',
    hotel_experience: '🛏️ 宿泊業経験',
};

const EXIT_LABELS = {
    mna: 'M&A（事業売却）',
    management: '運営委託（MBO）',
    ipo: 'IPO（上場）',
    liquidation: '清算',
};

export default function Ch3Report() {
    const state = useHotelStore(s => s);

    const avgOcc = state.profitHistory.length > 0
        ? Math.round(state.profitHistory.reduce((s, p) => s + (p.occupancy || 0), 0) / state.profitHistory.length * 100)
        : 0;
    const avgADR = state.profitHistory.length > 0
        ? Math.floor(state.profitHistory.reduce((s, p) => s + (p.adr || 0), 0) / state.profitHistory.length)
        : 0;
    const avgRevPAR = state.profitHistory.length > 0
        ? Math.floor(state.profitHistory.reduce((s, p) => s + (p.revpar || 0), 0) / state.profitHistory.length)
        : 0;
    const avgProfit = state.profitHistory.length > 0
        ? Math.floor(state.profitHistory.reduce((s, p) => s + p.profit, 0) / state.profitHistory.length)
        : 0;

    return (
        <div className="ch3-container ch3-report">
            <h2 className="ch3-title">📋 Chapter 3 レポート</h2>

            <GradeDisplay result={gradeCh3({
                avgOcc,
                avgRevPAR,
                money: state.money,
                skillCount: (state.ch3Skills || []).length,
            })} chapter={3} />

            {/* EXIT結果 */}
            <div className="ch3-card ch3-report__section">
                <h3 className="ch3-section-title">EXIT結果</h3>
                <div className="ch3-report__row">
                    <span>EXIT方法</span><span>{EXIT_LABELS[state.exitType] || '---'}</span>
                </div>
                <div className="ch3-report__row ch3-report__row--highlight">
                    <span>EXIT金額</span><span>¥{(state.exitAmount || 0).toLocaleString()}</span>
                </div>
                <div className="ch3-report__row">
                    <span>最終現金</span><span>¥{state.money.toLocaleString()}</span>
                </div>
                <div className="ch3-report__row">
                    <span>企業価値</span><span>¥{state.enterpriseValue.toLocaleString()}</span>
                </div>
                <div className="ch3-report__row">
                    <span>倍率</span><span>×{state.multiple.toFixed(1)}</span>
                </div>
            </div>

            {/* 経営KPI */}
            <div className="ch3-card ch3-report__section">
                <h3 className="ch3-section-title">経営KPI</h3>
                <div className="ch3-report__row">
                    <span>営業週数</span><span>{state.profitHistory.length}週</span>
                </div>
                <div className="ch3-report__row">
                    <span>平均稼働率</span><span>{avgOcc}%</span>
                </div>
                <div className="ch3-report__row">
                    <span>最高稼働率</span><span>{Math.round(state.maxOccupancy * 100)}%</span>
                </div>
                <div className="ch3-report__row">
                    <span>平均ADR</span><span>¥{avgADR.toLocaleString()}</span>
                </div>
                <div className="ch3-report__row">
                    <span>平均RevPAR</span><span>¥{avgRevPAR.toLocaleString()}</span>
                </div>
                <div className="ch3-report__row">
                    <span>平均週利益</span><span>¥{avgProfit.toLocaleString()}</span>
                </div>
                <div className="ch3-report__row">
                    <span>累計売上</span><span>¥{state.totalSales.toLocaleString()}</span>
                </div>
                <div className="ch3-report__row">
                    <span>累計OTA手数料</span><span>¥{state.totalOTACommission.toLocaleString()}</span>
                </div>
                <div className="ch3-report__row">
                    <span>最終直販率</span><span>{Math.round(state.directBookingRatio * 100)}%</span>
                </div>
                <div className="ch3-report__row">
                    <span>口コミ評価</span>
                    <span>{'★'.repeat(Math.floor(state.reputation))} {state.reputation.toFixed(1)}</span>
                </div>
            </div>

            {/* 習得スキル */}
            <div className="ch3-card ch3-report__section">
                <h3 className="ch3-section-title">習得スキル</h3>
                <div className="ch3-report__skills">
                    {(state.ch3Skills || []).map(skill => (
                        <span key={skill} className="ch3-skill-badge">
                            {SKILL_LABELS[skill] || skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* マイルストーン */}
            {state.milestonesHit.length > 0 && (
                <div className="ch3-card ch3-report__section">
                    <h3 className="ch3-section-title">マイルストーン</h3>
                    {state.milestonesHit.map((m, i) => (
                        <div key={i} className="ch3-report__row">
                            <span>
                                {m.type === 'full_house' && '🎊 初の満室'}
                                {m.type === 'revpar_8k' && '🏆 RevPAR ¥8,000'}
                            </span>
                            <span>Week {m.turn}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* 判断履歴 */}
            <div className="ch3-card ch3-report__section">
                <h3 className="ch3-section-title">判断記録</h3>
                {state.decisions.slice(-12).map((d, i) => (
                    <div key={i} className="ch3-report__row" style={{ fontSize: '0.68rem' }}>
                        <span>Week {d.turn}</span><span>{d.label}</span>
                    </div>
                ))}
            </div>

            <div className="ch3-card" style={{ marginTop: 12, padding: '12px 14px', fontSize: '0.78rem', lineHeight: 1.7 }}>
                <p style={{ margin: '0 0 6px', fontWeight: 600 }}>📘 次の挑戦</p>
                <p style={{ margin: 0 }}>リアル店舗の限界を感じた。デジタルで全国に届けたい。</p>
                <p style={{ margin: 0 }}>RevPARで学んだ「単価×回転」の思考が、CACとLTVの最適化に変わる。</p>
            </div>

            <button
                className="ch3-action-btn"
                onClick={() => useHotelStore.setState({ phase: 'ch3-bridge' })}
                style={{ width: '100%', marginTop: 8 }}
            >
                Chapter 4「EC・D2C」へ進む →
            </button>
        </div>
    );
}
