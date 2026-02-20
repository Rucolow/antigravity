/**
 * 商品カテゴリ選択画面 (Turn 1)
 */
import React from 'react';
import { useECStore } from '../../store/ecEngine';
import { PRODUCT_CATEGORIES } from '../../data/ch4Constants';

export default function ProductSelect() {
    const selectProduct = useECStore(s => s.selectProduct);
    const money = useECStore(s => s.money);

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">何をオンラインで売る？</div>
                <div className="ch4-header__phase">
                    資金: ¥{money.toLocaleString()}
                </div>
            </div>

            <div className="ch4-card">
                <p style={{ fontSize: '0.75rem', color: 'var(--ch4-text-sub)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                    画面に向かっている。<br />
                    今まで——カフェは「来店する客」の顔が見えた。<br />
                    小売も「レジの向こうに客」がいた。<br />
                    宿泊は「チェックインする客」と会えた。<br /><br />
                    ECは——客の顔が見えない。<br />
                    画面の向こうに、本当に人がいるのか？
                </p>
            </div>

            <div className="ch4-select-grid">
                {Object.entries(PRODUCT_CATEGORIES).map(([key, cat]) => (
                    <div
                        key={key}
                        className="ch4-select-card"
                        onClick={() => selectProduct(key)}
                    >
                        <div className="ch4-select-card__name">{cat.name}</div>
                        <div className="ch4-select-card__desc">{cat.desc}</div>
                        <div className="ch4-select-card__stats">
                            <span className="ch4-select-card__stat">原価率 {Math.round(cat.costRatio * 100)}%</span>
                            <span className="ch4-select-card__stat">粗利率 {Math.round(cat.grossMargin * 100)}%</span>
                            <span className="ch4-select-card__stat">リピート率 {Math.round(cat.repeatRate * 100)}%</span>
                            <span className="ch4-select-card__stat">平均単価 ¥{cat.avgPrice.toLocaleString()}</span>
                            <span className="ch4-select-card__stat">初期在庫 ¥{cat.initialInventoryCost.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
