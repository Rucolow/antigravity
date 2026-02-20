/**
 * ブランド＋パッケージ選択画面 (Turn 2)
 */
import React, { useState } from 'react';
import { useECStore } from '../../store/ecEngine';
import { BRAND_CONCEPTS, PACKAGE_DESIGNS } from '../../data/ch4Constants';

export default function BrandSetup() {
    const selectBrand = useECStore(s => s.selectBrand);
    const money = useECStore(s => s.money);

    const [concept, setConcept] = useState(null);
    const [pkg, setPkg] = useState(null);

    const canProceed = concept && pkg;

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">ブランドを構築しよう</div>
                <div className="ch4-header__phase">資金: ¥{money.toLocaleString()}</div>
            </div>

            <div className="ch4-card">
                <div className="ch4-card__title">ブランドコンセプト</div>
                <div className="ch4-select-grid">
                    {Object.entries(BRAND_CONCEPTS).map(([key, bc]) => (
                        <div
                            key={key}
                            className={`ch4-select-card ${concept === key ? 'ch4-select-card--selected' : ''}`}
                            onClick={() => setConcept(key)}
                        >
                            <div className="ch4-select-card__name">{bc.name}</div>
                            <div className="ch4-select-card__desc">{bc.desc}</div>
                            <div className="ch4-select-card__stats">
                                <span className="ch4-select-card__stat">
                                    単価{bc.priceMultiplier > 1 ? '+' : ''}{Math.round((bc.priceMultiplier - 1) * 100)}%
                                </span>
                                <span className="ch4-select-card__stat">
                                    CAC{bc.cacMultiplier > 1 ? '+' : ''}{Math.round((bc.cacMultiplier - 1) * 100)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ch4-card">
                <div className="ch4-card__title">パッケージデザイン</div>
                <div className="ch4-select-grid">
                    {Object.entries(PACKAGE_DESIGNS).map(([key, pd]) => (
                        <div
                            key={key}
                            className={`ch4-select-card ${pkg === key ? 'ch4-select-card--selected' : ''}`}
                            onClick={() => setPkg(key)}
                        >
                            <div className="ch4-select-card__name">
                                {pd.name}
                                <span style={{ fontSize: '0.68rem', color: 'var(--ch4-accent-light)', marginLeft: '0.5rem' }}>
                                    ¥{pd.cost.toLocaleString()}
                                </span>
                            </div>
                            <div className="ch4-select-card__desc">{pd.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {canProceed && (
                <button
                    className="ch4-btn ch4-btn--primary"
                    onClick={() => selectBrand(concept, pkg)}
                >
                    決定して次へ
                </button>
            )}
        </>
    );
}
