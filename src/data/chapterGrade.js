/**
 * チャプター成績ランク計算
 * 各チャプターの結果から S/A/B/C/D ランクを算出
 */

/**
 * スコアからランクを返す (0-100)
 */
function toGrade(score) {
    if (score >= 90) return 'S';
    if (score >= 75) return 'A';
    if (score >= 55) return 'B';
    if (score >= 35) return 'C';
    return 'D';
}

/** 0-1 にクランプするユーティリティ */
function norm(value, min, max) {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Ch.0 ランク: 資金効率・スキル・スピード
 */
export function gradeCh0({ money, turn, skillCount }) {
    const moneyScore = norm(money, 250000, 400000) * 40;       // 貯金額 (max40)
    const speedScore = norm(30 - turn, 0, 15) * 30;            // 短期達成 (max30)
    const skillScore = norm(skillCount, 0, 6) * 30;            // スキル数 (max30)
    const total = Math.round(moneyScore + speedScore + skillScore);
    return {
        grade: toGrade(total),
        score: total,
        details: [
            { label: '資金効率', stars: Math.min(5, Math.round(moneyScore / 8)) },
            { label: 'スピード', stars: Math.min(5, Math.round(speedScore / 6)) },
            { label: 'スキル数', stars: Math.min(5, Math.round(skillScore / 6)) },
        ],
    };
}

/**
 * Ch.1 ランク: ROI・利益率・評判・スキル
 */
export function gradeCh1({ money, initialInvestment, profitRate, reputation, skillCount }) {
    const roi = initialInvestment > 0 ? (money - initialInvestment) / initialInvestment : 0;
    const roiScore = norm(roi, -0.5, 2.0) * 30;
    const profitScore = norm(profitRate, -10, 25) * 25;
    const repScore = norm(reputation, 1, 5) * 20;
    const skillScore = norm(skillCount, 0, 6) * 25;
    const total = Math.round(roiScore + profitScore + repScore + skillScore);
    return {
        grade: toGrade(total),
        score: total,
        details: [
            { label: '投資効率', stars: Math.min(5, Math.round(roiScore / 6)) },
            { label: '利益率', stars: Math.min(5, Math.round(profitScore / 5)) },
            { label: '評判', stars: Math.min(5, Math.round(repScore / 4)) },
            { label: 'スキル', stars: Math.min(5, Math.round(skillScore / 5)) },
        ],
    };
}

/**
 * Ch.2 ランク: 資金・在庫回転・スキル
 */
export function gradeCh2({ money, exitAmount, skillCount, turn }) {
    const wealthScore = norm(money, 1000000, 10000000) * 35;
    const exitScore = norm(exitAmount, 500000, 8000000) * 30;
    const speedScore = norm(60 - turn, 0, 30) * 10;
    const skillScore = norm(skillCount, 0, 6) * 25;
    const total = Math.round(wealthScore + exitScore + speedScore + skillScore);
    return {
        grade: toGrade(total),
        score: total,
        details: [
            { label: '資金力', stars: Math.min(5, Math.round(wealthScore / 7)) },
            { label: 'EXIT価値', stars: Math.min(5, Math.round(exitScore / 6)) },
            { label: 'スキル', stars: Math.min(5, Math.round(skillScore / 5)) },
        ],
    };
}

/**
 * Ch.3 ランク: 稼働率・RevPAR・資金・スキル
 */
export function gradeCh3({ avgOcc, avgRevPAR, money, skillCount }) {
    const occScore = norm(avgOcc, 30, 90) * 30;
    const revparScore = norm(avgRevPAR, 3000, 12000) * 25;
    const wealthScore = norm(money, 5000000, 40000000) * 20;
    const skillScore = norm(skillCount, 0, 9) * 25;
    const total = Math.round(occScore + revparScore + wealthScore + skillScore);
    return {
        grade: toGrade(total),
        score: total,
        details: [
            { label: '稼働率', stars: Math.min(5, Math.round(occScore / 6)) },
            { label: 'RevPAR', stars: Math.min(5, Math.round(revparScore / 5)) },
            { label: '資金力', stars: Math.min(5, Math.round(wealthScore / 4)) },
            { label: 'スキル', stars: Math.min(5, Math.round(skillScore / 5)) },
        ],
    };
}

/**
 * Ch.4 ランク: LTV/CAC・オーガニック比率・資金・スキル
 */
export function gradeCh4({ ltvCacRatio, organicRatio, money, skillCount }) {
    const ltvCacScore = norm(ltvCacRatio, 1, 5) * 30;
    const organicScore = norm(organicRatio, 0.1, 0.7) * 25;
    const wealthScore = norm(money, 10000000, 80000000) * 20;
    const skillScore = norm(skillCount, 0, 8) * 25;
    const total = Math.round(ltvCacScore + organicScore + wealthScore + skillScore);
    return {
        grade: toGrade(total),
        score: total,
        details: [
            { label: 'LTV/CAC', stars: Math.min(5, Math.round(ltvCacScore / 6)) },
            { label: '自走力', stars: Math.min(5, Math.round(organicScore / 5)) },
            { label: '資金力', stars: Math.min(5, Math.round(wealthScore / 4)) },
            { label: 'スキル', stars: Math.min(5, Math.round(skillScore / 5)) },
        ],
    };
}

/**
 * Ch.5 ランク: 純資産・CF・DSCR平均・スキル
 */
export function gradeCh5({ netWorth, avgCashFlow, avgDSCR, skillCount, gameClear }) {
    const nwScore = norm(netWorth, 0, 200000000) * 30;
    const cfScore = norm(avgCashFlow, -100000, 1500000) * 25;
    const dscrScore = norm(avgDSCR, 0.8, 2.0) * 20;
    const skillScore = norm(skillCount, 0, 8) * 25;
    const bonus = gameClear ? 5 : 0;
    const total = Math.min(100, Math.round(nwScore + cfScore + dscrScore + skillScore + bonus));
    return {
        grade: toGrade(total),
        score: total,
        details: [
            { label: '純資産', stars: Math.min(5, Math.round(nwScore / 6)) },
            { label: 'CF安定性', stars: Math.min(5, Math.round(cfScore / 5)) },
            { label: '返済余力', stars: Math.min(5, Math.round(dscrScore / 4)) },
            { label: 'スキル', stars: Math.min(5, Math.round(skillScore / 5)) },
        ],
    };
}

/**
 * ランク表示用のカラー取得
 */
export function gradeColor(grade) {
    return {
        S: '#ffd700', A: '#34d399', B: '#60a5fa',
        C: '#f59e0b', D: '#ef4444',
    }[grade] || '#888';
}
