import React from 'react';
import { useRetailStore } from '../../store/retailEngine';
import { LOCATIONS } from '../../data/ch2Constants';

export default function RetailLocationSelect() {
    const money = useRetailStore(s => s.money);
    const selectLocation = useRetailStore(s => s.selectLocation);

    return (
        <div className="ch2-setup">
            <div className="ch2-setup__header">
                <span className="ch2-setup__step">STEP 2 / 4</span>
                <h2>立地を選ぶ</h2>
                <p className="ch2-setup__subtitle">場所によって家賃と客足が変わる</p>
                <p className="ch2-setup__budget">資金: ¥{money.toLocaleString()}</p>
            </div>

            <div className="ch2-setup__cards">
                {Object.entries(LOCATIONS).map(([key, loc]) => (
                    <div
                        key={key}
                        className="ch2-card"
                        onClick={() => selectLocation(key)}
                    >
                        <div className="ch2-card__icon">{loc.icon}</div>
                        <div className="ch2-card__title">{loc.name}</div>
                        <div className="ch2-card__stats">
                            <div className="ch2-card__stat">
                                <span>家賃</span>
                                <strong>¥{loc.rent.toLocaleString()}/月</strong>
                            </div>
                            <div className="ch2-card__stat">
                                <span>広さ</span>
                                <strong>{loc.floorSpace}坪</strong>
                            </div>
                            <div className="ch2-card__stat">
                                <span>客足</span>
                                <strong>{'★'.repeat(Math.round(loc.footTraffic * 5))}</strong>
                            </div>
                        </div>
                        <div className="ch2-card__desc">
                            ベースの来客数: {loc.baseCustomers}人/日
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
