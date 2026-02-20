import React from 'react';
import { useHotelStore } from '../../store/hotelEngine';

export default function PricingPanel() {
    const mults = useHotelStore(s => s.priceMultipliers);
    const pricingMode = useHotelStore(s => s.pricingMode);
    const setPriceMultipliers = useHotelStore(s => s.setPriceMultipliers);
    const setPhase = useHotelStore(s => s.setPhase);

    const handleChange = (key, value) => {
        const newMults = { ...mults, [key]: parseFloat(value) };
        setPriceMultipliers(newMults);
    };

    const toggleMode = () => {
        useHotelStore.setState({
            pricingMode: pricingMode === 'fixed' ? 'dynamic' : 'fixed',
        });
    };

    return (
        <div className="ch3-container">
            <h2 className="ch3-title">📊 ダイナミックプライシング</h2>
            <p className="ch3-subtitle">
                曜日・シーズンに応じて宿泊料金の倍率を調整
            </p>

            {/* モード切替 */}
            <div className="ch3-card" style={{ textAlign: 'center' }}>
                <div className="ch3-section-title">価格モード</div>
                <button
                    className={`ch3-btn ${pricingMode === 'dynamic' ? '' : 'ch3-btn--secondary'}`}
                    onClick={toggleMode}
                    style={{ maxWidth: 200, margin: '0 auto' }}
                >
                    {pricingMode === 'fixed' ? '🔒 固定価格' : '📊 ダイナミック'}
                </button>
                <p style={{ fontSize: '0.68rem', color: 'var(--ch3-text-sub)', marginTop: 6 }}>
                    {pricingMode === 'fixed'
                        ? '全日同一料金。安定だが利益最大化は難しい。'
                        : '需要に応じて料金を変動。RevPAR最大化。'}
                </p>
            </div>

            {/* スライダー */}
            {pricingMode === 'dynamic' && (
                <div className="ch3-card ch3-pricing">
                    <div className="ch3-section-title">倍率設定</div>

                    <div className="ch3-pricing__slider-row">
                        <span className="ch3-pricing__slider-label">平日</span>
                        <input
                            type="range"
                            className="ch3-pricing__slider"
                            min="0.5"
                            max="1.5"
                            step="0.05"
                            value={mults.weekday}
                            onChange={e => handleChange('weekday', e.target.value)}
                        />
                        <span className="ch3-pricing__value">×{mults.weekday.toFixed(2)}</span>
                    </div>

                    <div className="ch3-pricing__slider-row">
                        <span className="ch3-pricing__slider-label">週末</span>
                        <input
                            type="range"
                            className="ch3-pricing__slider"
                            min="0.8"
                            max="2.0"
                            step="0.05"
                            value={mults.weekend}
                            onChange={e => handleChange('weekend', e.target.value)}
                        />
                        <span className="ch3-pricing__value">×{mults.weekend.toFixed(2)}</span>
                    </div>

                    <div className="ch3-pricing__slider-row">
                        <span className="ch3-pricing__slider-label">繁忙期</span>
                        <input
                            type="range"
                            className="ch3-pricing__slider"
                            min="1.0"
                            max="3.0"
                            step="0.05"
                            value={mults.peak}
                            onChange={e => handleChange('peak', e.target.value)}
                        />
                        <span className="ch3-pricing__value">×{mults.peak.toFixed(2)}</span>
                    </div>

                    <p style={{ fontSize: '0.68rem', color: 'var(--ch3-text-sub)', marginTop: 8 }}>
                        ⚠️ 値上げすると稼働率が下がり、値下げすると稼働率が上がります。<br />
                        繁忙期は弾力性が低い（値上げしても客が離れにくい）。<br />
                        閑散期は弾力性が高い（値下げが効きやすい）。
                    </p>
                </div>
            )}

            <button className="ch3-btn" onClick={() => setPhase('ch3-dashboard')}>
                ← ダッシュボードに戻る
            </button>
        </div>
    );
}
