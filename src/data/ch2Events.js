/**
 * Ch.2 小売店経営イベントデータ
 * 設計書: antigravity-ch2-detail-v3.md Section 6-8, 13-16
 */

import { getCh2Phase, getSeason } from './ch2Constants.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// ケンジアーク（Ch.2版）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const KENJI_CH2_ARC = [
    {
        stage: 1,
        turnRange: [5, 7],
        title: 'ケンジ再起 — ネットショップ宣言',
        textHigh: `ケンジから連絡。\n「カフェは失敗したけど、俺はまだ諦めてない。\n　次はネットで物販をやる。在庫も少なくて済むし。」\n——カフェの教訓から、「在庫リスクを減らす」方向へ。`,
        textLow: `ケンジから連絡。\n「カフェはまだ続けてるけどさ、副業でネット物販も始めた。\n　カフェだけじゃ不安でさ。お前は小売一本か。度胸あるな。」\n——ケンジはカフェを続けながらEC副業。`,
    },
    {
        stage: 2,
        turnRange: [28, 30],
        title: 'ケンジのEC — CF健全だが伸び悩み',
        text: `ケンジのECショップを見てみた。\n売上は少ないが、在庫も少ない。CFは健全そうだ。\n「在庫リスク低い = 利益率も低い」のジレンマに気づく。`,
    },
    {
        stage: 3,
        turnRange: [40, 42],
        title: 'ケンジの転機 — 在庫増やすか迷い',
        text: `ケンジから相談。\n「もっと売上を伸ばしたい。在庫を増やすべきか……？」\n——プレイヤーは自分の経験からアドバイスできる。`,
        choices: [
            { label: '在庫増やせ', effect: { kenjiGrowth: 'aggressive' } },
            { label: '慎重にいけ', effect: { kenjiGrowth: 'conservative' } },
        ],
    },
    {
        stage: 4,
        turnRange: [50, 52],
        title: 'ケンジの結果',
        textAggressive: `ケンジが在庫を増やした結果、一時的に売上が伸びたが、\n不良在庫を抱えてCFが悪化。\n「お前の言う通り難しいな……でも勉強になった」`,
        textConservative: `ケンジは慎重に経営を続け、少しずつ売上を伸ばしている。\n「焦らないことにした。小さく勝っていくよ」`,
    },
    {
        stage: 5,
        turnRange: [58, 60],
        title: 'ケンジの成長 — Ch.3への布石',
        text: `ケンジのECショップが軌道に乗り始めた。\n「お前と競争する気はないけど、いつかコラボしないか？」\n——Ch.3への伏線。`,
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase B 転換点イベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const TURNING_POINT_EVENTS = [
    {
        id: 'seasonal_stock',
        type: 'turning_point',
        turnRange: [20, 24],
        title: '季節商品の仕入れチャンス',
        text: `仕入先から季節限定商品の案内が来た。\n「この時期だけの商品です。まとめ買いで20%引き」\n問題は、売れ残ったらどうするか……`,
        choices: [
            {
                label: '大量仕入（100万円分）',
                effect: { money: -1000000, seasonalStock: 1000000, seasonalMargin: 0.40 },
                response: '大量に仕入れた。売り切れれば大きな利益だが……',
            },
            {
                label: '少量仕入（30万円分）',
                effect: { money: -300000, seasonalStock: 300000, seasonalMargin: 0.40 },
                response: '控えめに仕入れた。リスクは少ないが機会損失の可能性も。',
            },
            {
                label: '見送る',
                effect: {},
                response: '今回は見送った。在庫リスクを取らない判断。',
            },
        ],
    },
    {
        id: 'supplier_bankrupt',
        type: 'turning_point',
        turnRange: [27, 30],
        title: '仕入先倒産！',
        text: `主要仕入先が突然倒産した！\n掛け払いの商品代金は回収できない。\n新しい仕入先を急いで見つける必要がある。`,
        choices: [
            {
                label: '大手卸に切り替え（コスト+15%）',
                effect: { supplierCostMult: 1.15, money: -50000, supplierBankrupt: true },
                response: '大手卸に切り替えた。安定するがコスト増。',
            },
            {
                label: '複数の小規模業者に分散',
                effect: { supplierCostMult: 1.05, money: -100000, supplierBankrupt: true },
                response: '複数の業者に分散。手間はかかるがリスク分散になる。',
            },
        ],
    },
    {
        id: 'ec_proposal',
        type: 'turning_point',
        turnRange: [35, 38],
        title: 'ECサイト開設の提案',
        text: `Web制作会社から「ECサイトを作りませんか？」と提案。\n初期費用¥300,000 + 月額¥15,000\nでも売上は30%増える見込み。`,
        choices: [
            {
                label: '開設する',
                effect: { money: -300000, ecEnabled: true, ecMonthlyCost: 15000 },
                response: 'ECサイトを開設！売上チャネルが広がった。',
            },
            {
                label: '今は見送る',
                effect: {},
                response: '実店舗に集中する判断。',
            },
        ],
    },
    {
        id: 'dead_stock_crisis',
        type: 'turning_point',
        turnRange: [32, 35],
        title: '不良在庫の山',
        text: `棚卸しをしたら、売れない商品の山が見つかった。\n在庫評価額¥500,000分が"死に筋"になっている。\n処分するか、粘るか？`,
        choices: [
            {
                label: '半額セールで一掃',
                effect: { money: 250000, deadStockCleared: true, reputation: 0.1 },
                response: 'セールで一掃！CFが回復したが利益は犠牲に。',
            },
            {
                label: 'じわじわ売る（現状維持）',
                effect: { deadStockRemaining: 500000 },
                response: '在庫を持ち続ける。CFは改善しない。',
            },
            {
                label: '全額廃棄処分',
                effect: { money: -100000, deadStockCleared: true },
                response: '思い切って廃棄。損切りで次の仕入れに回す。',
            },
        ],
    },
    {
        id: 'supply_chain_crisis',
        type: 'turning_point',
        turnRange: [38, 42],
        title: 'サプライチェーン危機',
        text: `輸送コスト急騰！原油価格の高騰で全仕入れコストが+20%。\nどう価格に転嫁するか判断が必要。`,
        choices: [
            {
                label: '値上げで転嫁（+15%）',
                effect: { priceHikePct: 0.15, costHikePct: 0.20, reputation: -0.2 },
                response: '値上げした。利益率は維持したが客足が少し減った。',
            },
            {
                label: '価格維持（利益率を犠牲に）',
                effect: { costHikePct: 0.20, reputation: 0.1 },
                response: '据え置きでお客さんの信頼を守った。ただし利益は圧迫。',
            },
        ],
    },
    {
        id: 'shoplifting_incident',
        type: 'turning_point',
        turnRange: [15, 30],
        title: '万引き被害が発覚',
        text: `棚卸しで商品の数が合わない。\n調べると、どうやら万引き被害が発生していた。\n推定被害額¥50,000。\n\n対策を講じるか？`,
        choices: [
            {
                label: '防犯カメラを設置（¥150,000）',
                effect: { money: -150000, reputation: 0.1 },
                response: '防犯カメラを導入。万引きは激減した。「ロス率」の重要性を学んだ。',
            },
            {
                label: 'スタッフの目視で対応',
                effect: { reputation: 0.05 },
                response: 'スタッフの配置を変えて目視を強化。コストはかからないが、完全には防げない。',
            },
        ],
    },
    {
        id: 'rival_store_opens',
        type: 'turning_point',
        turnRange: [22, 28],
        title: '近所に競合店がオープン',
        text: `徒歩圈内に似た業態の店がオープンした。\n大手チェーンで、価格はうちより10%安い。\n\nどう差別化する？`,
        choices: [
            {
                label: '接客品質で勝負（研修費¥80,000）',
                effect: { money: -80000, reputation: 0.2 },
                response: '接客研修を実施。「大手にはない温かさ」が原動力に。常連客の離反を防いだ。',
            },
            {
                label: '品揃えを独自路線にシフト',
                effect: { money: -50000, reputation: 0.15 },
                response: '大手にはないニッチ商品を強化。「ここでしか買えない」が武器に。',
            },
            {
                label: '値下げで対抗（利益率↓）',
                effect: { money: 20000, reputation: -0.1 },
                response: '価格競争に踏み切った。客は保てたが、利益率が圧迫される。',
            },
        ],
    },
    {
        id: 'local_event_collab',
        type: 'turning_point',
        turnRange: [30, 38],
        title: '地域イベントへの出店提案',
        text: `商店街のお祭りに出店しないかと誘われた。\n出店料¥30,000だが、宣伝効果は大きい。\n\n新規客獲得のチャンス——だが準備が大変。`,
        choices: [
            {
                label: '出店する（¥30,000 + 準備コスト）',
                effect: { money: -30000, reputation: 0.25, _tempCustomerMult: 1.15 },
                response: 'お祭りに出店！地域での認知度が一気に上がった。新規客が増えた。',
            },
            {
                label: '見送る',
                effect: {},
                response: '今回は見送り。店舎の営業に集中する判断。',
            },
        ],
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// カオスイベント（確率発火）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CHAOS_EVENTS = [
    {
        id: 'customer_complaint',
        type: 'chaos',
        title: '商品不良のクレーム',
        text: `「買った商品に傷がある」とお客さんからクレームが入った。\n小売業で避けられない問題。\n対応次第で評判が変わる。`,
        choices: [
            {
                label: '全額返金 + お詫びの品（¥15,000）',
                effect: { money: -15000, reputation: 0.15 },
                response: '訠心訠意の対応にお客さん感動。「神対応」と口コミで広まった。',
            },
            {
                label: '商品交換のみ（最低限）',
                effect: { money: -3000 },
                response: '商品を交換。最低限の対応だが、お客さんの不満は残った。',
            },
        ],
    },
    {
        id: 'wholesale_offer',
        type: 'chaos',
        title: '問屋から大口取引の提案',
        text: `問屋から「大口注文をしてくれれば、単価も20%下げる」と提案が。\n単価は下がるが、在庫リスクが増える。\n「キャッシュと在庫のトレードオフ」そのもの。`,
        choices: [
            {
                label: '大口発注（¥500,000）',
                effect: { money: -500000, reputation: 0.05, _tempCustomerMult: 1.08 },
                response: '大口発注で仕入コストが下がった。ただし在庫を捘く必要がある。',
            },
            {
                label: '通常発注を続ける',
                effect: {},
                response: '無理に在庫を持たない判断。「小さく回す」戦略を貫く。',
            },
        ],
    },
    {
        id: 'seasonal_trend_advice',
        type: 'chaos',
        character: 'shou',
        title: 'ショウの季節アドバイス',
        text: `ショウさんが言った。\n「次の季節、このカテゴリが伸びるよ。\n　今のうちに仕込んでおけば先行者利益が取れる」`,
        choices: [
            {
                label: 'ショウの助言に従う（¥200,000投資）',
                effect: { money: -200000, reputation: 0.1, _tempCustomerMult: 1.10 },
                response: 'ショウの読みは当たった！先行投資が売上につながった。',
            },
            {
                label: '様子を見る',
                effect: {},
                response: '待ちの姿勢。機会損失の可能性もあるが、リスクは避けた。',
            },
        ],
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// キャラクターイベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CHARACTER_EVENTS = [
    {
        id: 'takuya_visit',
        type: 'character',
        turnRange: [8, 10],
        title: 'タクヤ来店 — 在庫の悩み',
        text: `Ch.0のタクヤが来店。\n「俺も小売始めたんだけどさ、在庫が減らなくて……」\n——仕入れの基本を教えてあげる場面。教えることで自分も学ぶ。`,
    },
    {
        id: 'misaki_sns',
        type: 'character',
        turnRange: [18, 22],
        title: 'ミサキのSNS紹介',
        text: `ミサキさんがインスタで紹介してくれた！\n「このお店の品揃え最高〜！ #お気に入り」\nフォロワー5000人の効果は……`,
        effect: { snsBoost: true, snsBoostTurns: 3, reputation: 0.2 },
    },
    {
        id: 'ryota_feedback',
        type: 'character',
        turnRange: [24, 26],
        title: 'リョウタの消費者目線',
        text: `会社員のリョウタが来店。\n「ここ、ギフトラッピングやってくれたら絶対買うのに」\n——消費者ニーズの発見。ギフト需要を取り込めるか？`,
        choices: [
            {
                label: 'ギフト包装サービス開始（¥50,000投資）',
                effect: { money: -50000, giftWrapping: true },
                response: '包装サービス導入！客単価が上がった。',
            },
            {
                label: '検討する',
                effect: {},
                response: '今は保留にした。',
            },
        ],
    },
    {
        id: 'regular_customer',
        type: 'human',
        turnRange: [15, 18],
        title: '常連客の声',
        text: `毎週来てくれる常連さんが声をかけてくれた。\n「あの商品、また入りますか？ 友達にも勧めてるんですよ」\n——リピーターの存在が安心感になる。`,
        effect: { reputation: 0.15 },
    },
    {
        id: 'tax_advisor',
        type: 'human',
        turnRange: [33, 36],
        title: '税理士からの助言',
        text: `税理士「今年の在庫評価額が大きいですね。\n年末に在庫を圧縮すれば節税になりますよ」\n——在庫と税金の関係を学ぶ。`,
        effect: { taxKnowledge: true },
    },
    {
        id: 'rival_closing',
        type: 'human',
        turnRange: [44, 48],
        title: 'ライバル店の閉店セール',
        text: `近所のライバル店が閉店。在庫を破格で買い取れるチャンス。\n「まとめて引き取ってくれたら¥200,000でいいよ」`,
        choices: [
            {
                label: '買い取る（¥200,000）',
                effect: { money: -200000, rivalStock: 400000 },
                response: '原価の半額で良質な在庫を取得！',
            },
            {
                label: '断る',
                effect: {},
                response: '在庫リスクを避ける判断。',
            },
        ],
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 確定申告イベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function createCh2TaxEvent(state) {
    const yearlyIncome = state.totalProfit;
    const blueDeduction = state.blueFilingEnabled ? 650000 : 0;
    const taxableIncome = Math.max(0, yearlyIncome - blueDeduction - 380000);

    // 累進課税
    let incomeTax = 0;
    if (taxableIncome <= 1950000) incomeTax = taxableIncome * 0.05;
    else if (taxableIncome <= 3300000) incomeTax = taxableIncome * 0.10 - 97500;
    else if (taxableIncome <= 6950000) incomeTax = taxableIncome * 0.20 - 427500;
    else incomeTax = taxableIncome * 0.23 - 636000;
    incomeTax = Math.max(0, Math.floor(incomeTax));

    const residentTax = Math.floor(taxableIncome * 0.10);
    const businessTax = yearlyIncome > 2900000
        ? Math.floor((yearlyIncome - 2900000) * 0.05) : 0;
    const healthInsurance = yearlyIncome > 0 ? Math.floor(yearlyIncome * 0.10) : 0;

    const totalTax = incomeTax + residentTax + businessTax + healthInsurance;

    return {
        yearlyIncome,
        taxableIncome,
        incomeTax,
        residentTax,
        businessTax,
        healthInsurance,
        totalTax,
        blueDeduction,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// メインイベント取得関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function getCh2EventForTurn(turn, state) {
    // ── 優先順位1: アヤ登場（固定ターン） ──
    if (turn === 1 && state.ayaFromCh1) {
        return {
            id: 'aya_carryover',
            type: 'character',
            title: 'アヤ合流',
            text: `アヤさんが前のお店から一緒に来てくれた。\n「仕入れ、私に任せてください。\n　カフェの時も食材管理してたから、在庫の勘はあります。」`,
            effect: { hire: 'part', ayaJoined: true },
        };
    }
    if (turn === 5 && !state.ayaFromCh1 && !state.ayaJoined && state.exitType !== 'liquidation') {
        return {
            id: 'aya_interview',
            type: 'character',
            title: 'アヤの面接',
            text: `面接に来たのが、以前カフェ時代に知り合ったアヤさんだった。\n「新しいお店を開いたって聞いて。手伝いたくて来ました。」`,
            choices: [
                { label: '採用する', effect: { hire: 'part', ayaJoined: true }, response: 'アヤさんを採用！仕入れの勘が頼もしい。' },
                { label: '今は見送る', effect: {}, response: '「また機会があれば」と伝えた。' },
            ],
        };
    }

    // ── 優先順位2: 確定申告（固定ターン・最優先） ──
    if ((turn === 36 || turn === 37) && !state._triggeredEvents?.includes('tax_ch2')) {
        const tax = createCh2TaxEvent(state);
        return {
            id: 'tax_ch2',
            type: 'tax',
            title: '確定申告 — 税金＋在庫のダブルパンチ',
            text: `確定申告の時期です。\n年間所得: ¥${tax.yearlyIncome.toLocaleString()}\n合計税負担: ¥${tax.totalTax.toLocaleString()}\n\n「在庫が多いと課税対象になる」ことを実感する。`,
            effect: { money: -tax.totalTax },
            taxDetail: tax,
        };
    }

    // ── 優先順位3: CF計算書初登場（固定ターン） ──
    if ((turn === 12 || turn === 13) && !state._triggeredEvents?.includes('cf_statement_intro')) {
        return {
            id: 'cf_statement_intro',
            type: 'milestone',
            title: 'CF計算書が登場！',
            text: `ショウさん「損益計算書だけじゃなく、キャッシュフロー計算書も見てくれ。」\n\n「利益が出ているのに現金が減っている」\nその理由が、在庫への投資だとわかる瞬間。`,
        };
    }

    // ── 優先順位4: ケンジアーク（stage順序制御付き） ──
    const nextKenjiStage = (state.kenjiCh2Stage || 0) + 1;
    const kenjiEvent = KENJI_CH2_ARC.find(arc =>
        arc.stage === nextKenjiStage &&
        turn >= arc.turnRange[0] && turn <= arc.turnRange[1] &&
        !state._triggeredEvents?.includes(`kenji_ch2_${arc.stage}`)
    );
    if (kenjiEvent) {
        let text = kenjiEvent.text;
        if (kenjiEvent.stage === 1) {
            text = (state.kenjiStage >= 5) ? kenjiEvent.textHigh : kenjiEvent.textLow;
        }
        if (kenjiEvent.stage === 4) {
            text = (state.kenjiGrowth === 'aggressive') ? kenjiEvent.textAggressive : kenjiEvent.textConservative;
        }
        const event = {
            id: `kenji_ch2_${kenjiEvent.stage}`,
            type: 'kenji',
            title: kenjiEvent.title,
            text,
            _kenjiCh2Stage: kenjiEvent.stage,
        };
        if (kenjiEvent.choices) event.choices = kenjiEvent.choices;
        return event;
    }

    // ── 優先順位4.5: フォースドチョイス（中盤の経営判断を強制） ──
    const forcedChoices = [
        {
            id: 'forced_clearance_sale',
            turn: 25,
            type: 'turning_point',
            title: '在庫処分セールの判断',
            text: `季節の変わり目——倉庫に入りきらない在庫がたまってきた。\n\n在庫処分セールをするか？\n「在庫は眠っている現金だ」とショウさんは言っていた。`,
            choices: [
                {
                    label: '50%オフで一斉セール（在庫圧縮、利益率↓）',
                    response: '在庫が一気に捌けた。利益率は下がったが、倉庫がスッキリ。キャッシュフローが改善した。',
                    effect: { money: 80000, reputation: -0.05 },
                },
                {
                    label: '少しずつ値下げ（在庫じわじわ減、利益率維持）',
                    response: '少しずつ値下げして回転させる。時間はかかるが、ブランドイメージは守れた。',
                    effect: { money: 25000, reputation: 0.1 },
                },
                {
                    label: '定価で売り切る（在庫リスク継続）',
                    response: '定価を貫く。在庫は残るが、利益率は維持。現金化に時間がかかるリスク。',
                    effect: { reputation: 0.15 },
                },
            ],
        },
        {
            id: 'forced_supplier_change',
            turn: 35,
            type: 'turning_point',
            title: '仕入先の変更提案',
            text: `新しい仕入先から営業が来た。\n今より15%安いが、品質は「そこそこ」。\n\n安さを取るか、品質を守るか。小売の永遠のジレンマ。`,
            choices: [
                {
                    label: '新仕入先に切り替え（コスト削減、品質リスク）',
                    response: '原価が下がった。ただ返品も少し増えた。コスト削減と品質のバランスが課題に。',
                    effect: { money: 50000, reputation: -0.1 },
                },
                {
                    label: '既存仕入先と価格交渉（コスト微減、関係維持）',
                    response: '「他社からも提案が来ている」と交渉。5%の値引きを勝ち取った。信頼関係は維持。',
                    effect: { money: 25000, reputation: 0.1 },
                },
                {
                    label: '現状維持（品質重視）',
                    response: '品質を最優先に。「安物買いの銭失い」にならない判断。',
                    effect: { reputation: 0.15 },
                },
            ],
        },
    ];
    const forcedHit = forcedChoices.find(f => turn === f.turn && !state._triggeredEvents?.includes(f.id));
    if (forcedHit) return forcedHit;

    // ── 優先順位5: 転換点イベント（重複防止付き） ──
    for (const evt of TURNING_POINT_EVENTS) {
        if (turn >= evt.turnRange[0] && turn <= evt.turnRange[1]
            && !state._triggeredEvents?.includes(evt.id)) {
            return evt;
        }
    }

    // ── 優先順位6: キャラクターイベント（重複防止付き） ──
    for (const evt of CHARACTER_EVENTS) {
        if (turn >= evt.turnRange[0] && turn <= evt.turnRange[1]
            && !state._triggeredEvents?.includes(evt.id)) {
            return evt;
        }
    }

    // ── 優先順位7: カオスイベント（10%確率） ──
    if (Math.random() < 0.10 && turn >= 10) {
        const available = CHAOS_EVENTS.filter(e => !state._triggeredEvents?.includes(e.id));
        if (available.length > 0) {
            return available[Math.floor(Math.random() * available.length)];
        }
    }

    return null;
}
