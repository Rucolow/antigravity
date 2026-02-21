/**
 * 各チャプターの「攻めのゴール」定義
 * Ch.0 の ¥300,000 目標と同様に、各章にプレイヤーを駆動する明確な達成目標を設定
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.1 カフェ: 月間黒字を3回達成
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH1_GOAL = {
    id: 'ch1_consecutive_black',
    title: '月間黒字を3回達成せよ',
    narrative: 'ショウが言った。「3回黒字を出せたら、2号店の話をしよう」',
    target: 3,
    unit: '回',
    icon: '☕',
    // 判定: state.weekResult.netProfit >= 0 のカウント
    check: (state) => {
        return (state._goalBlackWeeks || 0) >= 3;
    },
    progress: (state) => ({
        current: Math.min(state._goalBlackWeeks || 0, 3),
        target: 3,
        label: `${Math.min(state._goalBlackWeeks || 0, 3)} / 3 回`,
    }),
    // confirmWeek後に呼ばれる更新関数
    update: (state, weekResult) => {
        if (weekResult.netProfit >= 0) {
            return { _goalBlackWeeks: (state._goalBlackWeeks || 0) + 1 };
        }
        return {};
    },
    reward: '評判 +0.3 & 「連続黒字経営」スキル獲得',
    rewardEffect: { reputation: 0.3 },
    completionText: '3回の黒字——偶然じゃない。\nコスト構造を理解し、損益分岐点を超え続けた証。\nショウは静かに頷いた。「2号店、本気で考えよう」',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.2 小売: 在庫回転率2.0以上を4週維持
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH2_GOAL = {
    id: 'ch2_inventory_turnover',
    title: '在庫回転率2.0以上を4週維持',
    narrative: '問屋の条件: 「回転率2.0を維持できたら掛け取引を認める」',
    target: 4,
    unit: '週',
    icon: '📦',
    check: (state) => (state._goalTurnoverWeeks || 0) >= 4,
    progress: (state) => ({
        current: Math.min(state._goalTurnoverWeeks || 0, 4),
        target: 4,
        label: `${Math.min(state._goalTurnoverWeeks || 0, 4)} / 4 週`,
    }),
    update: (state, weekResult) => {
        const turnover = weekResult.inventoryTurnover || (weekResult.sales / Math.max(1, state.inventoryValue || 1));
        if (turnover >= 2.0) {
            return { _goalTurnoverWeeks: (state._goalTurnoverWeeks || 0) + 1 };
        }
        return { _goalTurnoverWeeks: Math.max(0, (state._goalTurnoverWeeks || 0) - 1) }; // 維持失敗でリセット
    },
    reward: '仕入コスト -5% & 「在庫管理マスター」スキル獲得',
    rewardEffect: { money: 100000 },
    completionText: '4週連続で回転率2.0以上。\n「在庫＝眠っている現金」をコントロールできた証拠。\n問屋が掛け取引を認めた。信用が資産になった瞬間。',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.3 宿泊: RevPAR ¥8,000以上を4週連続
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH3_GOAL = {
    id: 'ch3_revpar',
    title: 'RevPAR ¥8,000以上を4週連続',
    narrative: '星付きホテル認定の審査基準。達成すればOTA上位表示の権利を得る',
    target: 4,
    unit: '週',
    icon: '🏨',
    check: (state) => (state._goalRevparWeeks || 0) >= 4,
    progress: (state) => ({
        current: Math.min(state._goalRevparWeeks || 0, 4),
        target: 4,
        label: `${Math.min(state._goalRevparWeeks || 0, 4)} / 4 週`,
    }),
    update: (state, weekResult) => {
        const revpar = weekResult.revpar || 0;
        if (revpar >= 8000) {
            return { _goalRevparWeeks: (state._goalRevparWeeks || 0) + 1 };
        }
        return { _goalRevparWeeks: 0 }; // 連続判定なのでリセット
    },
    reward: 'OTA上位表示 (来客+20%) & 「RevPARマスター」スキル獲得',
    rewardEffect: { reputation: 0.3, _tempCustomerMult: 1.20 },
    completionText: 'RevPAR ¥8,000を4週連続でクリア。\n「単価を上げれば客が減る」——その恐怖を乗り越え、\n単価×稼働率の最適解を見つけた。星付き認定、おめでとう。',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.4 EC: オーガニック比率40%以上
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH4_GOAL = {
    id: 'ch4_organic',
    title: 'オーガニック比率40%以上を達成',
    narrative: 'アヤの挑戦状:「広告なしでも客が来るブランドを作れ」',
    target: 40,
    unit: '%',
    icon: '🌱',
    check: (state) => (state._goalOrganicAchieved || false),
    progress: (state) => {
        const ratio = Math.round((state.organicRatio || 0) * 100);
        return {
            current: Math.min(ratio, 40),
            target: 40,
            label: `${ratio}% / 40%`,
        };
    },
    update: (state, weekResult) => {
        const totalNew = (weekResult.newFromAds || 0) + (weekResult.organicCustomers || 0);
        const organicRatio = totalNew > 0 ? (weekResult.organicCustomers || 0) / totalNew : 0;
        if (organicRatio >= 0.40) {
            return { _goalOrganicAchieved: true };
        }
        return {};
    },
    reward: '評判 +0.3 & 「ブランドビルダー」スキル獲得',
    rewardEffect: { reputation: 0.3 },
    completionText: '広告なしで40%以上のお客さんが来てくれる。\nCACゼロの顧客——これがブランドの本当の資産。\nアヤは笑った。「大手にも負けないブランドだね」',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Ch.5 不動産: DSCR1.3維持かつ純資産5000万
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const CH5_GOAL = {
    id: 'ch5_portfolio_cf',
    title: '3物件以上でCF月100万を達成',
    narrative: '最終試験: 分散投資でキャッシュフローの安定成長を証明せよ',
    target: 1000000,
    unit: '円/月',
    icon: '🏢',
    check: (state) => {
        const props = state.properties || [];
        const monthlyCF = state.monthlyCashFlow || 0;
        return props.length >= 3 && monthlyCF >= 1000000;
    },
    progress: (state) => {
        const props = state.properties || [];
        const monthlyCF = Math.max(0, state.monthlyCashFlow || 0);
        const cfPct = Math.min(100, Math.round((monthlyCF / 1000000) * 100));
        return {
            current: cfPct,
            target: 100,
            label: `CF ¥${(monthlyCF / 10000).toFixed(0)}万/月 (${props.length}物件)${props.length >= 3 ? ' ✅' : ' ⚠️3物件必要'}`,
        };
    },
    update: () => ({}),
    reward: '「不動産ポートフォリオ経営者」スキル & エンディング特別演出',
    rewardEffect: {},
    completionText: '3つ以上の物件から毎月100万円のキャッシュフロー。\n1物件に依存しない——分散投資の力。\n自分が働かなくても、資産が毎月稼いでくれる。\nこれが「お金に働いてもらう」ということ。',
};

export const CHAPTER_GOALS = {
    1: CH1_GOAL,
    2: CH2_GOAL,
    3: CH3_GOAL,
    4: CH4_GOAL,
    5: CH5_GOAL,
};
