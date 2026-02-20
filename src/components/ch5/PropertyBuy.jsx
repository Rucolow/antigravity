/**
 * 追加物件購入画面（Phase B以降）
 */
import React from 'react';
import { useREStore } from '../../store/realEstateEngine';
import { SECOND_PROPERTIES, ACQUISITION_COST_RATIO, DOWN_PAYMENT_RATIO, calcMonthlyPayment, calcDSCR, calcAnnualNOI, INTEREST_RATES, canGetLoan } from '../../data/ch5Constants';

export default function PropertyBuy() {
    const s = useREStore();
    const buyProperty = useREStore(st => st.buyProperty);
    const backToDashboard = useREStore(st => st.backToDashboard);

    const candidates = Object.values(SECOND_PROPERTIES);

    return (
        <>
            <div className="ch5-header">
                <div className="ch5-header__chapter">Chapter 5 — 不動産投資</div>
                <div className="ch5-header__title">追加物件取得</div>
            </div>

            {s.ltvRatio >= 80 && (
                <div className="ch5-card" style={{ borderColor: 'var(--ch5-red)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ch5-red)', fontWeight: 700 }}>
                        ⚠ LTV比率が{s.ltvRatio}%。融資審査が厳しい状況です。
                    </div>
                </div>
            )}

            <div className="ch5-select-grid">
                {candidates.map(t => {
                    const price = t.price;
                    const downPayment = Math.round(price * DOWN_PAYMENT_RATIO);
                    const acquisitionCost = Math.round(price * ACQUISITION_COST_RATIO);
                    const totalRequired = downPayment + acquisitionCost;
                    const principal = price - downPayment;
                    const rate = INTEREST_RATES[s.selectedRateType || 'variable'].rate;
                    const mp = calcMonthlyPayment(principal, rate, s.selectedTermYears || 25);
                    const noi = calcAnnualNOI({ ...t, purchasePrice: price, occupancyRate: 0.9 });
                    const dscr = calcDSCR(noi, mp * 12);
                    const affordable = s.money >= totalRequired;

                    return (
                        <div key={t.key} className="ch5-select-card">
                            <div className="ch5-select-card__name">{t.name}</div>
                            <div className="ch5-select-card__stats">
                                <span className="ch5-select-card__stat">¥{price.toLocaleString()}</span>
                                <span className="ch5-select-card__stat">利回り {(t.grossYield * 100).toFixed(1)}%</span>
                                <span className="ch5-select-card__stat">{t.totalUnits}室</span>
                                <span className="ch5-select-card__stat">築{t.age}年</span>
                                <span className="ch5-select-card__stat">耐用年数残{t.remainingUsefulLife}年</span>
                            </div>
                            <div className="ch5-select-card__desc">{t.description}</div>

                            <div style={{ marginTop: '0.25rem', fontSize: '0.62rem' }}>
                                <div className="ch5-row">
                                    <span className="ch5-row__label">月返済</span>
                                    <span className="ch5-row__value">¥{mp.toLocaleString()}</span>
                                </div>
                                <div className="ch5-row">
                                    <span className="ch5-row__label">DSCR</span>
                                    <span className="ch5-row__value" style={{ color: dscr >= 1.3 ? 'var(--ch5-green)' : 'var(--ch5-red)' }}>
                                        {dscr}
                                    </span>
                                </div>
                                <div className="ch5-row">
                                    <span className="ch5-row__label">必要資金</span>
                                    <span className="ch5-row__value" style={{ color: affordable ? 'var(--ch5-green)' : 'var(--ch5-red)' }}>
                                        ¥{totalRequired.toLocaleString()} {affordable ? '✅' : '❌'}
                                    </span>
                                </div>
                            </div>

                            <button
                                className="ch5-btn ch5-btn--primary"
                                style={{ marginTop: '0.2rem' }}
                                disabled={!affordable || s.ltvRatio >= 80}
                                onClick={() => buyProperty(t.key)}
                            >
                                取得する
                            </button>
                        </div>
                    );
                })}
            </div>

            <button className="ch5-btn ch5-btn--secondary" onClick={backToDashboard} style={{ marginTop: '0.4rem' }}>
                ← 戻る
            </button>
        </>
    );
}
