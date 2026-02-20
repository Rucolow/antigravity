import React, { useState } from 'react';
import { useHotelStore } from '../../store/hotelEngine';
import { PROPERTIES } from '../../data/ch3Constants';

export default function PropertySelect() {
    const [selected, setSelected] = useState(null);
    const money = useHotelStore(s => s.money);
    const selectProperty = useHotelStore(s => s.selectProperty);

    return (
        <div className="ch3-container">
            <div className="ch3-setup__step">Step 1 / 3</div>
            <h2 className="ch3-title">🏨 物件を選ぶ</h2>
            <p className="ch3-subtitle">
                宿泊業の舞台を選択。立地×季節変動×客室数で運命が変わる。
            </p>
            <p className="ch3-subtitle" style={{ color: 'var(--ch3-green)' }}>
                💰 現在の資金: ¥{money.toLocaleString()}
            </p>

            {Object.entries(PROPERTIES).map(([key, prop]) => {
                const downPayment = Math.floor(prop.propertyCost * 0.30) + prop.renovationCost;
                const canAfford = money >= downPayment;

                return (
                    <div
                        key={key}
                        className={`ch3-card ch3-card--clickable ${selected === key ? 'ch3-card--selected' : ''} ${!canAfford ? 'ch3-card--disabled' : ''}`}
                        onClick={() => canAfford && setSelected(key)}
                        style={!canAfford ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                        <div className="ch3-property-card__name">{prop.name}</div>
                        <div className="ch3-row">
                            <span className="ch3-row__label">客室数</span>
                            <span className="ch3-row__value">{prop.totalRooms}室（最大{prop.maxBeds}ベッド）</span>
                        </div>
                        <div className="ch3-row">
                            <span className="ch3-row__label">物件価格</span>
                            <span className="ch3-row__value">¥{prop.propertyCost.toLocaleString()}</span>
                        </div>
                        <div className="ch3-row">
                            <span className="ch3-row__label">頭金（30%）</span>
                            <span className="ch3-row__value" style={{ color: canAfford ? 'var(--ch3-green)' : 'var(--ch3-red)' }}>
                                ¥{downPayment.toLocaleString()}
                            </span>
                        </div>
                        <div className="ch3-row">
                            <span className="ch3-row__label">ローン月額</span>
                            <span className="ch3-row__value">¥{prop.loanPayment.toLocaleString()}/月</span>
                        </div>
                        <div className="ch3-row">
                            <span className="ch3-row__label">季節変動</span>
                            <span className="ch3-row__value">
                                {prop.seasonSwing === 'small' ? '🟢 小' : prop.seasonSwing === 'large' ? '🟡 大' : '🔴 極大'}
                            </span>
                        </div>
                        {prop.inboundBonus && (
                            <div className="ch3-row">
                                <span className="ch3-row__label">特典</span>
                                <span className="ch3-row__value" style={{ color: 'var(--ch3-gold)' }}>🌏 インバウンド特効</span>
                            </div>
                        )}
                        {prop.renovationCost > 0 && (
                            <div className="ch3-row">
                                <span className="ch3-row__label">リノベ費用</span>
                                <span className="ch3-row__value">¥{prop.renovationCost.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                );
            })}

            <button
                className="ch3-btn"
                disabled={!selected}
                onClick={() => selectProperty(selected)}
            >
                この物件で始める
            </button>
        </div>
    );
}
