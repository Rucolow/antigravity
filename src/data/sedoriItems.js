// せどり商品プール — 設計書のサンプルを元に拡張

const ITEM_POOL = [
    { name: 'ブランド財布', cost: 3200, sellMin: 5500, sellMax: 9500, stars: 3 },
    { name: 'PS4ソフト×3', cost: 1800, sellMin: 3500, sellMax: 5200, stars: 4 },
    { name: '文庫本10冊セット', cost: 300, sellMin: 800, sellMax: 1200, stars: 5 },
    { name: 'ヴィンテージ時計', cost: 5000, sellMin: 8000, sellMax: 15000, stars: 2 },
    { name: 'スニーカー（限定）', cost: 4500, sellMin: 7000, sellMax: 12000, stars: 3 },
    { name: 'フィルムカメラ', cost: 2800, sellMin: 4500, sellMax: 8000, stars: 3 },
    { name: 'レコードプレーヤー', cost: 3500, sellMin: 5000, sellMax: 10000, stars: 2 },
    { name: 'ブランドバッグ', cost: 8000, sellMin: 12000, sellMax: 22000, stars: 2 },
    { name: 'ゲーム機本体', cost: 6000, sellMin: 9000, sellMax: 14000, stars: 3 },
    { name: 'アンティーク食器', cost: 1500, sellMin: 2500, sellMax: 5000, stars: 4 },
    { name: 'デザイナーTシャツ', cost: 1200, sellMin: 2000, sellMax: 4000, stars: 4 },
    { name: '電子辞書', cost: 800, sellMin: 1500, sellMax: 3000, stars: 5 },
    { name: 'ビンテージジーンズ', cost: 2000, sellMin: 3500, sellMax: 7000, stars: 3 },
    { name: '絶版マンガ全巻', cost: 4000, sellMin: 6000, sellMax: 11000, stars: 3 },
    { name: 'アウトドア用品', cost: 3000, sellMin: 4500, sellMax: 8500, stars: 3 },
    { name: 'キッチン家電', cost: 1500, sellMin: 2500, sellMax: 4500, stars: 4 },
    { name: 'フィギュア（箱付）', cost: 2500, sellMin: 4000, sellMax: 9000, stars: 3 },
    { name: 'ブルーレイBOX', cost: 3500, sellMin: 5500, sellMax: 9000, stars: 3 },
];

// Phase C用の高額商品プール
const HIGH_VALUE_POOL = [
    { name: 'ヴィンテージギター', cost: 12000, sellMin: 20000, sellMax: 35000, stars: 2 },
    { name: '高級オーディオ', cost: 8000, sellMin: 14000, sellMax: 25000, stars: 2 },
    { name: 'レアスニーカー（未使用）', cost: 15000, sellMin: 25000, sellMax: 42000, stars: 1 },
    { name: 'アンティーク家具', cost: 10000, sellMin: 18000, sellMax: 30000, stars: 2 },
    { name: 'ブランド時計', cost: 20000, sellMin: 30000, sellMax: 50000, stars: 1 },
    { name: 'レトロゲーム機（箱付）', cost: 7000, sellMin: 12000, sellMax: 22000, stars: 3 },
];

// Phase別の売値補正
const PHASE_MULTIPLIER = { A: 1.0, B: 1.3, C: 1.6 };

/**
 * ショップの商品を生成（ランダムに8-10品）
 * @param {string} phase - 'A' | 'B' | 'C'
 */
export function generateShopItems(phase = 'A') {
    const count = 8 + Math.floor(Math.random() * 3); // 8-10品
    const mult = PHASE_MULTIPLIER[phase] || 1.0;

    // Phase C では高額商品を2-3品混ぜる
    let pool = [...ITEM_POOL];
    if (phase === 'C') {
        const highCount = 2 + Math.floor(Math.random() * 2); // 2-3品
        const shuffledHigh = [...HIGH_VALUE_POOL].sort(() => Math.random() - 0.5);
        pool = [...pool, ...shuffledHigh.slice(0, highCount)];
    } else if (phase === 'B') {
        // Phase B では高額商品を1品混ぜる
        const shuffledHigh = [...HIGH_VALUE_POOL].sort(() => Math.random() - 0.5);
        pool = [...pool, ...shuffledHigh.slice(0, 1)];
    }

    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(item => {
        const scaledSellMin = Math.floor(item.sellMin * mult);
        const scaledSellMax = Math.floor(item.sellMax * mult);
        return {
            ...item,
            id: crypto.randomUUID(),
            actualSellPrice: scaledSellMin + Math.floor(Math.random() * (scaledSellMax - scaledSellMin)),
        };
    });
}

/**
 * リサーチモード用の価格表示（±10%精度）
 */
export function getResearchPrice(item) {
    const accuracy = 0.10;
    const min = Math.floor(item.actualSellPrice * (1 - accuracy));
    const max = Math.ceil(item.actualSellPrice * (1 + accuracy));
    return { min, max };
}

/**
 * 仕入れモード用の価格表示（±40%精度）
 */
export function getBulkPrice(item) {
    const accuracy = 0.40;
    const min = Math.floor(item.actualSellPrice * (1 - accuracy));
    const max = Math.ceil(item.actualSellPrice * (1 + accuracy));
    return { min, max };
}
