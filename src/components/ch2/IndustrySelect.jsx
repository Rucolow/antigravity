import React from 'react';
import { useRetailStore } from '../../store/retailEngine';
import { INDUSTRIES } from '../../data/ch2Constants';

export default function IndustrySelect() {
    const money = useRetailStore(s => s.money);
    const ch1Skills = useRetailStore(s => s.ch1Skills);
    const selectIndustry = useRetailStore(s => s.selectIndustry);
    const hasCafeExp = ch1Skills.includes('cafe_experience');

    return (
        <div className="ch2-setup">
            <div className="ch2-setup__header">
                <span className="ch2-setup__step">STEP 1 / 4</span>
                <h2>業種を選ぶ</h2>
                <p className="ch2-setup__subtitle">「モノを売る」ための商品分野を決めよう</p>
                <p className="ch2-setup__budget">資金: ¥{money.toLocaleString()}</p>
            </div>

            {hasCafeExp && (
                <div className="ch2-skill-badge">☕ カフェ経験 → コーヒー豆なら品質目利き+20%</div>
            )}

            <div className="ch2-setup__cards">
                {Object.entries(INDUSTRIES).map(([key, ind]) => (
                    <div
                        key={key}
                        className="ch2-card"
                        onClick={() => selectIndustry(key)}
                    >
                        <div className="ch2-card__icon">{ind.icon}</div>
                        <div className="ch2-card__title">{ind.name}</div>
                        <div className="ch2-card__stats">
                            <div className="ch2-card__stat">
                                <span>平均単価</span>
                                <strong>¥{ind.avgUnit.toLocaleString()}</strong>
                            </div>
                            <div className="ch2-card__stat">
                                <span>粗利率</span>
                                <strong>{Math.round((1 - ind.costRatio) * 100)}%</strong>
                            </div>
                            <div className="ch2-card__stat">
                                <span>原価率</span>
                                <strong>{Math.round(ind.costRatio * 100)}%</strong>
                            </div>
                        </div>
                        <div className="ch2-card__desc">{ind.description || ''}</div>
                        {key === 'coffee' && hasCafeExp && (
                            <div className="ch2-card__bonus">☕ カフェ経験ボーナス適用</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
