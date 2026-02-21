import { useGameStore } from '../store/gameEngine';
import { getResearchPrice, getBulkPrice } from '../data/sedoriItems';

export default function SedoriShop() {
    const {
        shopItems, sedoriMode, selectedItems, allocation, sedoriFirstTime,
        selectSedoriMode, toggleSedoriItem, confirmSedori,
    } = useGameStore();

    const maxItems = sedoriMode === 'research' ? 2 * allocation.sedori : 5 * allocation.sedori;

    if (!sedoriMode) {
        return (
            <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 16 }}>
                <p className="section-header">せどり — {allocation.sedori}日</p>
                <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>リサイクルショップ到着！</h2>
                <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: sedoriFirstTime ? 12 : 32 }}>
                    お宝は眠ってるかな？ どう攻める？
                </p>

                {/* 初回ガイド */}
                {sedoriFirstTime && (
                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(40,104,216,0.08)',
                        border: '1px solid var(--blue)',
                        fontSize: '0.78rem',
                        color: 'var(--blue)',
                        lineHeight: 1.6,
                        marginBottom: 16,
                    }}>
                        💡 <strong>初めてのせどり！</strong><br />
                        最初は「リサーチ派」がおすすめ。<br />
                        売値が読みやすいから、損しにくいよ！
                    </div>
                )}

                <div
                    className="card"
                    style={{
                        marginBottom: 12,
                        ...(sedoriFirstTime ? { border: '2px solid var(--emerald)', position: 'relative' } : {}),
                    }}
                    onClick={() => selectSedoriMode('research')}
                >
                    {sedoriFirstTime && (
                        <div style={{
                            position: 'absolute', top: -10, right: 12,
                            background: 'var(--emerald)', color: '#fff',
                            fontSize: '0.65rem', fontWeight: 700,
                            padding: '2px 8px',
                        }}>
                            おすすめ
                        </div>
                    )}
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>じっくりリサーチ派</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                        少数精鋭で確実に利益を狙う！
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        店内から最大{2 * allocation.sedori}品を選べる / 売値精度◎ / ハズレ率1%
                    </div>
                </div>

                <div className="card" onClick={() => selectSedoriMode('bulk')}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>直感で大量仕入れ派</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                        たくさん仕入れて当たりを引け！
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        店内から最大{5 * allocation.sedori}品を選べる / 売値は読みにくい / ハズレ率3%
                    </div>
                </div>
            </div>
        );
    }

    const getPrice = sedoriMode === 'research' ? getResearchPrice : getBulkPrice;

    return (
        <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 32 }}>
            <p className="section-header">
                {sedoriMode === 'research' ? 'リサーチモード' : '大量仕入れモード'}
            </p>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 4 }}>どれを仕入れる？</h2>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
                {shopItems.length}品中 {selectedItems.length}品選択（最大{maxItems}品）
                {selectedItems.length === 0 && ' — タップで選ぼう！'}
            </p>

            <div style={{ maxHeight: '55vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 24 }}>
                {shopItems.map(item => {
                    const price = getPrice(item);
                    const isSelected = selectedItems.includes(item.id);
                    const stars = '★'.repeat(item.stars) + '☆'.repeat(5 - item.stars);

                    return (
                        <div
                            key={item.id}
                            className={`sedori__item ${isSelected ? 'sedori__item--selected' : ''}`}
                            onClick={() => toggleSedoriItem(item.id)}
                        >
                            <div style={{ flex: 1 }}>
                                <div className="sedori__item-name">{item.name}</div>
                                {sedoriMode === 'research' && (
                                    <div className="sedori__stars">{stars}</div>
                                )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="sedori__item-cost">仕入 ¥{item.cost.toLocaleString()}</div>
                                <div className="sedori__item-sell">
                                    売値 ¥{price.min.toLocaleString()}〜¥{price.max.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="btn btn-primary" onClick={confirmSedori}>
                {selectedItems.length > 0 ? `${selectedItems.length}品を仕入れる！` : 'スキップ'}
            </button>
        </div>
    );
}
