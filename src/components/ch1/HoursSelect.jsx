import React, { useState } from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import { OPERATING_HOURS } from '../../data/ch1Constants';

export default function HoursSelect() {
    const selectHours = useCafeStore(s => s.selectHours);
    const ch0Skills = useCafeStore(s => s.ch0Skills);
    const [selected, setSelected] = useState(null);

    const hasNightSkill = ch0Skills.includes('night_ops');

    const hours = Object.entries(OPERATING_HOURS);

    return (
        <div className="ch1-setup">
            <div className="ch1-setup__header">
                <span className="ch1-setup__step">STEP 4 / 4</span>
                <h2>営業時間を決めよう</h2>
            </div>

            <div className="ch1-setup__cards">
                {hours.map(([key, h]) => {
                    const locked = h.requiresSkill && !ch0Skills.includes(h.requiresSkill);
                    return (
                        <div
                            key={key}
                            className={`ch1-card ${selected === key ? 'ch1-card--selected' : ''} ${locked ? 'ch1-card--locked' : ''}`}
                            onClick={() => !locked && setSelected(key)}
                        >
                            <div className="ch1-card__icon">
                                {key === 'morning' ? '🌅' : key === 'allday' ? '☀️' : '🌙'}
                            </div>
                            <h3 className="ch1-card__title">{h.name}</h3>
                            <div className="ch1-card__stats">
                                <div className="ch1-card__stat">
                                    <span>ワンオペ上限</span>
                                    <strong>{h.dailyCapacity}杯/日</strong>
                                </div>
                                {h.extraUtilities > 0 && (
                                    <div className="ch1-card__stat">
                                        <span>追加光熱費</span>
                                        <strong>+¥{h.extraUtilities.toLocaleString()}/月</strong>
                                    </div>
                                )}
                                {h.ticketBonus > 0 && (
                                    <div className="ch1-card__stat">
                                        <span>客単価UP</span>
                                        <strong>+¥{h.ticketBonus}</strong>
                                    </div>
                                )}
                            </div>
                            <p className="ch1-card__desc">{h.peakDesc}</p>
                            {locked && (
                                <div className="ch1-card__lock">🔒 コンビニバイト経験が必要</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selected && (
                <button
                    className="ch1-setup__confirm"
                    onClick={() => selectHours(selected)}
                >
                    開業準備完了 → いよいよ開店！
                </button>
            )}
        </div>
    );
}
