/**
 * Ch.3 宿泊業イベントデータ
 * 設計書: antigravity-ch3-detail-v3.md Section 8-9, 14-19
 */

import { getCh3Phase } from './ch3Constants.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// ケンジ民泊アーク（5段階）
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const KENJI_CH3_ARC = [
    {
        stage: 1,
        turnRange: [3, 5],
        title: 'ケンジ民泊開始',
        text: `ケンジが民泊を始めたらしい。\n「Airbnbで部屋貸してる。初期投資？ 家具はIKEAで¥30,000。以上。\n　お前の¥30,000,000と比べてみ？」\n——鍵の受け渡しで初日のゲストを30分待たせて★2。`,
    },
    {
        stage: 2,
        turnRange: [14, 18],
        title: 'ケンジの運営地獄',
        text: `ケンジ「シーツの洗濯が地獄。週3回コインランドリー通ってる。\n清掃も自分。チェックアウト後にダッシュで掃除。\n髪の毛1本残ってたら★3。厳しすぎん？\n……お前は清掃スタッフいるのか。いいな。」`,
    },
    {
        stage: 3,
        turnRange: [25, 30],
        title: 'ケンジ法律の壁',
        text: `ケンジ「ヤバい。消防署から連絡来た。\n旅館業許可取ってないのバレた。\n罰則あるの？ マジで？\nお前、許可取ってるの？ ……当たり前か。\nあの¥30,000,000、許可と法律含んでの金額だったのか……」`,
    },
    {
        stage: 4,
        turnRange: [38, 44],
        title: 'ケンジの方向転換',
        text: `ケンジ「民泊の営業日数制限が厳しくなった。\n年間180日しか貸せない。残り半年は空室。\n空室なのに家賃は払ってる。\n……お前が言ってた"消える在庫"、これか。\n旅館業許可取ろうかな……」`,
    },
    {
        stage: 5,
        turnRange: [52, 60],
        title: 'ケンジの学び',
        text: `ケンジ「結局、許可取った。消防設備入れて¥800,000。\n最初からやっときゃよかった。\n……お前には言いたくないけど、お前が正しかった。\nコストは"出費"じゃない。"保険"なんだな。」`,
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase B 転換点イベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const TURNING_POINT_EVENTS = [
    {
        id: 'off_season_crisis',
        type: 'turning_point',
        turnRange: [20, 28],
        condition: (state) => {
            const monthIdx = Math.floor((state.turn - 1) / 4) % 12;
            return [0, 1, 5].includes(monthIdx); // 1月/2月/6月
        },
        title: '閑散期の崩壊',
        text: `稼働率が急落。空室だらけ。\n部屋は空いていても、ローンは止まらない。光熱費も、スタッフの給料も。\n「持っている」こと自体がコストになる。`,
        character: 'ショウ',
        characterText: '空室は翌日に持ち越せない。お前はいま、誰もいない部屋の家賃を払っている。',
        choices: [
            {
                label: '大幅値下げ（ADR-40%）',
                effect: { priceOverride: 0.6, reputation: -0.1 },
                response: 'ADRを大幅に下げた。稼働率は回復するか……',
            },
            {
                label: 'OTA特別プラン掲載',
                effect: { otaBoost: 3, money: -50000 },
                response: 'OTAに特別プランを掲載。手数料+3%で露出UP。',
            },
            {
                label: '耐える（現金で凌ぐ）',
                effect: {},
                response: '春を待つ。現金が持つかどうかの勝負。',
            },
        ],
    },
    {
        id: 'bad_review',
        type: 'turning_point',
        turnRange: [24, 36],
        title: '悪い口コミの拡散',
        text: `OTAサイトに★1のレビューが投稿された。\n「清掃が行き届いていない。髪の毛が落ちていた。」\n予約率が15%下がった。`,
        choices: [
            {
                label: '丁寧に返信 + 清掃強化',
                effect: { reputation: -0.1, money: -50000 },
                response: '丁寧な返信と清掃品質強化。評判は2ターンで回復見込み。',
            },
            {
                label: '値下げで新規レビュー獲得',
                effect: { priceOverride: 0.85, reputation: -0.2 },
                response: 'ADRを下げて新規客を呼び、★5レビューで上書きを狙う。',
            },
            {
                label: '無視する',
                effect: { reputation: -0.4 },
                response: '放置した。評判の回復に時間がかかりそうだ……',
            },
        ],
    },
    {
        id: 'competitor_hotel',
        type: 'turning_point',
        turnRange: [30, 42],
        title: '近隣ホテルの開業',
        text: `近くに新しいホテルがオープンする。\n客室20室。設備は新しく、価格はあなたより10%安い。\n稼働率-15%の影響が見込まれる。`,
        choices: [
            {
                label: '体験プランで差別化',
                effect: { money: -30000, reputation: 0.2, occupancyBonus: 0.05 },
                response: '地元ガイド付きツアー等の体験プランを開始。差別化に成功。',
            },
            {
                label: '価格対抗（ADR-15%）',
                effect: { priceOverride: 0.85 },
                response: '価格を対抗値に。利益率は下がるが客は確保。',
            },
            {
                label: '品質向上（アメニティ強化）',
                effect: { money: -80000, reputation: 0.3 },
                response: 'アメニティを最高級に。口コミスコアが上がった。',
            },
        ],
    },
    {
        id: 'inbound_boom',
        type: 'turning_point',
        turnRange: [34, 46],
        condition: (state) => state.propertyKey === 'tourist',
        title: 'インバウンド急増',
        text: `円安の影響で外国人観光客が急増している。\nインバウンド対応を強化すれば、稼働率+20%が見込める。`,
        choices: [
            {
                label: '多言語対応を導入',
                effect: { money: -100000, inboundBoost: true, occupancyBonus: 0.15 },
                response: '英語サイト + 翻訳ツールを導入。インバウンド客が増加！',
            },
            {
                label: '体験コンテンツ追加',
                effect: { money: -200000, reputation: 0.3, occupancyBonus: 0.10 },
                response: '茶道体験・日本料理教室を開始。外国人に大人気！',
            },
            {
                label: '様子を見る',
                effect: {},
                response: 'チャンスを見送った。他の宿泊施設がインバウンド需要を取り込んでいく……',
            },
        ],
    },
    {
        id: 'ota_algorithm_change',
        type: 'turning_point',
        turnRange: [36, 46],
        required: true,   // 必須イベント
        title: '【構造破壊】OTAアルゴリズム変更',
        text: `OTAからの予約が急減。先週比-40%。\nOTAが検索アルゴリズムを変更していた。\n「コミッション率」と「特典有無」が重視される新アルゴ。\nOTAにもっと手数料を払う施設が優先される。`,
        character: 'ショウ',
        characterText: 'これがOTA依存の本質だ。お前の客は「お前の客」じゃない。OTAの客だ。',
        choices: [
            {
                label: '自社予約サイトを構築する（推奨）',
                effect: { money: -300000, selfBookingSite: true },
                response: '構築費¥300,000。運用開始まで2ターン。直販シフトの第一歩。',
            },
            {
                label: 'OTA手数料率を上げて順位回復',
                effect: { otaCommissionUp: 0.05 },
                response: '手数料率15%→20%。稼働率は回復するが、利益は薄くなる。',
            },
            {
                label: 'SNS・リピーター戦略に全振り',
                effect: { snsBoost: true, reputation: 0.2 },
                response: 'リピーターへの直予約10%OFFメール + SNS攻勢。即効性あり。',
            },
        ],
    },
    {
        id: 'major_repair',
        type: 'turning_point',
        turnRange: [52, 64],
        title: '設備の大規模修繕',
        text: `建物の外壁にひび割れが見つかった。\n放置すると雨漏りのリスクがある。\n修繕費¥2,000,000。`,
        choices: [
            {
                label: '全面修繕（¥2,000,000）',
                effect: { money: -2000000, reputation: 0.2, repairDone: true },
                response: '全面修繕完了。5年は安心。営業しながら実施。',
            },
            {
                label: '部分修繕（¥600,000）',
                effect: { money: -600000, repairPartial: true },
                response: '部分修繕。2年は持つが、再発リスク30%。',
            },
            {
                label: '先送り',
                effect: { repairDeferred: true },
                response: '先送り。雨漏り発生確率10%/ターン。発生したら¥3,000,000+休業。',
            },
        ],
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// キャラクターイベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CHARACTER_EVENTS = [
    {
        id: 'aya_frontdesk',
        type: 'character',
        turnRange: [1, 3],
        condition: (state) => state.ayaFromCh2,
        title: 'アヤ、フロントに立つ',
        text: `アヤさんが「今度はお客さんの笑顔を直接見られる。接客、私がやります。」\nカフェ→小売→宿泊。アヤの接客スキルが口コミ評価に貢献。`,
        effect: { reputation: 0.2, ayaJoined: true },
    },
    {
        id: 'misaki_insta',
        type: 'character',
        turnRange: [8, 12],
        title: 'ミサキの宣伝',
        text: `ミサキさんが泊まりに来てくれた。\n「ここ、めっちゃいいじゃん。インスタに載せるね。」\n→ フォロワー5000人の拡散効果！`,
        effect: { snsBoost: true, snsBoostTurns: 3, reputation: 0.3 },
    },
    {
        id: 'ryota_stay',
        type: 'character',
        turnRange: [22, 28],
        title: 'リョウタの宿泊体験',
        text: `リョウタからLINE：「今度の連休、彼女とそっち行くから泊めてよ。」\n\n宿泊後の感想：\n「アメニティのシャンプーの香りが安っぽい。タオルが薄い。Wi-Fiが部屋によって切れる。」\n「朝食があったら★+1だった。」\n\nOTAレビューには書かないこと＝友達だから言えること。これが"本当の声"。`,
        choices: [
            {
                label: 'アメニティを改善する',
                effect: { money: -30000, reputation: 0.2 },
                response: 'シャンプー・タオル・Wi-Fiを改善。地味だが口コミ評価に効く。',
            },
            {
                label: '朝食提供を開始する',
                effect: { money: -50000, breakfastEnabled: true, reputation: 0.15 },
                response: '朝食提供開始！ 客単価UP + 顧客満足度向上。',
            },
            {
                label: '参考にする（今は保留）',
                effect: {},
                response: 'リョウタの意見をメモした。いつか対応しよう……',
            },
        ],
    },
    {
        id: 'shou_tax_warning',
        type: 'character',
        turnRange: [24, 30],
        title: 'ショウさんの消費税アドバイス',
        text: `ショウさん：「売上1,000万超えたら消費税の課税事業者になる。\n喜ぶ前に備えろ。成長にはコストがある。\n簡易課税か本則課税か——宿泊業は第5種、みなし仕入率50%だ。」`,
        effect: { taxWarning: true },
    },
    {
        id: 'repeater_letter',
        type: 'character',
        turnRange: [34, 42],
        condition: (state) => state.repeaterRate >= 0.15,
        title: 'リピーターからの手紙',
        text: `以前泊まったお客さんから手紙が届いた。\n「あの日の夕焼けが忘れられなくて。来月また伺います。友人も連れて行きます。」\n→ リピーター+2名自動追加。お金で買えない資産。`,
        effect: { reputation: 0.2, repeaterBonus: 2 },
    },
    {
        id: 'staff_growth',
        type: 'character',
        turnRange: [28, 40],
        condition: (state) => state.staff.length > 0 && state.turn - (state.staff[0]?.turnHired || 0) >= 12,
        title: 'スタッフの成長',
        text: `清掃スタッフがフロント業務も覚えたいと申し出た。\n「お客さんと話すのが楽しくて。もっと役に立ちたいんです。」`,
        choices: [
            {
                label: 'フロントも任せる（＋¥30,000/月）',
                effect: { money: -30000, staffUpgrade: true, reputation: 0.1 },
                response: 'マルチタスク化。オーナーの負担が軽減された。',
            },
            {
                label: '清掃に専念してもらう',
                effect: { reputation: 0.05 },
                response: '清掃品質を最優先。専門性は大切。',
            },
        ],
    },
    {
        id: 'neighbor_complaint',
        type: 'character',
        turnRange: [20, 50],
        condition: (state) => state.weeklyOccupancy >= 0.70 && Math.random() < 0.3,
        title: '近隣住民からの苦情',
        text: `近隣の住民から苦情が来た。\n「夜遅くまでうるさい。ゲストのマナーが悪い。」`,
        choices: [
            {
                label: '夜間ルール厳格化',
                effect: { occupancyPenalty: -0.03 },
                response: '22時以降の共用スペース禁止。稼働率-3%。',
            },
            {
                label: '菓子折り持参で謝罪',
                effect: { money: -5000 },
                response: '関係修復。今回は大事にならなかった。',
            },
            {
                label: '防音工事',
                effect: { money: -500000, reputation: 0.1 },
                response: '根本解決。¥500,000の出費だが、今後の苦情リスクはゼロに。',
            },
        ],
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// カオス＆ユーモアイベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CHAOS_EVENTS = [
    {
        id: 'ghost_review',
        type: 'chaos',
        turnRange: [14, 24],
        title: '「幽霊が出た」レビュー',
        text: `Googleレビューに投稿。★1。\n「夜中に部屋で変な音がした。幽霊がいると思う。」\n……隣の部屋のいびきでは？\nただし2,000回閲覧。予約キャンセル3件。`,
        choices: [
            {
                label: '丁寧に返信する',
                effect: { reputation: -0.15 },
                response: '「ご不快な思いをさせて申し訳ございません」系の丁寧な返信。',
            },
            {
                label: '逆に「心霊スポット」として売り出す',
                effect: { reputation: -0.4 },
                response: '大スベリ。評判崩壊。——やめとけばよかった。',
            },
            {
                label: '防音工事する（¥500,000）',
                effect: { money: -500000, reputation: 0.1 },
                response: '根本原因（隣室の音漏れ）を解決。真面目な対応。',
            },
        ],
    },
    {
        id: 'bbq_incident',
        type: 'chaos',
        turnRange: [26, 38],
        title: '外国人団体のカルチャーショック',
        text: `外国人グループ8名がチェックイン。\n夜11時から部屋でパーティー開始。\n音楽、笑い声、そして——BBQ？ 部屋でBBQ？？？`,
        choices: [
            {
                label: '丁重に注意する',
                effect: { reputation: 0 },
                response: '言語の壁。伝わったかどうかは微妙……',
            },
            {
                label: '一緒にBBQに参加する',
                effect: { reputation: 0.3 },
                response: '意外と仲良くなった！\nレビュー★5「Amazing host!! He joined our BBQ!!」',
            },
            {
                label: '「BBQ OK」プランを作る',
                effect: { money: -20000, reputation: 0.15, occupancyBonus: 0.03 },
                response: '逆転の発想。BBQプラン¥3,000追加で新しい収益源に。',
            },
        ],
    },
    {
        id: 'midnight_checkin',
        type: 'chaos',
        turnRange: [10, 20],
        once: true,
        title: '深夜チェックインの孤独',
        text: `深夜23時40分。携帯が鳴る。\n「すみません、飛行機が遅延して……」\nパジャマからユニフォームに着替え、フロントへ。\n合計8分の仕事。でもこの8分のために2時間起きていた。\nカフェは21時に閉まった。小売は20時に閉まった。宿泊は——閉まらない。`,
        effect: {},
    },
    {
        id: 'typhoon_night',
        type: 'chaos',
        turnRange: [30, 55],
        once: true,
        title: '台風の夜',
        text: `台風が来る。6人の宿泊客がいる。全員の安全を守るのは自分だ。\n窓に養生テープ。非常灯確認。懐中電灯とペットボトルの水を各部屋に。\nアヤ「私も残ります。お客さんがいるのに帰れません。」\n\n翌朝、台風が去った。\n宿泊客「停電中にスタッフさんが見て回ってくれた。嬉しかったな。」\nレビュー★5。この¥30,000,000の投資の中で一番重い"資産"かもしれない。`,
        effect: { reputation: 0.3 },
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 消費税イベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function createCh3TaxEvent(state) {
    const annualSales = state.totalSales * (52 / Math.max(1, state.turn));
    if (annualSales < 10000000) return null;
    if (state.consumptionTaxEnabled) return null;

    const taxAmount = Math.floor(annualSales * 0.10 * 0.50); // 簡易課税
    const monthly = Math.floor(taxAmount / 12);

    return {
        id: 'consumption_tax',
        type: 'tax',
        title: '消費税の崖 — 課税事業者へ',
        text: `売上が¥10,000,000を超えた。\n2年後から消費税の課税事業者になる。\n\n年間納税額（簡易課税）: ¥${taxAmount.toLocaleString()}\n月額: ¥${monthly.toLocaleString()}\n\n成長には新しいコストが伴う。`,
        character: 'ショウ',
        characterText: 'おめでとう。そしてようこそ課税事業者の世界へ。',
        choices: [
            {
                label: '簡易課税を選択する',
                effect: { consumptionTaxEnabled: true, taxMethod: 'simplified', monthlyTax: monthly },
                response: `簡易課税を選択。月¥${monthly.toLocaleString()}の納税が始まる。`,
            },
            {
                label: '本則課税を選択する',
                effect: { consumptionTaxEnabled: true, taxMethod: 'standard', monthlyTax: Math.floor(monthly * 1.3) },
                response: '本則課税を選択。設備投資が多い年は有利。',
            },
        ],
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// メインイベント取得関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function getCh3EventForTurn(turn, state) {
    const triggered = state._triggeredEvents || [];

    // ケンジアーク
    const nextKenjiStage = (state.kenjiCh3Stage || 0) + 1;
    const kenjiEvent = KENJI_CH3_ARC.find(k =>
        k.stage === nextKenjiStage &&
        turn >= k.turnRange[0] && turn <= k.turnRange[1]
    );
    if (kenjiEvent && !triggered.includes(`kenji_ch3_${kenjiEvent.stage}`)) {
        return {
            ...kenjiEvent,
            id: `kenji_ch3_${kenjiEvent.stage}`,
            type: 'character',
            _kenjiCh3Stage: kenjiEvent.stage,
        };
    }

    // 必須イベント（OTAアルゴ変更）
    const requiredEvent = TURNING_POINT_EVENTS.find(e =>
        e.required &&
        !triggered.includes(e.id) &&
        turn >= e.turnRange[0] && turn <= e.turnRange[1]
    );
    if (requiredEvent) {
        if (!requiredEvent.condition || requiredEvent.condition(state)) {
            return requiredEvent;
        }
    }

    // 転換点イベント（Phase B中心、ランダム選択）
    const phase = getCh3Phase(turn);
    if (phase === 'B' || phase === 'C') {
        const eligibleTP = TURNING_POINT_EVENTS.filter(e =>
            !e.required &&
            !triggered.includes(e.id) &&
            turn >= e.turnRange[0] && turn <= e.turnRange[1] &&
            (!e.condition || e.condition(state))
        );
        if (eligibleTP.length > 0 && Math.random() < 0.25) {
            return eligibleTP[Math.floor(Math.random() * eligibleTP.length)];
        }
    }

    // キャラクターイベント
    const eligibleChar = CHARACTER_EVENTS.filter(e =>
        !triggered.includes(e.id) &&
        turn >= e.turnRange[0] && turn <= e.turnRange[1] &&
        (!e.condition || e.condition(state))
    );
    if (eligibleChar.length > 0 && Math.random() < 0.20) {
        return eligibleChar[Math.floor(Math.random() * eligibleChar.length)];
    }

    // カオスイベント
    const eligibleChaos = CHAOS_EVENTS.filter(e =>
        !triggered.includes(e.id) &&
        turn >= e.turnRange[0] && turn <= e.turnRange[1] &&
        (!e.once || !triggered.includes(e.id))
    );
    if (eligibleChaos.length > 0 && Math.random() < 0.12) {
        return eligibleChaos[Math.floor(Math.random() * eligibleChaos.length)];
    }

    // 消費税イベント
    if (turn >= 28 && !triggered.includes('consumption_tax')) {
        const taxEvent = createCh3TaxEvent(state);
        if (taxEvent) return taxEvent;
    }

    return null;
}
