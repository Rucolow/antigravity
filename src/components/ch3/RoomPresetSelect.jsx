import React, { useState } from 'react';
import { useHotelStore } from '../../store/hotelEngine';
import { ROOM_PRESETS, PROPERTIES } from '../../data/ch3Constants';

export default function RoomPresetSelect() {
    const [selected, setSelected] = useState(null);
    const money = useHotelStore(s => s.money);
    const totalRooms = useHotelStore(s => s.totalRooms);
    const propertyKey = useHotelStore(s => s.propertyKey);
    const selectRoomPreset = useHotelStore(s => s.selectRoomPreset);

    const prop = PROPERTIES[propertyKey];

    return (
        <div className="ch3-container">
            <div className="ch3-setup__step">Step 2 / 3</div>
            <h2 className="ch3-title">🛏️ 客室タイプを選ぶ</h2>
            <p className="ch3-subtitle">
                {prop?.name || ''} — {totalRooms}室をどう配分する？
            </p>
            <p className="ch3-subtitle" style={{ color: 'var(--ch3-green)' }}>
                💰 残り資金: ¥{money.toLocaleString()}
            </p>

            {Object.entries(ROOM_PRESETS).map(([key, preset]) => {
                // 配分ごとのコスト計算
                let setupCost = 0;
                let weighted = 0;
                let count = 0;
                for (const type of ['dormitory', 'standard', 'premium']) {
                    const roomCount = Math.round(totalRooms * preset.distribution[type]);
                    if (roomCount > 0 && preset.adr[type] > 0) {
                        setupCost += roomCount * preset.setupCostPerRoom[type];
                        weighted += roomCount * preset.adr[type];
                        count += roomCount;
                    }
                }
                const avgADR = count > 0 ? Math.floor(weighted / count) : 0;
                const canAfford = money >= setupCost;

                return (
                    <div
                        key={key}
                        className={`ch3-card ch3-card--clickable ${selected === key ? 'ch3-card--selected' : ''}`}
                        onClick={() => canAfford && setSelected(key)}
                        style={!canAfford ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                        <div className="ch3-property-card__name">{preset.name}</div>
                        <div className="ch3-property-card__desc">{preset.desc}</div>
                        <div className="ch3-row">
                            <span className="ch3-row__label">設営費合計</span>
                            <span className="ch3-row__value" style={{ color: canAfford ? 'var(--ch3-green)' : 'var(--ch3-red)' }}>
                                ¥{setupCost.toLocaleString()}
                            </span>
                        </div>
                        <div className="ch3-row">
                            <span className="ch3-row__label">平均ADR</span>
                            <span className="ch3-row__value">¥{avgADR.toLocaleString()}</span>
                        </div>
                        {preset.occupancyBonus !== 0 && (
                            <div className="ch3-row">
                                <span className="ch3-row__label">稼働率補正</span>
                                <span className="ch3-row__value" style={{ color: preset.occupancyBonus > 0 ? 'var(--ch3-green)' : 'var(--ch3-red)' }}>
                                    {preset.occupancyBonus > 0 ? '+' : ''}{(preset.occupancyBonus * 100).toFixed(0)}%
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}

            <button
                className="ch3-btn"
                disabled={!selected}
                onClick={() => selectRoomPreset(selected)}
            >
                この構成で決定
            </button>
        </div>
    );
}
