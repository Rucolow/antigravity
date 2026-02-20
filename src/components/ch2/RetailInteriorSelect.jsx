import React from 'react';
import { useRetailStore } from '../../store/retailEngine';
import { INTERIORS } from '../../data/ch2Constants';

export default function RetailInteriorSelect() {
    const money = useRetailStore(s => s.money);
    const selectInterior = useRetailStore(s => s.selectInterior);

    return (
        <div className="ch2-setup">
            <div className="ch2-setup__header">
                <span className="ch2-setup__step">STEP 3 / 4</span>
                <h2>内装を選ぶ</h2>
                <p className="ch2-setup__subtitle">店の見た目が購買率を左右する</p>
                <p className="ch2-setup__budget">資金: ¥{money.toLocaleString()}</p>
            </div>

            <div className="ch2-setup__cards">
                {Object.entries(INTERIORS).map(([key, int]) => (
                    <div
                        key={key}
                        className={`ch2-card ${money < int.cost ? 'ch2-card--locked' : ''}`}
                        onClick={() => money >= int.cost && selectInterior(key)}
                    >
                        <div className="ch2-card__title">{int.name}</div>
                        <div className="ch2-card__price">¥{int.cost.toLocaleString()}</div>
                        <div className="ch2-card__stats">
                            <div className="ch2-card__stat">
                                <span>購買率UP</span>
                                <strong>+{Math.round(int.purchaseRateBonus * 100)}%</strong>
                            </div>
                        </div>
                        {money < int.cost && (
                            <div className="ch2-card__desc" style={{ color: 'var(--ch2-danger)' }}>
                                資金不足
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
