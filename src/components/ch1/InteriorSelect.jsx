import React, { useState } from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import { INTERIORS, MACHINES, OTHER_EQUIPMENT_COST } from '../../data/ch1Constants';

export default function InteriorSelect() {
    const money = useCafeStore(s => s.money);
    const ch0Skills = useCafeStore(s => s.ch0Skills);
    const selectInterior = useCafeStore(s => s.selectInterior);

    const [interior, setInterior] = useState(null);
    const [machine, setMachine] = useState(null);

    const hasDIY = ch0Skills.includes('diy_skill');
    const hasCafe = ch0Skills.includes('coffee_knowledge');

    const totalCost = () => {
        if (!interior || !machine) return 0;
        const iCost = hasDIY ? Math.floor(INTERIORS[interior].cost * 0.8) : INTERIORS[interior].cost;
        return iCost + MACHINES[machine].cost + OTHER_EQUIPMENT_COST;
    };

    const remaining = money - totalCost();

    return (
        <div className="ch1-setup">
            <div className="ch1-setup__header">
                <span className="ch1-setup__step">STEP 2 / 4</span>
                <h2>店の雰囲気を作ろう</h2>
                <p className="ch1-setup__budget">資金: ¥{money.toLocaleString()}</p>
            </div>

            <h3 className="ch1-section-title">内装グレード</h3>
            {hasDIY && <div className="ch1-skill-badge">🔧 DIYスキル → 全グレード−20%</div>}

            <div className="ch1-setup__cards ch1-setup__cards--compact">
                {Object.entries(INTERIORS).map(([key, val]) => {
                    const cost = hasDIY ? Math.floor(val.cost * 0.8) : val.cost;
                    return (
                        <div
                            key={key}
                            className={`ch1-card ch1-card--sm ${interior === key ? 'ch1-card--selected' : ''}`}
                            onClick={() => setInterior(key)}
                        >
                            <h4>{val.name}</h4>
                            <div className="ch1-card__price">¥{cost.toLocaleString()}</div>
                            {hasDIY && val.cost !== cost && (
                                <div className="ch1-card__discount">
                                    <s>¥{val.cost.toLocaleString()}</s>
                                </div>
                            )}
                            <div className="ch1-card__detail">
                                満足度 +{val.satisfactionBonus}
                                {val.snsBonus > 0 && ` / SNS映え +${Math.round(val.snsBonus * 100)}%`}
                            </div>
                        </div>
                    );
                })}
            </div>

            <h3 className="ch1-section-title">エスプレッソマシン</h3>
            {hasCafe && <div className="ch1-skill-badge">☕ カフェバイト経験 → 品質上限+1</div>}

            <div className="ch1-setup__cards ch1-setup__cards--compact">
                {Object.entries(MACHINES).map(([key, val]) => {
                    const qualityCap = hasCafe ? val.qualityCap + 1 : val.qualityCap;
                    return (
                        <div
                            key={key}
                            className={`ch1-card ch1-card--sm ${machine === key ? 'ch1-card--selected' : ''}`}
                            onClick={() => setMachine(key)}
                        >
                            <h4>{val.name}</h4>
                            <div className="ch1-card__price">¥{val.cost.toLocaleString()}</div>
                            <div className="ch1-card__detail">
                                品質上限 {'★'.repeat(qualityCap)}{'☆'.repeat(5 - qualityCap)}
                                {val.speedMod !== 1 && ` / 速度 ${val.speedMod > 1 ? '+' : ''}${Math.round((val.speedMod - 1) * 100)}%`}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="ch1-setup__summary">
                <div>その他必須設備: ¥{OTHER_EQUIPMENT_COST.toLocaleString()}</div>
                {interior && machine && (
                    <>
                        <div className="ch1-setup__total">
                            合計投資: <strong>¥{totalCost().toLocaleString()}</strong>
                        </div>
                        <div className={`ch1-setup__remaining ${remaining < 500000 ? 'ch1-setup__remaining--warn' : ''}`}>
                            残り: ¥{remaining.toLocaleString()}
                            {remaining < 500000 && <span className="ch1-warn"> ⚠️ 運転資金が少なすぎます</span>}
                        </div>
                    </>
                )}
            </div>

            {interior && machine && (
                <button
                    className="ch1-setup__confirm"
                    onClick={() => selectInterior(interior, machine)}
                >
                    この設備で開業準備 →
                </button>
            )}
        </div>
    );
}
