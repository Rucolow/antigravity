import React, { useState, useMemo } from 'react';
import { useRetailStore } from '../../store/retailEngine';
import { INDUSTRIES } from '../../data/ch2Constants';

export default function InitialStockSetup() {
    const money = useRetailStore(s => s.money);
    const industryKey = useRetailStore(s => s.industryKey);
    const purchaseInitialStock = useRetailStore(s => s.purchaseInitialStock);
    const ind = INDUSTRIES[industryKey];

    // 6SKU分の仮SKUを生成して表示用にする
    const baseNames = {
        coffee: ['ブラジルサントス', 'エチオピアモカ', 'コロンビア', 'グアテマラ', 'マンデリン', 'ケニアAA'],
        lifestyle: ['アロマキャンドル', 'レザートート', 'オーガニックタオル', 'ステンレスタンブラー', '手帳カバー', 'ルームフレグランス'],
        food: ['オリーブオイル', '岩塩セット', 'バルサミコ酢', '有機はちみつ', 'ドライフルーツ', 'スパイスセット'],
    };
    const names = baseNames[industryKey] || baseNames.coffee;

    const previewSKUs = useMemo(() => names.map((name, i) => {
        const cost = Math.floor(ind.avgUnit * ind.costRatio * (0.85 + i * 0.06));
        const price = Math.floor(cost / ind.costRatio);
        return { id: `sku_${i}`, name, cost, price };
    }), [industryKey]);

    const [quantities, setQuantities] = useState(
        Object.fromEntries(previewSKUs.map(s => [s.id, 50]))
    );

    const totalCost = previewSKUs.reduce((sum, sku) => sum + sku.cost * (quantities[sku.id] || 0), 0);
    const setupCost = 800000; // POS + 什器
    const remaining = money - totalCost - setupCost;

    const updateQty = (id, delta) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(0, Math.min(200, (prev[id] || 0) + delta)),
        }));
    };

    return (
        <div className="ch2-setup">
            <div className="ch2-setup__header">
                <span className="ch2-setup__step">STEP 4 / 4</span>
                <h2>初期仕入を決める</h2>
                <p className="ch2-setup__subtitle">最初に何をどれだけ仕入れるか</p>
                <p className="ch2-setup__budget">資金: ¥{money.toLocaleString()}</p>
            </div>

            {previewSKUs.map(sku => (
                <div key={sku.id} className="ch2-stock-setup__item">
                    <div>
                        <div className="ch2-stock-setup__item-name">{sku.name}</div>
                        <div className="ch2-stock-setup__item-price">
                            原価 ¥{sku.cost.toLocaleString()} → 売価 ¥{sku.price.toLocaleString()}
                        </div>
                    </div>
                    <div className="ch2-stock-setup__qty">
                        <button onClick={() => updateQty(sku.id, -10)}>−</button>
                        <span>{quantities[sku.id]}</span>
                        <button onClick={() => updateQty(sku.id, 10)}>+</button>
                    </div>
                </div>
            ))}

            <div className="ch2-stock-setup__total">
                仕入額: ¥{totalCost.toLocaleString()} + 什器¥{setupCost.toLocaleString()} = ¥{(totalCost + setupCost).toLocaleString()}
            </div>
            <div className={`ch2-stock-setup__total ${remaining < 0 ? 'ch2-loss' : ''}`}>
                残金: ¥{remaining.toLocaleString()}
            </div>

            <button
                className="ch2-setup__confirm"
                onClick={() => purchaseInitialStock(quantities)}
                disabled={remaining < 0}
            >
                {remaining < 0 ? '資金不足！' : '仕入を確定して開業する →'}
            </button>

            <p className="ch2-setup__note">※ 仕入れた商品の売れ残りは「在庫リスク」になります</p>
        </div>
    );
}
