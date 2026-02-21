import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    BAITO, WEEKLY_EXPENSES_BASE, FURIMA, SEDORI, MARCHE, TARGET_MONEY,
    COST_REDUCTIONS, getPhase,
} from '../data/constants.js';
import { getEventForTurn } from '../data/events.js';
import { generateShopItems } from '../data/sedoriItems.js';

function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

export const useGameStore = create(
    persist(
        (set, get) => ({
            // ── ゲーム状態 ──
            chapter: 0,            // 0 = Ch.0, 1 = Ch.1, ...
            phase: 'opening',      // opening | baito-select | event | event-result | allocation | sedori | marche | results | ending | report
            turn: 0,
            money: 0,
            targetMoney: TARGET_MONEY,

            // バイト
            baitoType: null,
            baitoDailyPay: 0,
            baitoMaxDays: 0,
            baitoDaysWorked: 0,       // 累計バイト日数（スキル判定用）

            // 日数配分
            allocation: { baito: 0, sedori: 0, marche: false, rest: 0 },

            // 週結果
            weekResult: null,
            prevWeekResult: null,

            // フリマ
            furima: { remaining: FURIMA.initialStock, totalSold: 0 },

            // 解放状態
            sedoriUnlocked: false,
            marcheUnlocked: false,

            // せどり
            shopItems: [],
            sedoriMode: null,     // 'research' | 'bulk'
            sedoriFirstTime: true,
            selectedItems: [],
            sedoriItemsBought: 0,     // 累計仕入品数（スキル判定用）

            // マルシェ
            marcheScale: null,
            marcheSessions: 0,         // 累計出店回数
            marcheHasLoyalty: false,   // 常連客ボーナス
            marcheCostMultiplier: 1.0, // 値上げラッシュ時 1.2

            // イベント
            currentEvent: null,
            eventChoiceResult: null,

            // 出会ったキャラクター
            metCharacters: [],

            // 体力
            stamina: 100,

            // ボーナス
            nextWeekBonus: 0,
            baitoPayOverride: null,
            baitoMaxDaysOverride: null,

            // 生活費削減フラグ
            hasCooking: false,
            hasSharehouse: false,
            hasCheapSim: false,

            // 転機イベント
            rivalRelation: 'none',  // 'none' | 'compete' | 'cooperate'
            shopQualityMod: 1.0,    // ライバル出現で低下

            // 共同仕入れ
            jointPurchaseAvailable: false,
            jointPurchaseInvested: false,
            jointPurchaseReturnTurn: null,

            // 判断記録（エンディング振り返り用）
            decisions: [],

            // ショウ出資（Ch.0エンディングで選択）
            shouInvestment: 0,

            // 融資（Ch.0エンディングの面談で決定）
            fusionAmount: 0,
            fusionRate: 0,
            fusionYears: 0,
            fusionScore: 0,

            // ── ヘルパー ──
            getCurrentPhase: () => getPhase(get().turn),

            getWeeklyExpenses: () => {
                const s = get();
                let expenses = WEEKLY_EXPENSES_BASE;
                if (s.hasCooking) expenses -= COST_REDUCTIONS.cooking.weeklyReduction;
                if (s.hasSharehouse) expenses -= COST_REDUCTIONS.sharehouse.weeklyReduction;
                if (s.hasCheapSim) expenses -= COST_REDUCTIONS.cheapSim.weeklyReduction;
                return expenses;
            },

            getEfficiencyMult: () => {
                const s = get();
                return s.hasCooking ? (1 - COST_REDUCTIONS.cooking.efficiencyPenalty) : 1.0;
            },

            // ── アクション ──

            startGame: () => set({ phase: 'baito-select' }),

            selectBaito: (type) => {
                const baito = BAITO[type];
                const nextState = {
                    baitoType: type,
                    baitoDailyPay: baito.dailyPay,
                    baitoMaxDays: baito.maxDays,
                    turn: 1,
                };
                set(nextState);
                const state = get();
                const event = getEventForTurn(1, state);
                if (event) {
                    let processedEvent = event;
                    if (event.variants) {
                        const variant = event.variants[type];
                        processedEvent = { ...event, text: variant.text, variantEffect: variant.effect };
                    }
                    set({ currentEvent: processedEvent, phase: 'event' });
                } else {
                    set({ phase: 'allocation' });
                }
            },

            // ダッシュボードから「次へ」
            proceedFromDashboard: () => {
                const state = get();
                const event = getEventForTurn(state.turn, state);
                if (event) {
                    let processedEvent = event;
                    if (event.variants) {
                        const variant = event.variants[state.baitoType];
                        processedEvent = { ...event, text: variant.text, variantEffect: variant.effect };
                    }
                    set({ currentEvent: processedEvent, phase: 'event' });
                } else {
                    set({ phase: 'allocation' });
                }
            },

            // イベントを閉じる
            dismissEvent: (choiceIndex) => {
                const state = get();
                const event = state.currentEvent;
                let updates = {};

                // エフェクト適用
                if (event.effect) {
                    if (event.effect.sedoriUnlocked) updates.sedoriUnlocked = true;
                    if (event.effect.marcheUnlocked) updates.marcheUnlocked = true;
                    if (event.effect.hasCooking) {
                        updates.hasCooking = true;
                        updates.decisions = [...state.decisions, { turn: state.turn, type: 'cooking', label: '自炊開始' }];
                    }
                    if (event.effect.hasSharehouse) {
                        updates.hasSharehouse = true;
                        updates.money = (updates.money ?? state.money) - COST_REDUCTIONS.sharehouse.initialCost;
                        updates.decisions = [...(updates.decisions || state.decisions), { turn: state.turn, type: 'sharehouse', label: 'シェアハウス引越し' }];
                    }
                    if (event.effect.hasCheapSim) {
                        updates.hasCheapSim = true;
                        updates.decisions = [...(updates.decisions || state.decisions), { turn: state.turn, type: 'cheapSim', label: '格安SIM' }];
                    }
                    if (event.effect.marcheHasLoyalty) {
                        updates.marcheHasLoyalty = true;
                    }
                    if (event.effect.marcheCostMultiplier) {
                        updates.marcheCostMultiplier = event.effect.marcheCostMultiplier;
                    }
                    if (event.effect.money) {
                        updates.money = (updates.money ?? state.money) + event.effect.money;
                    }
                }

                // キャラクター記録
                if (event.character && !state.metCharacters.includes(event.character)) {
                    updates.metCharacters = [...state.metCharacters, event.character];
                }

                // バリアントエフェクト（バイト先異変など）
                if (event.variantEffect) {
                    if (event.variantEffect.baitoPayOverride) {
                        updates.baitoDailyPay = event.variantEffect.baitoPayOverride;
                        updates.baitoPayOverride = event.variantEffect.baitoPayOverride;
                    }
                    if (event.variantEffect.baitoMaxDaysOverride) {
                        updates.baitoMaxDays = event.variantEffect.baitoMaxDaysOverride;
                        updates.baitoMaxDaysOverride = event.variantEffect.baitoMaxDaysOverride;
                    }
                }

                // 選択肢あり
                if (event.choices && choiceIndex !== undefined) {
                    const choice = event.choices[choiceIndex];
                    if (choice.effect) {
                        if (choice.effect.money) updates.money = (updates.money ?? state.money) + choice.effect.money;
                        if (choice.effect.nextWeekBonus) updates.nextWeekBonus = choice.effect.nextWeekBonus;
                        if (choice.effect.hasCooking) {
                            updates.hasCooking = true;
                            updates.decisions = [...(updates.decisions || state.decisions), { turn: state.turn, type: 'cooking', label: '自炊開始' }];
                        }
                        if (choice.effect.hasSharehouse) {
                            updates.hasSharehouse = true;
                            updates.money = (updates.money ?? state.money) - COST_REDUCTIONS.sharehouse.initialCost;
                            updates.decisions = [...(updates.decisions || state.decisions), { turn: state.turn, type: 'sharehouse', label: 'シェアハウス引越し' }];
                        }
                        if (choice.effect.hasCheapSim) {
                            updates.hasCheapSim = true;
                            updates.decisions = [...(updates.decisions || state.decisions), { turn: state.turn, type: 'cheapSim', label: '格安SIM' }];
                        }
                        if (choice.effect.rivalRelation) {
                            updates.rivalRelation = choice.effect.rivalRelation;
                            if (choice.effect.rivalRelation === 'compete') {
                                updates.shopQualityMod = 0.7; // 高利益品の出現確率-30%
                            }
                        }
                        if (choice.effect.marcheCostMultiplier) {
                            updates.marcheCostMultiplier = choice.effect.marcheCostMultiplier;
                        }
                        if (choice.effect.jointPurchaseInvested) {
                            updates.jointPurchaseInvested = true;
                            updates.money = (updates.money ?? state.money) - 50000;
                            updates.jointPurchaseReturnTurn = state.turn + 2;
                            updates.decisions = [...(updates.decisions || state.decisions), { turn: state.turn, type: 'joint', label: '共同仕入れに投資' }];
                        }
                    }
                    updates.eventChoiceResult = choice.response;
                    set({ ...updates, phase: 'event-result' });
                    return;
                }

                set({ ...updates, currentEvent: null, phase: 'allocation' });
            },

            dismissEventResult: () => {
                set({ currentEvent: null, eventChoiceResult: null, phase: 'allocation' });
            },

            // 日数配分を確定
            confirmAllocation: (allocation) => {
                const state = get();
                set({ allocation });

                // せどり日があればせどりショップへ
                if (allocation.sedori > 0 && state.sedoriUnlocked) {
                    const currentPhase = getPhase(state.turn);
                    const items = generateShopItems(currentPhase);
                    set({ shopItems: items, phase: 'sedori' });
                } else if (allocation.marche && state.marcheUnlocked) {
                    set({ phase: 'marche' });
                } else {
                    get().calculateResults();
                }
            },

            // せどりモード選択
            selectSedoriMode: (mode) => set({ sedoriMode: mode, selectedItems: [], sedoriFirstTime: false }),

            // せどり商品選択
            toggleSedoriItem: (itemId) => {
                const state = get();
                const maxItems = state.sedoriMode === 'research' ? SEDORI.research.maxItems : SEDORI.bulk.maxItems;
                // シェアハウスの場合、仕入れ重視は3品に制限
                const actualMax = (state.sedoriMode === 'bulk' && state.hasSharehouse)
                    ? COST_REDUCTIONS.sharehouse.sedoriBulkMaxOverride
                    : maxItems;
                const totalMax = actualMax * state.allocation.sedori;

                let selected = [...state.selectedItems];
                if (selected.includes(itemId)) {
                    selected = selected.filter(id => id !== itemId);
                } else if (selected.length < totalMax) {
                    selected.push(itemId);
                }
                set({ selectedItems: selected });
            },

            // せどり確定
            confirmSedori: () => {
                const state = get();
                if (state.allocation.marche && state.marcheUnlocked) {
                    set({ phase: 'marche' });
                } else {
                    get().calculateResults();
                }
            },

            // マルシェ規模選択
            selectMarcheScale: (scale) => {
                set({ marcheScale: scale });
                get().calculateResults();
            },

            // ── 結果計算 ──
            calculateResults: () => {
                const state = get();
                const currentPhase = getPhase(state.turn);
                const efficiencyMult = state.getEfficiencyMult();

                // ── 体力計算 ──
                const baitoDrain = state.allocation.baito * 5;
                const sedoriDrain = state.allocation.sedori * 7;
                const marcheDrain = state.allocation.marche ? 15 : 0;
                const restRecover = state.allocation.rest * 15;
                const staminaDelta = restRecover - baitoDrain - sedoriDrain - marcheDrain;
                const newStamina = Math.max(0, Math.min(100, state.stamina + staminaDelta));

                const collapsed = newStamina <= 0;

                // 体力パフォーマンス係数
                const staminaMultiplier = newStamina >= 80 ? 1.05
                    : newStamina >= 60 ? 1.0
                        : newStamina >= 30 ? 0.85
                            : 0.75;
                const bonus = (1 + state.nextWeekBonus) * staminaMultiplier * efficiencyMult;

                // バイト
                const baitoIncome = state.allocation.baito * state.baitoDailyPay;

                // フリマ（パッシブ自動収入）
                let furimaIncome = 0;
                let furimaSold = 0;
                let furimaRemaining = state.furima.remaining;
                if (furimaRemaining > 0) {
                    const sold = Math.min(rand(FURIMA.sellPerTurn.min, FURIMA.sellPerTurn.max), furimaRemaining);
                    furimaIncome = sold * rand(FURIMA.pricePerItem.min, FURIMA.pricePerItem.max);
                    furimaRemaining -= sold;
                    furimaSold = sold;
                }

                // せどり
                let sedoriIncome = 0;
                let sedoriCost = 0;
                if (state.allocation.sedori > 0 && state.sedoriUnlocked) {
                    const selectedItemObjects = state.shopItems.filter(i => state.selectedItems.includes(i.id));
                    sedoriCost = selectedItemObjects.reduce((sum, item) => sum + item.cost, 0);

                    selectedItemObjects.forEach(item => {
                        const defectRate = state.sedoriMode === 'research' ? SEDORI.research.defectRate : SEDORI.bulk.defectRate;
                        if (Math.random() < defectRate) {
                            return;
                        }
                        if (Math.random() < SEDORI.sellRate) {
                            sedoriIncome += item.actualSellPrice;
                        } else {
                            sedoriIncome += Math.floor(item.actualSellPrice * (1 - SEDORI.unsoldDiscount));
                        }
                    });
                }
                const sedoriProfit = sedoriIncome - sedoriCost;

                // マルシェ
                let marcheIncome = 0;
                let marcheCost = 0;
                let marcheRain = false;
                if (state.allocation.marche && state.marcheUnlocked && state.marcheScale) {
                    const scale = MARCHE.scales[state.marcheScale];
                    marcheCost = Math.floor(scale.cost * state.marcheCostMultiplier);
                    const isRain = Math.random() < MARCHE.rainChance;
                    marcheRain = isRain;
                    const weatherMult = isRain
                        ? (state.marcheHasLoyalty ? MARCHE.loyaltyWeatherReduction : MARCHE.weatherPenalty)
                        : 1;
                    const profitRange = scale.profitRange[currentPhase] || scale.profitRange.A;
                    let baseProfit = rand(profitRange.min, profitRange.max);
                    // 常連客ボーナス: 下限+20%
                    if (state.marcheHasLoyalty) {
                        const loyaltyMin = Math.floor(profitRange.min * (1 + MARCHE.loyaltyBonusMin));
                        baseProfit = Math.max(baseProfit, loyaltyMin);
                    }
                    marcheIncome = Math.floor(baseProfit * weatherMult * bonus + marcheCost);
                }
                const marcheProfit = marcheIncome - marcheCost;

                // 共同仕入れリターン
                let jointReturn = 0;
                let jointPurchaseFailed = false;
                if (state.jointPurchaseInvested && state.jointPurchaseReturnTurn === state.turn) {
                    if (Math.random() < 0.10) {
                        // 10% 失敗 — 投資額は既に引かれている
                        jointReturn = 0;
                        jointPurchaseFailed = true;
                    } else {
                        jointReturn = rand(80000, 130000);
                    }
                }

                // 生活費
                const expenses = state.getWeeklyExpenses();

                // 合計
                const totalIncome = Math.floor((baitoIncome + furimaIncome + sedoriProfit + marcheProfit) * bonus)
                    - expenses + jointReturn;

                // 累計更新値
                const newSedoriItemsBought = state.sedoriItemsBought + state.selectedItems.length;
                const newFurimaTotalSold = state.furima.totalSold + furimaSold;
                const newBaitoDaysWorked = state.baitoDaysWorked + state.allocation.baito;
                const newMarcheSessions = state.marcheSessions + (state.allocation.marche ? 1 : 0);
                const newMoney = Math.max(0, state.money + totalIncome);

                const weekResult = {
                    baito: baitoIncome,
                    furima: furimaIncome,
                    furimaSold,
                    furimaRemaining,
                    sedoriIncome,
                    sedoriCost,
                    sedoriProfit,
                    marcheIncome,
                    marcheCost,
                    marcheProfit,
                    marcheRain,
                    expenses,
                    total: totalIncome,
                    bonus: state.nextWeekBonus,
                    staminaChange: staminaDelta,
                    staminaMultiplier,
                    collapsed,
                    jointReturn,
                    jointPurchaseFailed,
                    efficiencyMult,
                };

                set({
                    prevWeekResult: state.weekResult,
                    weekResult,
                    money: newMoney,
                    furima: { remaining: furimaRemaining, totalSold: newFurimaTotalSold },
                    stamina: newStamina,
                    phase: 'results',
                    nextWeekBonus: 0,
                    sedoriItemsBought: newSedoriItemsBought,
                    baitoDaysWorked: newBaitoDaysWorked,
                    marcheSessions: newMarcheSessions,
                    // 共同仕入れクリーンアップ
                    ...(state.jointPurchaseInvested && state.jointPurchaseReturnTurn === state.turn
                        ? { jointPurchaseInvested: false, jointPurchaseReturnTurn: null }
                        : {}),
                });
            },

            // 次のターンへ
            nextTurn: () => {
                const state = get();
                const nextTurn = state.turn + 1;

                // ¥300,000到達チェック
                if (state.money >= TARGET_MONEY) {
                    set({ phase: 'ending' });
                    return;
                }

                // 倒壊チェック: 前ターンで体力0なら強制全休
                if (state.stamina <= 0) {
                    const recoveredStamina = 60;
                    const expenses = state.getWeeklyExpenses();
                    set({
                        turn: nextTurn,
                        allocation: { baito: 0, sedori: 0, marche: false, rest: 7 },
                        weekResult: {
                            baito: 0, furima: 0, furimaSold: 0, furimaRemaining: state.furima.remaining,
                            sedoriIncome: 0, sedoriCost: 0, sedoriProfit: 0,
                            marcheIncome: 0, marcheCost: 0, marcheProfit: 0, marcheRain: false,
                            expenses,
                            total: -expenses,
                            bonus: 0,
                            staminaChange: recoveredStamina,
                            staminaMultiplier: 1,
                            collapsed: false,
                            forcedRest: true,
                            jointReturn: 0,
                            efficiencyMult: 1,
                        },
                        money: Math.max(0, state.money - expenses),
                        stamina: recoveredStamina,
                        shopItems: [],
                        sedoriMode: null,
                        selectedItems: [],
                        marcheScale: null,
                        currentEvent: null,
                        eventChoiceResult: null,
                        phase: 'results',
                    });
                    return;
                }

                // 通常のターン進行
                set({
                    turn: nextTurn,
                    allocation: { baito: 0, sedori: 0, marche: false, rest: 0 },
                    shopItems: [],
                    sedoriMode: null,
                    selectedItems: [],
                    marcheScale: null,
                    currentEvent: null,
                    eventChoiceResult: null,
                });
                const newState = get();
                const event = getEventForTurn(nextTurn, newState);
                if (event) {
                    let processedEvent = event;
                    if (event.variants) {
                        const variant = event.variants[newState.baitoType];
                        processedEvent = { ...event, text: variant.text, variantEffect: variant.effect };
                    }
                    set({ currentEvent: processedEvent, phase: 'event' });
                } else {
                    set({ phase: 'allocation' });
                }
            },

            // エンディングから振り返りレポートへ
            goToReport: () => set({ phase: 'report' }),

            selectShouInvestment: (amount) => {
                const s = get();
                const labels = { 1000000: '¥100万', 2000000: '¥200万', 3000000: '¥300万' };
                set({
                    shouInvestment: amount,
                    decisions: [...s.decisions, { turn: s.turn, label: `ショウの出資: ${labels[amount] || amount}` }],
                });
            },

            setFusionResult: (score) => {
                const s = get();
                let amount, rate, years;
                if (score >= 7) {
                    amount = 2000000; rate = 1.5; years = 7;
                } else if (score >= 4) {
                    amount = 1500000; rate = 2.0; years = 5;
                } else {
                    amount = 1000000; rate = 2.5; years = 5;
                }
                set({
                    fusionAmount: amount,
                    fusionRate: rate,
                    fusionYears: years,
                    fusionScore: score,
                    decisions: [...s.decisions, { turn: s.turn, label: `融資: ¥${(amount / 10000).toFixed(0)}万（${rate}%・${years}年）` }],
                });
            },
        }),
        { name: 'antigravity-ch0' }
    )
);
