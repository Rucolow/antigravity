import React, { useState } from 'react';
import { useRetailStore } from '../../store/retailEngine';

const STATUS_LABEL = { hot: '🔥売れ筋', normal: '✅通常', slow: '⚠️低回転', dead: '💀死に筋', stockout: '🚫品切れ' };
const STATUS_CLASS = { hot: 'hot', normal: 'normal', slow: 'slow', dead: 'dead', stockout: 'stockout' };

export default function InventoryManage() {
    const state = useRetailStore(s => s);
    const restockSKU = useRetailStore(s => s.restockSKU);
    const [restockQty, setRestockQty] = useState({});

    const inventoryValue = state.skus.reduce((sum, sku) => sum + sku.stock * sku.cost, 0);

    return (
        <div className="ch2-inv-manage">
            <h2>在庫管理</h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--ch2-text-sub)', marginBottom: 12 }}>
                在庫評価額: ¥{inventoryValue.toLocaleString()} / 現金: ¥{state.money.toLocaleString()}
            </div>

            {state.skus.map(sku => {
                const qty = restockQty[sku.id] || 30;
                const unitCost = Math.floor(sku.cost * (state.supplierCostMult || 1.0));
                const totalCost = unitCost * qty;
                const canAfford = state.money >= totalCost;

                return (
                    <div key={sku.id} className="ch2-inv-manage__sku">
                        <div className="ch2-inv-manage__sku-header">
                            <span className="ch2-inv-manage__sku-name">{sku.name}</span>
                            <span className={`ch2-inventory__status ch2-inventory__status--${STATUS_CLASS[sku.status] || 'normal'}`}>
                                {STATUS_LABEL[sku.status] || '---'}
                            </span>
                        </div>
                        <div className="ch2-inv-manage__sku-info">
                            <span>在庫: {sku.stock}個</span>
                            <span>売価: ¥{sku.price.toLocaleString()}</span>
                            <span>原価: ¥{unitCost.toLocaleString()}</span>
                            <span>累計販売: {sku.totalSold}個</span>
                        </div>
                        <div className="ch2-inv-manage__restock">
                            <input
                                type="number"
                                min="1"
                                max="200"
                                value={qty}
                                onChange={(e) => setRestockQty(prev => ({ ...prev, [sku.id]: parseInt(e.target.value) || 1 }))}
                            />
                            <span style={{ fontSize: '0.68rem', color: 'var(--ch2-text-sub)' }}>
                                = ¥{totalCost.toLocaleString()}
                            </span>
                            <button
                                disabled={!canAfford}
                                onClick={() => {
                                    restockSKU(sku.id, qty);
                                    setRestockQty(prev => ({ ...prev, [sku.id]: 30 }));
                                }}
                            >
                                仕入
                            </button>
                        </div>
                        {sku.degradation > 0 && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--ch2-warn)', marginTop: 4 }}>
                                ⚠️ 劣化 {Math.round(sku.degradation * 100)}%（売価が下がります）
                            </div>
                        )}
                    </div>
                );
            })}

            <button
                className="ch2-actions__back"
                onClick={() => useRetailStore.setState({ phase: 'ch2-dashboard' })}
            >
                ← ダッシュボードに戻る
            </button>
        </div>
    );
}
