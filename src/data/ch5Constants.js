/**
 * Ch.5 — 不動産投資 定数
 */

/* ===== 物件タイプ ===== */
export const PROPERTY_TYPES = {
    mansion_unit: {
        key: 'mansion_unit',
        name: '区分マンション（1室）',
        structure: 'rc',
        price: 20_000_000,
        totalUnits: 1,
        monthlyRentPerUnit: 100_000,
        grossYield: 0.06,
        managementDifficulty: '小',
        risk: '低',
        description: '初心者向け。管理組合あり。ただし空室=収入ゼロ',
    },
    apartment_building: {
        key: 'apartment_building',
        name: '1棟アパート（6室）',
        structure: 'wood',
        price: 60_000_000,
        totalUnits: 6,
        monthlyRentPerUnit: 75_000,
        grossYield: 0.09,
        managementDifficulty: '中',
        risk: '中',
        description: 'バランス型。空室リスク分散。不動産経営の本質を体験',
    },
    mansion_building: {
        key: 'mansion_building',
        name: '1棟マンション（12室）',
        structure: 'rc',
        price: 150_000_000,
        totalUnits: 12,
        monthlyRentPerUnit: 92_000,
        grossYield: 0.088,
        managementDifficulty: '大',
        risk: '高',
        description: 'ハイリスク・ハイリターン。成功すればCh.5最速クリア',
    },
};

/* ===== 構造別 耐用年数 ===== */
export const USEFUL_LIFE = {
    wood: 22,
    light_steel: 27,
    heavy_steel: 34,
    rc: 47,
};

/* ===== 金利 ===== */
export const INTEREST_RATES = {
    variable: { key: 'variable', name: '変動金利', rate: 0.020, description: '返済額が安い。金利上昇リスクあり' },
    fixed: { key: 'fixed', name: '固定金利', rate: 0.028, description: '返済額が一定。金利上昇リスクなし' },
};

/* ===== 返済期間 ===== */
export const LOAN_TERMS = [
    { years: 20, label: '20年', description: '月返済額が高い。総利息は少ない' },
    { years: 25, label: '25年', description: 'バランス型' },
    { years: 30, label: '30年', description: '月返済額が安い。総利息は多い。CFに余裕' },
];

/* ===== 自己資金比率 ===== */
export const DOWN_PAYMENT_RATIO = 0.20;

/* ===== 諸費用率 ===== */
export const ACQUISITION_COST_RATIO = 0.07; // 登録免許税+取得税+仲介手数料等

/* ===== 運営コスト（月額。物件価格に対する年率換算） ===== */
export const RUNNING_COSTS = {
    managementFeeRate: 0.004,      // 管理費（年間 物件価格の0.4%）
    repairReserveRate: 0.003,      // 修繕積立金（年間 物件価格の0.3%）
    propertyTaxRate: 0.0058,     // 固定資産税（年間 物件価格の0.58%）
    insuranceRate: 0.0013,     // 保険（年間 物件価格の0.13%）
    managementCompanyFeeRate: 0.05, // 管理会社手数料（家賃の5%）
};

/* ===== テナント ===== */
export const TENANT = {
    contractMonths: { min: 12, max: 36 },
    exitRateOnExpiry: 0.30,       // 契約満了時の退去確率
    midTermExitRate: 0.02,       // ターンあたりの途中退去確率
    vacancyTurns: { min: 2, max: 4 }, // 空室期間
    restorationCost: { min: 100_000, max: 300_000 },
    recruitmentFee: 50_000,       // 仲介手数料
    ltvSkillBonus: 0.15,          // Ch.4 LTV最適化スキルによる退去率減
};

/* ===== 家賃補正 ===== */
export const RENT_ADJUSTMENTS = {
    ageDecayPerYear: 0.008,       // 1年あたりの家賃下落率
    renovationBoost: 0.10,        // リノベ後の家賃上昇率
    renovationCostPerUnit: 800_000,
    subleasGuaranteeRate: 0.85,   // サブリース保証率
};

/* ===== 減価償却 ===== */
export const DEPRECIATION = {
    landRatio: {
        wood: 0.33,       // 土地比率33%（建物67%が減価償却対象）
        light_steel: 0.30,
        heavy_steel: 0.30,
        rc: 0.35,
    },
    // 耐用年数は USEFUL_LIFE にて定義
    // 年間減価償却費 = buildingValue / usefulLife
};

/* ===== 法人税 ===== */
export const CORPORATE_TAX_RATE = 0.30;

/* ===== Phase判定 ===== */
export function getCh5Phase(turn) {
    if (turn <= 28) return 'A';
    if (turn <= 60) return 'B';
    return 'C';
}

/* ===== 月表示 ===== */
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
export function getCh5Month(turn) {
    return MONTH_NAMES[(turn - 1) % 12];
}
export function getCh5Year(turn) {
    return Math.floor((turn - 1) / 12) + 1;
}

/* ===== ゲームクリア ===== */
export const NET_WORTH_TARGET = 100_000_000;

