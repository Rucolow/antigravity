import React, { useState } from 'react';
import { useHotelStore } from '../../store/hotelEngine';
import { OTA_LEVELS, FACILITIES } from '../../data/ch3Constants';

export default function ChannelSetup() {
    const [otaLevel, setOtaLevel] = useState('high');
    const [facilities, setFacilities] = useState([]);
    const money = useHotelStore(s => s.money);
    const setupChannels = useHotelStore(s => s.setupChannels);

    const toggleFacility = (key) => {
        setFacilities(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const facilCost = facilities.reduce((sum, k) => sum + (FACILITIES[k]?.cost || 0), 0);
    const canAfford = money >= facilCost;

    return (
        <div className="ch3-container">
            <div className="ch3-setup__step">Step 3 / 3</div>
            <h2 className="ch3-title">📡 チャネル & 設備</h2>
            <p className="ch3-subtitle" style={{ color: 'var(--ch3-green)' }}>
                💰 残り資金: ¥{money.toLocaleString()}
            </p>

            {/* OTAレベル選択 */}
            <h3 className="ch3-section-title">OTA掲載レベル</h3>
            {Object.entries(OTA_LEVELS).map(([key, level]) => (
                <div
                    key={key}
                    className={`ch3-card ch3-card--clickable ${otaLevel === key ? 'ch3-card--selected' : ''}`}
                    onClick={() => setOtaLevel(key)}
                >
                    <div className="ch3-property-card__name">{level.name}</div>
                    <div className="ch3-row">
                        <span className="ch3-row__label">手数料率</span>
                        <span className="ch3-row__value">{(level.commissionRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="ch3-row">
                        <span className="ch3-row__label">集客力</span>
                        <span className="ch3-row__value">×{level.reachPower}</span>
                    </div>
                    <div className="ch3-row">
                        <span className="ch3-row__label">OTA依存度</span>
                        <span className="ch3-row__value" style={{ color: level.initialDependency > 0.85 ? 'var(--ch3-red)' : 'var(--ch3-text)' }}>
                            {(level.initialDependency * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
            ))}

            {/* 共用施設 */}
            <h3 className="ch3-section-title" style={{ marginTop: 18 }}>共用施設（任意）</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {Object.entries(FACILITIES).map(([key, fac]) => (
                    <div
                        key={key}
                        className={`ch3-facility-chip ${facilities.includes(key) ? 'ch3-facility-chip--selected' : ''}`}
                        onClick={() => toggleFacility(key)}
                    >
                        <span>{fac.name}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--ch3-text-sub)' }}>
                            ¥{fac.cost.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            {facilCost > 0 && (
                <p style={{ fontSize: '0.72rem', color: canAfford ? 'var(--ch3-green)' : 'var(--ch3-red)', marginTop: 8 }}>
                    施設費合計: ¥{facilCost.toLocaleString()}
                </p>
            )}

            <button
                className="ch3-btn"
                disabled={!canAfford}
                onClick={() => setupChannels(otaLevel, facilities)}
                style={{ marginTop: 18 }}
            >
                開業準備を完了する
            </button>
        </div>
    );
}
