/**
 * 物件タイプ選択
 */
import React from 'react';
import { useREStore } from '../../store/realEstateEngine';
import { PROPERTY_TYPES } from '../../data/ch5Constants';

export default function PropertySelect() {
    const selectProperty = useREStore(s => s.selectProperty);
    const types = Object.values(PROPERTY_TYPES);

    return (
        <>
            <div className="ch5-header">
                <div className="ch5-header__chapter">Chapter 5 — 不動産投資</div>
                <div className="ch5-header__title">最初の投資物件を選ぼう</div>
            </div>

            <div className="ch5-card">
                <div className="ch5-story">
                    {`画面に表示されている数字。

カフェの開業費用は¥3,000,000だった。
小売の初期投資は¥5,000,000だった。
宿泊の物件取得は¥30,000,000だった。
ECの立ち上げは¥2,200,000だった。

不動産。——桁が違う。

"借金は重力だ。だが、使い方次第で推進力になる。"
ショウさんの言葉を思い出す。`}
                </div>
            </div>

            <div className="ch5-select-grid">
                {types.map(t => (
                    <div key={t.key} className="ch5-select-card" onClick={() => selectProperty(t.key)}>
                        <div className="ch5-select-card__name">{t.name}</div>
                        <div className="ch5-select-card__stats">
                            <span className="ch5-select-card__stat">¥{t.price.toLocaleString()}</span>
                            <span className="ch5-select-card__stat">利回り {(t.grossYield * 100).toFixed(1)}%</span>
                            <span className="ch5-select-card__stat">{t.totalUnits}室</span>
                            <span className="ch5-select-card__stat">家賃 ¥{t.monthlyRentPerUnit.toLocaleString()}/室</span>
                            <span className="ch5-select-card__stat">リスク: {t.risk}</span>
                        </div>
                        <div className="ch5-select-card__desc">{t.description}</div>
                    </div>
                ))}
            </div>

            <div style={{ fontSize: '0.58rem', color: 'var(--ch5-text-sub)', textAlign: 'center', marginTop: '0.4rem' }}>
                ※ いずれも自己資金20% + 融資80%（レバレッジ）
            </div>
        </>
    );
}
