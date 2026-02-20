/**
 * 融資設定画面
 */
import React, { useState } from 'react';
import { useREStore } from '../../store/realEstateEngine';
import { PROPERTY_TYPES, INTEREST_RATES, LOAN_TERMS, DOWN_PAYMENT_RATIO, ACQUISITION_COST_RATIO, calcMonthlyPayment, calcDSCR, calcAnnualNOI } from '../../data/ch5Constants';

export default function LoanSetup() {
    const selectedType = useREStore(s => s.selectedPropertyType);
    const money = useREStore(s => s.money);
    const applyLoan = useREStore(s => s.applyLoan);

    const [rateType, setRateType] = useState('variable');
    const [termYears, setTermYears] = useState(25);

    const pt = PROPERTY_TYPES[selectedType];
    if (!pt) return null;

    const price = pt.price;
    const downPayment = Math.round(price * DOWN_PAYMENT_RATIO);
    const acquisitionCost = Math.round(price * ACQUISITION_COST_RATIO);
    const principal = price - downPayment;
    const rate = INTEREST_RATES[rateType].rate;
    const mp = calcMonthlyPayment(principal, rate, termYears);
    const noi = calcAnnualNOI({ ...pt, purchasePrice: price, occupancyRate: 0.9 });
    const dscr = calcDSCR(noi, mp * 12);
    const dscrClass = dscr >= 1.3 ? 'safe' : dscr >= 1.0 ? 'warn' : 'danger';
    const dscrLabel = dscr >= 1.3 ? '✅ 安全圏' : dscr >= 1.0 ? '⚠ 危険圏' : '❌ 赤字圏';

    const totalCost = downPayment + acquisitionCost;
    const canAfford = money >= totalCost;

    return (
        <>
            <div className="ch5-header">
                <div className="ch5-header__chapter">Chapter 5 — 不動産投資</div>
                <div className="ch5-header__title">融資申請</div>
            </div>

            {/* ローン概要 */}
            <div className="ch5-card">
                <div className="ch5-row">
                    <span className="ch5-row__label">物件価格</span>
                    <span className="ch5-row__value">¥{price.toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">自己資金（20%）</span>
                    <span className="ch5-row__value">¥{downPayment.toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">諸費用（7%）</span>
                    <span className="ch5-row__value">¥{acquisitionCost.toLocaleString()}</span>
                </div>
                <div className="ch5-row" style={{ fontWeight: 700 }}>
                    <span className="ch5-row__label">融資額</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-blue)' }}>¥{principal.toLocaleString()}</span>
                </div>
            </div>

            {/* 金利タイプ */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">金利タイプ</div>
                <div className="ch5-loan-option">
                    {Object.values(INTEREST_RATES).map(r => (
                        <div
                            key={r.key}
                            className={`ch5-loan-option__card ${rateType === r.key ? 'ch5-loan-option__card--active' : ''}`}
                            onClick={() => setRateType(r.key)}
                        >
                            <div className="ch5-loan-option__label">{r.name} {(r.rate * 100).toFixed(1)}%</div>
                            <div className="ch5-loan-option__sub">{r.description}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 返済期間 */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">返済期間</div>
                <div className="ch5-loan-option">
                    {LOAN_TERMS.map(t => (
                        <div
                            key={t.years}
                            className={`ch5-loan-option__card ${termYears === t.years ? 'ch5-loan-option__card--active' : ''}`}
                            onClick={() => setTermYears(t.years)}
                        >
                            <div className="ch5-loan-option__label">{t.label}</div>
                            <div className="ch5-loan-option__sub">{t.description}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* シミュレーション結果 */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">返済シミュレーション</div>
                <div className="ch5-row">
                    <span className="ch5-row__label">月返済額</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-accent)', fontSize: '0.9rem' }}>
                        ¥{mp.toLocaleString()}
                    </span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">年間NOI</span>
                    <span className="ch5-row__value">¥{noi.toLocaleString()}</span>
                </div>
                <div className="ch5-row" style={{ fontWeight: 700 }}>
                    <span className="ch5-row__label">DSCR（返済安全率）</span>
                    <span className={`ch5-row__value ch5-property-card__dscr ch5-property-card__dscr--${dscrClass}`}>
                        {dscr} {dscrLabel}
                    </span>
                </div>
            </div>

            {/* 資金確認 */}
            <div className="ch5-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.64rem', color: 'var(--ch5-text-sub)' }}>必要自己資金</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: canAfford ? 'var(--ch5-green)' : 'var(--ch5-red)' }}>
                    ¥{totalCost.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.58rem', color: 'var(--ch5-text-sub)' }}>
                    現在の資金: ¥{money.toLocaleString()} {canAfford ? '✅' : '❌ 資金不足'}
                </div>
            </div>

            <button className="ch5-btn ch5-btn--primary" disabled={!canAfford} onClick={() => applyLoan(rateType, termYears)}>
                融資申請して物件を取得する →
            </button>
        </>
    );
}
