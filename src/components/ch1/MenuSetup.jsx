import React, { useState } from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import { MENU_ITEMS, MENU_COUNT_EFFECTS } from '../../data/ch1Constants';

export default function MenuSetup() {
    const setMenu = useCafeStore(s => s.setMenu);
    const [selected, setSelected] = useState({}); // { id: price }

    const drinks = MENU_ITEMS.filter(m => m.category === 'drink');
    const foods = MENU_ITEMS.filter(m => m.category === 'food');

    const selectedCount = Object.keys(selected).length;
    const selectedDrinks = drinks.filter(d => d.id in selected).length;
    const selectedFoods = foods.filter(f => f.id in selected).length;

    const canConfirm = selectedCount >= 3 && selectedCount <= 6 && selectedDrinks >= 2;

    const toggle = (item) => {
        setSelected(prev => {
            if (prev[item.id] !== undefined) {
                const next = { ...prev };
                delete next[item.id];
                return next;
            }
            if (Object.keys(prev).length >= 6) return prev;
            if (item.category === 'food' && foods.filter(f => f.id in prev).length >= 3) return prev;
            return { ...prev, [item.id]: item.defaultPrice };
        });
    };

    const setPrice = (id, price) => {
        setSelected(prev => ({ ...prev, [id]: price }));
    };

    const effect = MENU_COUNT_EFFECTS[Math.min(6, Math.max(3, selectedCount))];

    // 平均原価率
    const avgCostRatio = selectedCount > 0
        ? Object.entries(selected).reduce((sum, [id, price]) => {
            const item = MENU_ITEMS.find(m => m.id === id);
            return sum + (item ? item.cost / price : 0);
        }, 0) / selectedCount
        : 0;

    return (
        <div className="ch1-setup">
            <div className="ch1-setup__header">
                <span className="ch1-setup__step">STEP 3 / 4</span>
                <h2>メニューを決めよう</h2>
                <p className="ch1-setup__subtitle">3〜6品を選択（ドリンク最低2品）</p>
            </div>

            <h3 className="ch1-section-title">ドリンク（必須・最低2品）</h3>
            <div className="ch1-menu-grid">
                {drinks.map(item => {
                    const isSelected = item.id in selected;
                    const costRatio = isSelected
                        ? Math.round((item.cost / selected[item.id]) * 100)
                        : Math.round((item.cost / item.defaultPrice) * 100);
                    return (
                        <div key={item.id} className={`ch1-menu-item ${isSelected ? 'ch1-menu-item--on' : ''}`}>
                            <div className="ch1-menu-item__top" onClick={() => toggle(item)}>
                                <span className="ch1-menu-item__name">{item.name}</span>
                                <span className="ch1-menu-item__cost">原価 ¥{item.cost}</span>
                            </div>
                            {isSelected && (
                                <div className="ch1-menu-item__price-row">
                                    <label>売価</label>
                                    <div className="ch1-menu-item__price-ctrl">
                                        <button onClick={() => setPrice(item.id, Math.max(item.cost + 50, selected[item.id] - 50))}>−</button>
                                        <span>¥{selected[item.id]}</span>
                                        <button onClick={() => setPrice(item.id, selected[item.id] + 50)}>+</button>
                                    </div>
                                    <span className={`ch1-menu-item__ratio ${costRatio > 35 ? 'ch1-warn' : ''}`}>
                                        原価率{costRatio}%
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <h3 className="ch1-section-title">フード（任意・最大3品）</h3>
            <div className="ch1-menu-grid">
                {foods.map(item => {
                    const isSelected = item.id in selected;
                    const costRatio = isSelected
                        ? Math.round((item.cost / selected[item.id]) * 100)
                        : Math.round((item.cost / item.defaultPrice) * 100);
                    return (
                        <div key={item.id} className={`ch1-menu-item ${isSelected ? 'ch1-menu-item--on' : ''}`}>
                            <div className="ch1-menu-item__top" onClick={() => toggle(item)}>
                                <span className="ch1-menu-item__name">{item.name}</span>
                                <span className="ch1-menu-item__cost">原価 ¥{item.cost} / 調理{item.prepTime}分</span>
                            </div>
                            {isSelected && (
                                <div className="ch1-menu-item__price-row">
                                    <label>売価</label>
                                    <div className="ch1-menu-item__price-ctrl">
                                        <button onClick={() => setPrice(item.id, Math.max(item.cost + 50, selected[item.id] - 50))}>−</button>
                                        <span>¥{selected[item.id]}</span>
                                        <button onClick={() => setPrice(item.id, selected[item.id] + 50)}>+</button>
                                    </div>
                                    <span className={`ch1-menu-item__ratio ${costRatio > 35 ? 'ch1-warn' : ''}`}>
                                        原価率{costRatio}%
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedCount >= 3 && effect && (
                <div className="ch1-menu-summary">
                    <div>{selectedCount}品選択</div>
                    <div>ロス率: {Math.round(effect.lossRate * 100)}%</div>
                    <div>オペ効率: {effect.opsEfficiency > 1 ? '+' : ''}{Math.round((effect.opsEfficiency - 1) * 100)}%</div>
                    <div>平均原価率: <strong className={avgCostRatio > 0.35 ? 'ch1-warn' : ''}>{Math.round(avgCostRatio * 100)}%</strong></div>
                </div>
            )}

            {canConfirm ? (
                <button
                    className="ch1-setup__confirm"
                    onClick={() => {
                        const items = Object.entries(selected).map(([id, price]) => ({ id, price }));
                        setMenu(items);
                    }}
                >
                    このメニューで開業 →
                </button>
            ) : (
                <p className="ch1-setup__note">
                    {selectedDrinks < 2 ? 'ドリンクを最低2品選んでください' :
                        selectedCount < 3 ? 'あと少なくとも1品選んでください' :
                            'メニューを6品以内にしてください'}
                </p>
            )}
        </div>
    );
}
