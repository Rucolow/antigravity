// バランス定数 — Ch.0 設計書 v3 準拠

export const TARGET_MONEY = 300000;
export const TOTAL_DAYS = 7;

// バイト日給
export const BAITO = {
  cafe: { name: 'カフェホール', dailyPay: 8800, maxDays: 6, bonus: 'コーヒー品質+1' },
  convenience: { name: 'コンビニ（深夜）', dailyPay: 10000, maxDays: 5, bonus: '深夜営業解放' },
  moving: { name: '引越し', dailyPay: 12000, maxDays: 3, bonus: '内装工事費−20%' },
};

// 生活費（ベース）
export const WEEKLY_EXPENSES_BASE = 25750; // 月額¥103,000 ÷ 4
// 後方互換
export const WEEKLY_EXPENSES = WEEKLY_EXPENSES_BASE;

// 生活費削減オプション
export const COST_REDUCTIONS = {
  cooking: {
    name: '自炊',
    weeklyReduction: 3750,     // 食費 ¥40,000→¥25,000/月 = 週¥3,750節約
    efficiencyPenalty: 0.05,    // 全活動−5%
  },
  sharehouse: {
    name: 'シェアハウス',
    weeklyReduction: 3750,     // 家賃 ¥45,000→¥30,000/月 = 週¥3,750節約
    initialCost: 50000,         // 引越し費用
    sedoriBulkMaxOverride: 3,   // 仕入れ重視: 5品→3品
  },
  cheapSim: {
    name: '格安SIM',
    weeklyReduction: 750,      // 通信費 ¥5,000→¥2,000/月 = 週¥750節約
    moneyThreshold: 300000,    // ¥300K超で提案
  },
};

// フリマ
export const FURIMA = {
  initialStock: 20,
  sellPerTurn: { min: 1, max: 3 },
  pricePerItem: { min: 1500, max: 4500 },
};

// せどり
export const SEDORI = {
  unlockTurn: 3,
  maxDaysPerWeek: 4,
  research: { maxItems: 2, priceAccuracy: 0.10, defectRate: 0.01 },
  bulk: { maxItems: 5, priceAccuracy: 0.40, defectRate: 0.03 },
  sellRate: 0.90,
  unsoldDiscount: 0.15,
  // Phase別利益レンジ (per item の売値補正)
  profitPerDay: {
    A: { research: { min: 4000, max: 7000 }, bulk: { min: 6000, max: 12000 } },
    B: { research: { min: 6000, max: 9000 }, bulk: { min: 10000, max: 16000 } },
    C: { research: { min: 8000, max: 12000 }, bulk: { min: 14000, max: 22000 } },
  },
};

// マルシェ（Phase別利益レンジ）
export const MARCHE = {
  unlockTurn: 5,
  daysRequired: 2,
  scales: {
    small: {
      name: '小規模', cost: 8000, profitRange: {
        A: { min: 5000, max: 12000 },
        B: { min: 7000, max: 16000 },
        C: { min: 9000, max: 20000 },
      }
    },
    medium: {
      name: '中規模', cost: 15000, profitRange: {
        A: { min: 8000, max: 22000 },
        B: { min: 12000, max: 28000 },
        C: { min: 16000, max: 35000 },
      }
    },
    large: {
      name: '大規模', cost: 27000, profitRange: {
        A: { min: 10000, max: 35000 },
        B: { min: 18000, max: 42000 },
        C: { min: 25000, max: 55000 },
      }
    },
  },
  weatherPenalty: 0.4,
  rainChance: 0.15,
  loyaltyBonusMin: 0.20,         // 常連客による売上下限+20%
  loyaltyWeatherReduction: 0.55, // 雨補正 0.4→0.55
};

// Phase定義（v3: 18ターン制）
export const PHASES = {
  A: { start: 1, end: 6, name: 'Phase A', label: '導入 — バイト＋せどり入門' },
  B: { start: 7, end: 12, name: 'Phase B', label: '転機 — 副業本格化' },
  C: { start: 13, end: 20, name: 'Phase C', label: '加速 — チャネル最適化' },
};

// Phase判定ヘルパー
export function getPhase(turn) {
  if (turn <= PHASES.A.end) return 'A';
  if (turn <= PHASES.B.end) return 'B';
  return 'C';
}
