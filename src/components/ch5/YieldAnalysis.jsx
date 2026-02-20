/**
 * 利回り分析画面
 */
import React from 'react';
import { useREStore } from '../../store/realEstateEngine';
import { PROPERTY_TYPES, RUNNING_COSTS, ACQUISITION_COST_RATIO, DOWN_PAYMENT_RATIO, calcAnnualNOI } from '../../data/ch5Constants';

export default function YieldAnalysis() {
    const selectedType = useREStore(s => s.selectedPropertyType);
    const confirmYieldAnalysis = useREStore(s => s.confirmYieldAnalysis);
    const pt = PROPERTY_TYPES[selectedType];
    if (!pt) return null;

    const price = pt.price;
    const annualRent = pt.monthlyRentPerUnit * pt.totalUnits * 12;
    const annualRent90 = Math.round(annualRent * 0.9);
    const grossYield = (pt.grossYield * 100).toFixed(1);

    // 年間経費
    const mgmt = Math.round(price * RUNNING_COSTS.managementFeeRate);
    const repair = Math.round(price * RUNNING_COSTS.repairReserveRate);
    const propTax = Math.round(price * RUNNING_COSTS.propertyTaxRate);
    const ins = Math.round(price * RUNNING_COSTS.insuranceRate);
    const compFee = Math.round(annualRent90 * RUNNING_COSTS.managementCompanyFeeRate);
    const totalExp = mgmt + repair + propTax + ins + compFee;
    const noi = annualRent90 - totalExp;

    const totalCost = price + Math.round(price * ACQUISITION_COST_RATIO);
    const netYield = ((noi / totalCost) * 100).toFixed(2);
    const yieldGap = (pt.grossYield * 100 - (noi / totalCost) * 100).toFixed(2);

    return (
        <>
            <div className="ch5-header">
                <div className="ch5-header__chapter">Chapter 5 — 不動産投資</div>
                <div className="ch5-header__title">利回り分析</div>
            </div>

            <div className="ch5-card">
                <div className="ch5-report-section__title">{pt.name}</div>

                {/* 表面 vs 実質 */}
                <div className="ch5-yield-compare">
                    <div className="ch5-yield-box">
                        <div className="ch5-yield-box__label">表面利回り（グロス）</div>
                        <div className="ch5-yield-box__value" style={{ color: 'var(--ch5-accent)' }}>{grossYield}%</div>
                    </div>
                    <div className="ch5-yield-compare__arrow">→</div>
                    <div className="ch5-yield-box">
                        <div className="ch5-yield-box__label">実質利回り（ネット）</div>
                        <div className="ch5-yield-box__value" style={{ color: 'var(--ch5-green)' }}>{netYield}%</div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.64rem', color: 'var(--ch5-red)', marginBottom: '0.3rem' }}>
                    差 {yieldGap}% が「見えないコスト」
                </div>
            </div>

            {/* 内訳 */}
            <div className="ch5-card">
                <div className="ch5-report-section__title">算出内訳</div>
                <div className="ch5-row">
                    <span className="ch5-row__label">年間家賃（稼働率90%）</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-green)' }}>¥{annualRent90.toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">− 管理費</span>
                    <span className="ch5-row__value">¥{mgmt.toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">− 修繕積立金</span>
                    <span className="ch5-row__value">¥{repair.toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">− 固定資産税</span>
                    <span className="ch5-row__value">¥{propTax.toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">− 保険</span>
                    <span className="ch5-row__value">¥{ins.toLocaleString()}</span>
                </div>
                <div className="ch5-row">
                    <span className="ch5-row__label">− 管理会社手数料(5%)</span>
                    <span className="ch5-row__value">¥{compFee.toLocaleString()}</span>
                </div>
                <div className="ch5-row" style={{ borderTop: '1px solid var(--ch5-card-border)', paddingTop: '0.2rem', fontWeight: 700 }}>
                    <span className="ch5-row__label">年間手取り（NOI）</span>
                    <span className="ch5-row__value" style={{ color: 'var(--ch5-accent)' }}>¥{noi.toLocaleString()}</span>
                </div>
                <div className="ch5-row" style={{ fontSize: '0.64rem' }}>
                    <span className="ch5-row__label">総投資額（物件+諸費用）</span>
                    <span className="ch5-row__value">¥{totalCost.toLocaleString()}</span>
                </div>
            </div>

            <div className="ch5-card">
                <div className="ch5-event__character">
                    <div className="ch5-event__character-name">💡 教訓</div>
                    <div className="ch5-event__character-text">
                        表面利回り{grossYield}%が実質{netYield}%に。{'\n'}
                        不動産広告はすべて表面利回り。{'\n'}
                        「見えないコスト」を自分で計算する力が重要。
                    </div>
                </div>
            </div>

            <button className="ch5-btn ch5-btn--primary" onClick={confirmYieldAnalysis}>
                次へ：融資の設定 →
            </button>
        </>
    );
}