/* ===== 追加物件候補（Phase B以降） ===== */
export const SECOND_PROPERTIES = {
    rc_used: {
        key: 'rc_used',
        name: 'RC中古マンション（8室）',
        structure: 'rc',
        price: 80_000_000,
        totalUnits: 8,
        monthlyRentPerUnit: 88_000,
        grossYield: 0.075,
        netYield: 0.052,
        remainingUsefulLife: 30,
        age: 17,
        description: '安定型。融資が付きやすい',
    },
    wood_old: {
        key: 'wood_old',
        name: '木造アパート（4室・築古高利回り）',
        structure: 'wood',
        price: 25_000_000,
        totalUnits: 4,
        monthlyRentPerUnit: 62_500,
        grossYield: 0.12,
        netYield: 0.085,
        remainingUsefulLife: 6,
        age: 16,
        description: '⚠ 減価償却残り6年。その後税負担急増',
    },
    new_mansion: {
        key: 'new_mansion',
        name: '新築区分マンション（1室）',
        structure: 'rc',
        price: 35_000_000,
        totalUnits: 1,
        monthlyRentPerUnit: 131_000,
        grossYield: 0.045,
        netYield: 0.030,
        remainingUsefulLife: 47,
        age: 0,
        description: '新築プレミアムで資産価値安定。ただしCFが薄い',
    },
};

/* ===== 計算ヘルパー ===== */

/** 元利均等の月返済額 */
export function calcMonthlyPayment(principal, annualRate, termYears) {
    const r = annualRate / 12;
    const n = termYears * 12;
    if (r === 0) return Math.round(principal / n);
    return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
}

/** DSCR = 年間NOI ÷ 年間ローン返済 */
export function calcDSCR(annualNOI, annualLoanPayment) {
    if (annualLoanPayment <= 0) return 99;
    return Math.round((annualNOI / annualLoanPayment) * 100) / 100;
}

/** 表面利回り */
export function calcGrossYield(annualRent, price) {
    return Math.round((annualRent / price) * 1000) / 1000;
}

/** 実質利回り */
export function calcNetYield(annualRent, annualExpenses, totalCost) {
    return Math.round(((annualRent - annualExpenses) / totalCost) * 1000) / 1000;
}

/** 年間NOI */
export function calcAnnualNOI(property) {
    const annualRent = property.monthlyRentPerUnit * property.totalUnits * (property.occupancyRate || 0.9) * 12;
    const mgmt = property.purchasePrice * RUNNING_COSTS.managementFeeRate;
    const repair = property.purchasePrice * RUNNING_COSTS.repairReserveRate;
    const tax = property.purchasePrice * RUNNING_COSTS.propertyTaxRate;
    const ins = property.purchasePrice * RUNNING_COSTS.insuranceRate;
    const companyFee = annualRent * RUNNING_COSTS.managementCompanyFeeRate;
    return Math.round(annualRent - mgmt - repair - tax - ins - companyFee);
}

/** 時価（収益還元法） */
export function calcCurrentValue(annualNOI, age) {
    // キャップレートは築年数で上昇（古い=リスク高=キャップ高=安い）
    const capRate = 0.055 + age * 0.001;
    return Math.round(annualNOI / capRate);
}

/** ローン残高（n ヶ月後） */
export function calcLoanBalance(principal, annualRate, termYears, monthsElapsed) {
    const r = annualRate / 12;
    const n = termYears * 12;
    if (r === 0) return Math.max(0, principal - Math.round(principal / n) * monthsElapsed);
    const factor = Math.pow(1 + r, monthsElapsed);
    const totalFactor = Math.pow(1 + r, n);
    const balance = principal * (totalFactor - factor) / (totalFactor - 1);
    return Math.max(0, Math.round(balance));
}

/** 年間減価償却費 */
export function calcAnnualDepreciation(buildingValue, remainingUsefulLife) {
    if (remainingUsefulLife <= 0) return 0;
    return Math.round(buildingValue / remainingUsefulLife);
}

/** 売却益・税金 */
export function calcSaleResult(property, loan) {
    const salePrice = property.currentValue;
    const bookValue = property.purchasePrice - property.accDepreciation;
    const saleProfit = salePrice - bookValue;
    const brokerageFee = Math.round(salePrice * 0.033);
    const tax = saleProfit > 0 ? Math.round(saleProfit * CORPORATE_TAX_RATE) : 0;
    const loanBalance = loan ? loan.balance : 0;
    const netProceeds = salePrice - loanBalance - tax - brokerageFee;
    return { salePrice, bookValue, saleProfit, tax, brokerageFee, loanBalance, netProceeds };
}

/** LTV比率 */
export function calcLTV(totalLiabilities, totalAssets) {
    if (totalAssets <= 0) return 0;
    return Math.round((totalLiabilities / totalAssets) * 100);
}

/** 融資可能判定 */
export function canGetLoan(ltvRatio) {
    return ltvRatio < 80;
}

/** 金利優遇（融資実績で微減） */
export function getPreferredRate(baseRate, loanCount) {
    const discount = Math.min(loanCount * 0.001, 0.003); // 最大0.3%優遇
    return Math.round((baseRate - discount) * 10000) / 10000;
}
