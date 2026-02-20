import React, { useState } from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import { LOCATIONS } from '../../data/ch1Constants';

export default function LocationSelect() {
    const selectLocation = useCafeStore(s => s.selectLocation);
    const money = useCafeStore(s => s.money);
    const [selected, setSelected] = useState(null);
    const [showDetail, setShowDetail] = useState(null);

    const locations = Object.entries(LOCATIONS);

    return (
        <div className="ch1-setup">
            <div className="ch1-setup__header">
                <span className="ch1-setup__step">STEP 1 / 4</span>
                <h2>カフェを開く場所を選ぼう</h2>
                <p className="ch1-setup__budget">開業資金: <strong>¥{money.toLocaleString()}</strong></p>
            </div>

            <div className="ch1-setup__cards">
                {locations.map(([key, loc]) => (
                    <div
                        key={key}
                        className={`ch1-card ${selected === key ? 'ch1-card--selected' : ''}`}
                        onClick={() => setSelected(key)}
                    >
                        <div className="ch1-card__icon">
                            {key === 'station' ? '🚉' : key === 'residential' ? '🏡' : '🏚️'}
                        </div>
                        <h3 className="ch1-card__title">{loc.name}</h3>
                        <div className="ch1-card__stats">
                            <div className="ch1-card__stat">
                                <span>家賃</span>
                                <strong>¥{loc.rent.toLocaleString()}/月</strong>
                            </div>
                            <div className="ch1-card__stat">
                                <span>席数</span>
                                <strong>{loc.seats}席</strong>
                            </div>
                            <div className="ch1-card__stat">
                                <span>初期来客</span>
                                <strong>{loc.baseCustomers}人/日</strong>
                            </div>
                        </div>
                        <p className="ch1-card__desc">{loc.desc}</p>
                        {loc.repeaterGrowthMult > 1 && (
                            <div className="ch1-card__bonus">
                                🔄 リピーター成長速度 +{Math.round((loc.repeaterGrowthMult - 1) * 100)}%
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selected && (
                <button
                    className="ch1-setup__confirm"
                    onClick={() => selectLocation(selected)}
                >
                    {LOCATIONS[selected].name}に決定 →
                </button>
            )}

            <p className="ch1-setup__note">※ Chapter 1の途中で変更不可</p>
        </div>
    );
}
