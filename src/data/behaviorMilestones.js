/**
 * 行動変化マイルストーン
 * 「数字の達成」ではなく「プレイヤーの行動の変化 = 理解の証」を検出して祝う
 * 各チャプターのResult画面で表示
 */

/**
 * @param {number} chapter
 * @param {object} state - 現在の状態
 * @param {object} weekResult - 今週の結果
 * @returns {{ id: string, icon: string, title: string, text: string } | null}
 */
export function detectBehaviorMilestone(chapter, state, weekResult) {
    if (!state || !weekResult) return null;

    const prev = state.profitHistory?.[state.profitHistory.length - 2];
    const achieved = state._behaviorMilestones || [];

    const rules = BEHAVIOR_RULES[chapter] || [];

    for (const rule of rules) {
        if (achieved.includes(rule.id)) continue;
        try {
            if (rule.check(state, weekResult, prev)) {
                return rule;
            }
        } catch {
            continue;
        }
    }
    return null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// ルール定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━

const BEHAVIOR_RULES = {
    1: [
        {
            id: 'ch1_first_breakeven',
            icon: '💡',
            title: '損益分岐点の理解',
            check: (s, r) => {
                // 初めて損益分岐点をクリアした週
                return s.turn >= 8 && r.netProfit >= 0 && s.profitHistory?.length >= 2
                    && s.profitHistory.slice(0, -1).every(p => p.profit < 0);
            },
            text: '初めて損益分岐点を超えた。\n固定費を売上でカバーできた瞬間——\nここからが経営の本当のスタート。',
        },
        {
            id: 'ch1_cost_control',
            icon: '💡',
            title: '選択と集中',
            check: (s, r, prev) => {
                return prev && s.menu.length <= 4 && r.netProfit > (prev.profit || 0) && r.netProfit > 0;
            },
            text: 'メニューを絞ったのに利益が上がった。\nロス率削減と原価率改善——「選択と集中」の力。',
        },
        {
            id: 'ch1_cost_ratio_improve',
            icon: '💡',
            title: '原価率の改善',
            check: (s, r, prev) => {
                // 原価率が前週より3%以上下がった
                return prev && (prev.costRatio || 35) - (r.costRatio || 35) >= 3 && (r.costRatio || 35) <= 30;
            },
            text: '原価率を30%以下に抑えた。\n「売上の3割以内で原料を調達する」——\n飲食業の黄金比率に到達。',
        },
        {
            id: 'ch1_price_power',
            icon: '💡',
            title: '価格決定力',
            check: (s, r) => {
                const avgPrice = r.sales / Math.max(1, r.customers);
                return avgPrice >= 500 && r.customers >= 120 && s.reputation >= 3.0;
            },
            text: '高い値段でもお客さんが来る。\n「評判」が「価格弾力性」を超えた瞬間。',
        },
        {
            id: 'ch1_staff_leverage',
            icon: '💡',
            title: '人件費のレバレッジ',
            check: (s, r, prev) => {
                // スタッフ雇用後に売上が増えて利益も改善
                return s.staff.length >= 1 && prev && r.sales > (prev.sales || 0) * 1.15 && r.netProfit > (prev.profit || 0);
            },
            text: 'スタッフを雇ったら売上が15%以上増えた。\n人件費は「コスト」でもあり「投資」でもある。',
        },
        {
            id: 'ch1_turnaround',
            icon: '💡',
            title: 'V字回復',
            check: (s, r) => {
                // 3週赤字の後に黒字
                const hist = s.profitHistory || [];
                return hist.length >= 4
                    && hist.slice(-4, -1).every(p => p.profit < 0)
                    && r.netProfit > 0;
            },
            text: '3週連続赤字からの黒字復活。\n諦めなかった。原因を探り、改善を続けた。\nこれがV字回復の本質。',
        },
    ],
    2: [
        {
            id: 'ch2_zero_inventory',
            icon: '💡',
            title: '完璧な需要予測',
            check: (s) => {
                // 全SKUの在庫が5個以下（緩和）
                return s.skus?.every(sku => sku.stock >= 0 && sku.stock <= 5) && s.skus?.length >= 3;
            },
            text: '仕入れた分をほぼ売り切った。\n「在庫＝眠っている現金」を最小化できた瞬間。',
        },
        {
            id: 'ch2_cf_positive',
            icon: '💡',
            title: 'P/LとCFの違い',
            check: (s) => {
                return s.cfStatement && s.weeklyProfit < 0 && s.cfStatement.operatingCF > 0;
            },
            text: 'P/Lは赤字なのにCFはプラス。\n「利益が出てるのにお金がない」の逆パターン。\n現金と利益は別物だと体で分かった。',
        },
        {
            id: 'ch2_high_turnover',
            icon: '💡',
            title: '回転率の威力',
            check: (s, r) => {
                const iv = s.skus?.reduce((sum, sku) => sum + sku.stock * sku.cost, 0) || 1;
                const turnover = (r.sales || 0) / Math.max(1, iv);
                return turnover >= 3.0;
            },
            text: '在庫回転率3.0超！\n少ない在庫で大きな売上を回す——\n「薄利多売」の本質がここにある。',
        },
        {
            id: 'ch2_margin_improvement',
            icon: '💡',
            title: '粗利率改善',
            check: (s, r, prev) => {
                if (!prev || !r.grossProfit || !r.sales) return false;
                const currMargin = r.grossProfit / r.sales;
                const prevMargin = (prev.grossProfit || 0) / Math.max(1, prev.sales || 1);
                return currMargin >= 0.35 && currMargin > prevMargin + 0.03;
            },
            text: '粗利率35%超、かつ前週より改善。\n仕入れの質が上がっている。\n「安く仕入れて適正に売る」——商売の基本。',
        },
    ],
    3: [
        {
            id: 'ch3_dynamic_pricing',
            icon: '💡',
            title: 'ダイナミックプライシング',
            check: (s, r) => {
                return s.dynamicPricingUnlocked && (r.revpar || 0) >= 8000 && (s.weeklyOccupancy || 0) >= 0.7;
            },
            text: '需要に応じて価格を変動させ、RevPAR¥8,000+稼働率70%超を両立。\n「同じ部屋でも値段が違う」——ホテル経営の真髄。',
        },
        {
            id: 'ch3_direct_booking',
            icon: '💡',
            title: '直販シフト',
            check: (s) => {
                return (s.directBookingRatio || 0) >= 0.3;
            },
            text: '直販比率30%達成。\nOTAに払っていた手数料が利益に変わる。\n「集客チャネルの多様化」が効き始めた。',
        },
        {
            id: 'ch3_full_house_profit',
            icon: '💡',
            title: '満室＆黒字',
            check: (s) => {
                return (s.weeklyOccupancy || 0) >= 0.95 && s.weeklyProfit > 0;
            },
            text: '満室で黒字！\n稼働率を上げるだけじゃない——\n単価とコストのバランスが取れた証拠。',
        },
    ],
    4: [
        {
            id: 'ch4_ad_independence',
            icon: '💡',
            title: '広告依存からの脱却',
            check: (s) => {
                const totalNew = (s.newFromAds || 0) + (s.organicCustomers || 0);
                return totalNew > 0 && (s.organicCustomers || 0) / totalNew >= 0.40;
            },
            text: '広告なしで40%以上が来てくれる。\nCACゼロの顧客——ブランドが自走し始めた。',
        },
        {
            id: 'ch4_repeat_power',
            icon: '💡',
            title: 'リピーターの力',
            check: (s) => {
                return (s.repeatRate || 0) >= 0.25;
            },
            text: 'リピート率25%超。\n4人に1人が戻ってくる。\n新規獲得コストの5倍安い「最強の顧客」。',
        },
        {
            id: 'ch4_ltv_cac_healthy',
            icon: '💡',
            title: 'LTV/CAC健全化',
            check: (s) => {
                return (s.ltvCacRatio || 0) >= 3.0 && s.turn >= 10;
            },
            text: 'LTV/CACが3倍以上。\n「¥1の広告費が¥3以上を生む」状態。\nSaaS業界のベンチマークと同水準。',
        },
    ],
    5: [
        {
            id: 'ch5_leverage_mastery',
            icon: '💡',
            title: 'レバレッジの本質',
            check: (s) => {
                return (s.dscr || 0) >= 1.5 && (s.netWorth || 0) >= 30000000 && s.loans?.length >= 2;
            },
            text: '2つ以上の借入を抱えながらDSCR 1.5以上を維持。\n「借りて増やし、安全に返す」——レバレッジの本質を体得した。',
        },
        {
            id: 'ch5_loss_cut',
            icon: '💡',
            title: '損切りの決断',
            check: (s) => {
                return s._soldProperty === true;
            },
            text: '物件を手放した。\n伸びない資産に執着しない——「損切り」は投資家の必須スキル。',
        },
        {
            id: 'ch5_portfolio_diversify',
            icon: '💡',
            title: 'ポートフォリオ分散',
            check: (s) => {
                return s.properties?.length >= 3 && s.properties.every(p => (p.occupancyRate || 0) >= 0.7);
            },
            text: '3物件以上、全て稼働率70%超。\n1物件の空室リスクが分散された。\n「卵を一つのカゴに盛るな」——投資の鉄則。',
        },
    ],
};

