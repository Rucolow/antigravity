/**
 * Ch.4 EC・D2C イベントデータ
 * 設計書: antigravity-ch4-detail-v3.md Section 7-8, 13-19
 */

import { getCh4Phase } from './ch4Constants.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// ケンジ広告中毒5段階アーク
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const KENJI_CH4_ARC = [
    {
        stage: 1,
        turnRange: [5, 10],
        title: 'ケンジ「俺、天才かも」',
        text: `ケンジ「ROAS 5倍出た！ ¥1が¥5に！\n¥100,000突っ込んだら¥500,000で返ってきた。\nこれ錬金術だろ。寝てる間に金が増えてんだけど。\n俺、働かなくてもよくない？\n広告が俺の代わりに24時間働いてるんだぜ。」`,
    },
    {
        stage: 2,
        turnRange: [14, 20],
        title: 'ケンジ「金、もっとぶっ込め」',
        text: `ケンジ「予算3倍にした。¥300,000/週。\n……あれ、ROAS 3.2倍に下がった。\nいや、金額で見れば利益出てるし？\n¥300K → ¥960K。利益¥660K。前より多い。\nROASが下がっても金額が上がればOK。……OK？\nいや、OK。OK。（2回言った）」`,
    },
    {
        stage: 3,
        turnRange: [28, 34],
        title: 'ケンジの崩壊',
        text: `ケンジ「ROAS 1.8倍。¥1が¥1.8。\n粗利率70%だから、¥1の利益は¥0.26。\n……¥0.26？ 少なくない？\n¥500,000ぶっ込んで利益¥130,000？\n……あれ、人件費と固定費入れたら赤字じゃん？\n\n広告止めたい。でも止めたら売上ゼロだ。\n止められない。止められないんだよ。\n……俺、広告依存症かもしれない。」`,
    },
    {
        stage: 4,
        turnRange: [42, 48],
        title: 'ケンジの撤退と転換',
        text: `ケンジ「広告、半分に減らした。\n売上は40%減った。でも利益は増えた。\n面白いだろ——金を使わない方が儲かるって。\n……いや、笑えないんだけど。\n今まで燃やした広告費の合計、あれ全部必要だったのか？」`,
    },
    {
        stage: 5,
        turnRange: [58, 64],
        title: 'ケンジの悟り',
        text: `ケンジ「LTVって概念、最近やっとわかった。\n俺は「新規客」しか見てなかった。\nお前は「リピーター」を育ててた。\n新規客は¥4,000で買ってくれる。\nリピーターは¥12,000使ってくれる。\nしかもリピーターの獲得コストは¥0。\n「もう持ってる客」が、最強の客だった。\n……Ch.3の宿泊の時から、お前はそれをやってたのか。」`,
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 転換点イベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const TURNING_POINT_EVENTS = [
    {
        id: 'cac_wall',
        type: 'turning_point',
        turnRange: [33, 40],
        condition: (state) => (state.totalAdSpend || 0) > 1600000, // 累計広告費¥1.6M超（≈月¥400K×4ヶ月）
        title: 'CACの壁',
        text: `広告費を増やし続けた。でも新規顧客の増加ペースが鈍化している。\n広告費を2倍にしても、新規顧客は1.5倍にしかならない。\n——これが「CACの逓増」。広告の効率は永遠に落ち続ける。`,
        character: 'ショウ',
        characterText: '広告は「投資」だと思っていただろう。今から「コスト」に変わる。その瞬間を体験しろ。',
        choices: [
            {
                label: '新しい広告媒体を試す（テスト¥100,000）',
                effect: { money: -100000, adEfficiencyBoost: 0.10 },
                response: '新しい媒体でのテスト開始。まだ疲弊していないオーディエンスにリーチ。',
            },
            {
                label: 'CRM（リピーター施策）に投資する',
                effect: { repeatBoost: 0.05, reputation: 0.1 },
                response: '広告で「新規」を追う代わりに「既存客」を育てる方向へ転換。',
            },
            {
                label: 'インフルエンサーマーケティング（¥200,000）',
                effect: { money: -200000, influencerHired: true },
                response: '成功率40%で爆発的効果。¥200,000の賭け。',
            },
        ],
    },
    {
        id: 'marketplace_warning',
        type: 'turning_point',
        turnRange: [36, 48],
        condition: (state) => state.channels?.includes('amazon') || state.channels?.includes('rakuten'),
        title: 'マーケットプレイスからの警告',
        text: `マーケットプレイスから警告メールが届いた。\n「顧客レビューの低評価率が基準を超えています。\n改善されない場合、アカウント停止の可能性があります。」`,
        choices: [
            {
                label: '品質改善に投資（¥500,000）',
                effect: { money: -500000, reputation: 0.3 },
                response: '製造工程の見直し。品質改善。',
            },
            {
                label: 'レビュー対策（フォローメール強化）',
                effect: { reputation: 0.1 },
                response: '購入者へのフォローメール強化。改善に4ターン。',
            },
            {
                label: 'マーケットプレイスから撤退',
                effect: { channelRemove: true },
                response: 'リスク排除。ただし売上減少。',
            },
        ],
    },
    {
        id: 'copycat',
        type: 'turning_point',
        turnRange: [40, 52],
        title: '模倣品の出現',
        text: `Amazonで自社商品と酷似した商品が出品されている。\n価格はあなたの70%。レビューはまだ少ない。\nしかし検索結果で上位に表示され始めた。`,
        choices: [
            {
                label: 'ブランド強化（¥300,000）',
                effect: { money: -300000, reputation: 0.3 },
                response: 'パッケージ刷新+ストーリー訴求。ブランド力で差別化。',
            },
            {
                label: '新商品開発で差別化（¥500,000）',
                effect: { money: -500000, productUpgrade: true },
                response: '3ターン後に新商品ローンチ。模倣品との差別化完了。',
            },
            {
                label: '価格で対抗（値下げ）',
                effect: { priceOverride: 0.80 },
                response: '価格を対抗値に。利益率は下がるが客は確保。',
            },
        ],
    },
    {
        id: 'influencer_crisis',
        type: 'turning_point',
        turnRange: [30, 48],
        condition: (state) => state.influencerHired,
        title: 'インフルエンサーの炎上',
        text: `起用していたインフルエンサーがSNSで炎上した。\n関連して自社ブランドにもネガティブな言及が広がっている。\n1日で自社SNSのフォロワーが500人減った。`,
        choices: [
            {
                label: '契約を即時解除＋公式声明',
                effect: { reputation: -0.2, influencerHired: false },
                response: '誠実な対応。評判回復に4ターン。',
            },
            {
                label: '別のインフルエンサーで上書き（¥300,000）',
                effect: { money: -300000, reputation: 0.1 },
                response: '即効性あり。ただし追加コスト。',
            },
            {
                label: '静観する',
                effect: { reputation: -0.4 },
                response: '炎上が収まるのを待つ。長引くリスクあり。',
            },
        ],
    },
    {
        id: 'wholesale_offer',
        type: 'turning_point',
        turnRange: [56, 68],
        condition: (state) => (state.weeklySales || 0) * 4 > 3000000,
        title: '大手小売からの卸売り打診',
        text: `大手ドラッグストアチェーンから連絡が来た。\n「御社の商品を全国300店舗で取り扱いたい。\nただし卸価格は小売価格の50%。初回ロット3,000個。」`,
        character: 'ショウ',
        characterText: '規模の経済 vs 利益率。どちらを取る？ D2Cの「D」を守るか、捨てるか。',
        choices: [
            {
                label: '受ける（売上大幅UP。粗利率半減）',
                effect: { wholesaleEnabled: true, wholesaleMarginCut: 0.50 },
                response: '全国展開開始。売上UP。ただし粗利率が半分に。',
            },
            {
                label: '条件交渉（卸価格55%。成功率50%）',
                effect: { money: 0, wholesaleNegotiation: true },
                response: '交渉中……結果は次ターン。',
            },
            {
                label: '断る（D2Cブランドの独自性を守る）',
                effect: { reputation: 0.2 },
                response: 'ブランドのコントロールを守った。ファンの信頼UP。',
            },
        ],
    },
    {
        id: 'ad_stop_test',
        type: 'turning_point',
        turnRange: [57, 64],
        required: true,
        title: '【構造破壊】広告停止テスト',
        text: `ショウさん：「お前に1つ、実験をさせたい。\n広告を止めろ。1週間。全部。」\n\n「全部？ 売上が——」\n\n「お前は今、自分の売上がどこから来ているか知らない。\n広告が連れてきた客なのか。ブランドが連れてきた客なのか。\n一度止めないと、それは永遠にわからない。」`,
        character: 'ショウ',
        characterText: '広告を止めた瞬間——何も残らない？ それを確かめるための実験だ。',
        choices: [
            {
                label: '広告を1ターン完全停止する（推奨）',
                effect: { adStopTest: true, adStopTestSales: 'calc' },
                response: '「配信停止」を押した。結果は次ターンで判明する。',
            },
            {
                label: 'やめておく（怖い）',
                effect: { adStopDeclined: true },
                response: '止められなかった。——それ自体が答えかもしれない。',
            },
        ],
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// キャラクターイベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CHARACTER_EVENTS = [
    {
        id: 'aya_cs_start',
        type: 'character',
        turnRange: [1, 3],
        condition: (state) => state.ayaFromCh3,
        title: 'アヤ、CSを担当する',
        text: `アヤさん「ネットのお客さん、顔が見えないけど、\nメールの向こうには人がいる。\nカスタマーサポート、私に任せてください。」\n→ アヤの丁寧な対応がレビュー評価+0.3に貢献。`,
        effect: { reputation: 0.3, ayaJoined: true },
    },
    {
        id: 'aya_email_magic',
        type: 'character',
        turnRange: [8, 12],
        condition: (state) => state.ayaJoined,
        title: 'アヤの「文面力」',
        text: `アヤ「社長、この確認メール、ちょっと変えていいですか？\n『ご注文ありがとうございます。商品番号12345。』\nこれだけだと……機械ですよね。\n『お選びいただきありがとうございます。\nスタッフのアヤが丁寧に梱包してお届けします。』\nこっちの方がよくないですか？」\n\nレビュー★5。「メールの文面に人の温もりを感じた。」`,
        effect: { reputation: 0.2, repeatBoost: 0.03 },
    },
    {
        id: 'misaki_insta_ec',
        type: 'character',
        turnRange: [18, 24],
        title: 'ミサキのインスタ投稿',
        text: `ミサキさんが商品を買ってくれた。\n「これ、インスタに載せるね。本当にいいから。」\n→ フォロワー5,000人に拡散！ 広告費¥0で新規+30人。`,
        effect: { bonusCustomers: 30, reputation: 0.2 },
    },
    {
        id: 'ryota_first_purchase',
        type: 'character',
        turnRange: [10, 16],
        title: 'リョウタ、初の顧客になる',
        text: `リョウタ「有給でモルディブ行ってきた🏝️\n水上コテージ、1泊¥80,000。……高すぎて1泊しかしてない。\nお前のECで割引クーポンとかないの？\n友達割引。ないの？ マジ？\nじゃあ定価で買うのか……。……買うわ。友達だしな。\n（※ リョウタ、初のリアル顧客になる。LTV ¥4,500）」`,
        effect: { bonusCustomers: 1, reputation: 0.1 },
    },
    {
        id: 'shou_cac_philosophy',
        type: 'character',
        turnRange: [24, 32],
        condition: (state) => (state.cac || 0) > 6000,
        title: 'ショウさんのCAC哲学',
        text: `ショウさん：「CAC ¥${Math.floor((6000 + Math.random() * 3000))}。\nお前は今、会ったこともない人間に\nその金額を払って「うちの客になってくれ」と頼んでいる。\n……合コンの幹事か？\nいや、合コンの幹事の方がまだ成功率高いな。」`,
        effect: {},
    },
    {
        id: 'shou_incorporation_advice',
        type: 'character',
        turnRange: [30, 38],
        title: 'ショウさんの法人化アドバイス',
        text: `ショウさん：「法人化は「得」か「損」かで判断するな。\n課税所得900万超えたら、数字で見ろ。\n役員報酬の設計が次の勝負だ。」`,
        effect: { taxWarning: true },
    },
    {
        id: 'takuya_consult',
        type: 'character',
        turnRange: [40, 50],
        title: 'タクヤのコンサル依頼',
        text: `Ch.0のせどり仲間タクヤから久しぶりに連絡。\n「お前のブランド、すごいな。\n俺もEC始めたんだけど、広告運用が全然わからん。\nコンサルしてくれないか？月¥100,000で。」`,
        choices: [
            {
                label: '受ける（副収入¥25,000/週。時間消費）',
                effect: { consultIncome: 25000 },
                response: '「知識が金になる」体験。毎週¥25,000の副収入。',
            },
            {
                label: '断る（本業に集中）',
                effect: {},
                response: '本業に集中。時間は有限。',
            },
        ],
    },
    {
        id: 'fan_viral',
        type: 'character',
        turnRange: [35, 48],
        condition: (state) => (state.reputation || 0) >= 4.5,
        title: '熱狂的なファンの出現',
        text: `SNSでお客さんが自発的にレビュー動画を投稿してくれた。\n再生回数12万回。コメント欄は「買いたい！」の嵐。\n→ 広告費¥0で新規顧客+50人。\n「お金で買えない広告」の存在。ブランドの力。`,
        effect: { bonusCustomers: 50, reputation: 0.3, organicBoost: 0.05 },
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// カオス＆ユーモアイベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
const CHAOS_EVENTS = [
    {
        id: 'overseas_buzz',
        type: 'chaos',
        turnRange: [22, 30],
        title: '海外で勝手にバズる',
        text: `韓国のインフルエンサーが商品をレビューしたらしい。\n再生回数800万回。海外からの注文が1日で200件。\n\nただし——\n・海外発送に対応していない\n・問い合わせが全部韓国語\n・対応できない間にライバルが韓国で類似品を販売開始`,
        choices: [
            {
                label: '急いで海外対応する（¥500,000。2ターン後）',
                effect: { money: -500000, internationalEnabled: true },
                response: '配送契約+翻訳。グローバル展開の第一歩。',
            },
            {
                label: '代行業者に丸投げ（手数料35%。即対応）',
                effect: { internationalProxy: true },
                response: '手数料は高いが即対応。機会損失を防いだ。',
            },
            {
                label: '「日本限定ブランド」として海外展開しない',
                effect: { reputation: 0.15 },
                response: '「日本でしか買えない」逆にブランド化。……した気がする。',
            },
        ],
    },
    {
        id: 'celebrity_rumor',
        type: 'chaos',
        turnRange: [36, 44],
        once: true,
        title: '有名人が使ってる「らしい」',
        text: `Twitterで「○○（芸能人）が使ってるらしい」と\n根拠のない噂が広がった。本人は使っていない。\n\nでも注文が3倍に増えた。\n3日後。否定も肯定もされなかった。\n噂は自然消滅。注文も元に戻った。\nただし、その間に発注した在庫が残った。`,
        choices: [
            {
                label: '公式に否定する（誠実）',
                effect: { reputation: 0.2 },
                response: '誠実な対応。ただし売上は即戻る。',
            },
            {
                label: '何もしない（噂が事実になることを祈る）',
                effect: { money: -100000 },
                response: '在庫が残った。¥100,000の損失。',
            },
            {
                label: 'その芸能人の事務所にサンプルを送る',
                effect: { money: -30000, reputation: 0.1 },
                response: '本当に使ってもらう作戦。結果は……わからない。',
            },
        ],
    },
    {
        id: 'ec_loneliness',
        type: 'chaos',
        turnRange: [12, 20],
        once: true,
        title: '画面の向こうの孤独',
        text: `朝9時。PCの前に座る。\nダッシュボードを開く。昨夜の注文：7件。レビュー：新着1件。★4。\n……それだけ。\n\nカフェの朝は、コーヒーの香りとドアベルの音で始まった。\n小売の朝は、段ボールを開けて棚に並べることで始まった。\n宿泊の朝は「おはようございます」で始まった。\n\nECの朝は——ダッシュボードの数字で始まる。\n今日、誰にも会わない。`,
        effect: {},
    },
    {
        id: 'midnight_order',
        type: 'chaos',
        turnRange: [30, 50],
        once: true,
        title: '深夜の受注通知',
        text: `午前2時13分。スマホが光った。\n「新規注文がありました。」\n\n午前2時に、会ったことのない人が、\n会ったことのない自分の商品を買ってくれた。\n\n眠れなくなった。嬉しいのか？ 怖いのか？ わからない。\n\nECは——終わらない。\n世界のどこかで、今も誰かが商品ページを見ている。\n24時間365日。\n「いつでも売れる」という希望と、\n「いつまでも気が休まらない」という地獄の、\n両方だった。`,
        effect: { reputation: 0.1 },
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 法人化イベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function createIncorporationEvent(state) {
    const annualProfit = (state.totalProfit || 0) * (52 / Math.max(1, state.turn));
    if (annualProfit < 9000000) return null;
    if (state.isIncorporated) return null;

    return {
        id: 'incorporation',
        type: 'incorporation',
        title: '法人化の提案 — 大人になる日',
        text: `税理士から言われた。「そろそろ法人化を検討しませんか。」\n\n法人。自分と事業を「別の人間」にするということ。\n自分の名前ではなく、会社の名前で契約する。\n自分の口座ではなく、会社の口座に金が入る。\n\n今の課税所得だと、個人より法人の方が税負担が軽くなる。`,
        character: 'ショウ',
        characterText: '法人化は「得」か「損」かで判断するな。数字で見ろ。役員報酬の設計が次の勝負だ。',
        choices: [
            {
                label: '法人化する（設立費用¥250,000）',
                effect: { incorporateStart: true, money: -250000 },
                response: '法人設立。次に役員報酬の設定が必要。',
            },
            {
                label: 'もう少し個人事業で続ける',
                effect: {},
                response: '個人事業で継続。来年また検討。',
            },
        ],
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 消費税イベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function createCh4TaxEvent(state) {
    const annualSales = (state.totalSales || 0) * (52 / Math.max(1, state.turn));
    if (annualSales < 10000000) return null;
    if (state.consumptionTaxEnabled) return null;

    const taxAmount = Math.floor(annualSales * 0.10 * 0.50);
    const monthly = Math.floor(taxAmount / 12);

    return {
        id: 'consumption_tax_ec',
        type: 'tax',
        title: '消費税の崖 — 課税事業者へ',
        text: `売上が¥10,000,000を超えた。\n消費税の課税事業者になる。\n\n年間納税額（簡易課税）: ¥${taxAmount.toLocaleString()}\n月額: ¥${monthly.toLocaleString()}\n\n成長には新しいコストが伴う。`,
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
                response: '本則課税を選択。仕入控除がフルで使える。',
            },
        ],
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// メインイベント取得関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export function getCh4EventForTurn(turn, state) {
    const triggered = state._triggeredEvents || [];

    // ── 優先順位1: アヤ合流（固定・確定発火） ──
    if (turn >= 1 && turn <= 3 && state.ayaFromCh3 && !state.ayaJoined && !triggered.includes('aya_cs_start')) {
        return {
            id: 'aya_cs_start',
            type: 'character',
            title: 'アヤ、CSを担当する',
            text: `アヤさん「ネットのお客さん、顔が見えないけど、\nメールの向こうには人がいる。\nカスタマーサポート、私に任せてください。」\n→ アヤの丁寧な対応がレビュー評価+0.3に貢献。`,
            effect: { reputation: 0.3, ayaJoined: true },
        };
    }

    // ── 優先順位2: 消費税イベント（条件付き固定・重要） ──
    if (turn >= 28 && !triggered.includes('consumption_tax_ec')) {
        const taxEvent = createCh4TaxEvent(state);
        if (taxEvent) return taxEvent;
    }

    // ── 優先順位3: 法人化イベント（条件付き固定・重要） ──
    if (turn >= 35 && !triggered.includes('incorporation')) {
        const incEvent = createIncorporationEvent(state);
        if (incEvent) return incEvent;
    }

    // ── 優先順位4: ケンジアーク（stage順序制御付き） ──
    const nextKenjiStage = (state.kenjiCh4Stage || 0) + 1;
    const kenjiEvent = KENJI_CH4_ARC.find(k =>
        k.stage === nextKenjiStage &&
        turn >= k.turnRange[0] && turn <= k.turnRange[1]
    );
    if (kenjiEvent && !triggered.includes(`kenji_ch4_${kenjiEvent.stage}`)) {
        return {
            ...kenjiEvent,
            id: `kenji_ch4_${kenjiEvent.stage}`,
            type: 'character',
            _kenjiCh4Stage: kenjiEvent.stage,
        };
    }

    // ── 優先順位5: 必須イベント（広告停止テスト） ──
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

    // ── 優先順位5.5: フォースドチョイス（中盤の経営判断を強制） ──
    const forcedChoices = [
        {
            id: 'forced_ad_strategy',
            turn: 20,
            type: 'turning_point',
            title: '広告戦略の転換点',
            text: `広告費が毎週重い。CAC（顧客獲得コスト）が高止まりしている。\n\n「広告で客を買い続けるか、ブランドで客が来る仕組みを作るか」\nD2Cの本質的な分岐点。`,
            choices: [
                {
                    label: 'SNS・コンテンツに投資（短期売上↓、長期オーガニック↑）',
                    response: '広告予算の一部をコンテンツ制作に回した。すぐには効果が出ないが、検索流入が徐々に増え始めた。',
                    effect: { reputation: 0.15 },
                },
                {
                    label: 'インフルエンサー施策（一時的な爆発力）',
                    response: 'インフルエンサーに商品を送った。一時的に注文が急増！ただし定着するかは不明。「バズは一過性」を体感。',
                    effect: { money: -50000, reputation: 0.15, bonusCustomersThisWeek: 30 },
                },
                {
                    label: '広告最適化に集中（CPA改善）',
                    response: '広告のターゲティングを絞り込んだ。CACが改善。「広告を止められない」構造は変わらないが、効率は上がった。',
                    effect: { reputation: 0.1 },
                },
            ],
        },
        {
            id: 'forced_subscription',
            turn: 30,
            type: 'turning_point',
            title: 'サブスク導入の判断',
            text: `リピーターが増えてきた。\n「定期購入（サブスク）を導入しては？」とチームから提案。\n\nLTVを上げる最強の武器——だが、解約率との戦いでもある。`,
            choices: [
                {
                    label: '月額サブスクを導入（10%引き、安定収益）',
                    response: 'サブスクを開始！初月から50人が加入。安定収益の基盤ができた。ただし解約防止の仕組みが必要に。',
                    effect: { reputation: 0.15, money: 50000, subscriberCount: 50, subscriptionEnabled: true },
                },
                {
                    label: '頒布会（3ヶ月限定セット）',
                    response: '期間限定の頒布会を開催。「限定感」でリピート率が上がった。サブスクほどの安定性はないが、解約リスクも低い。',
                    effect: { reputation: 0.15 },
                },
                {
                    label: '見送り（単品販売に集中）',
                    response: '今はまだ早いと判断。「サブスクは仕組み作りが大変。まず単品で利益を出してから」。',
                    effect: {},
                },
            ],
        },
    ];
    const forcedHit = forcedChoices.find(f => turn === f.turn && !triggered.includes(f.id));
    if (forcedHit) return forcedHit;

    // ── 優先順位6: 転換点イベント（Phase B/C、確率25%） ──
    const phase = getCh4Phase(turn);
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

    // ── 優先順位7: キャラクターイベント（確率20%、アヤ以外） ──
    const eligibleChar = CHARACTER_EVENTS.filter(e =>
        e.id !== 'aya_cs_start' &&   // アヤは優先順位1で処理済み
        !triggered.includes(e.id) &&
        turn >= e.turnRange[0] && turn <= e.turnRange[1] &&
        (!e.condition || e.condition(state))
    );
    if (eligibleChar.length > 0 && Math.random() < 0.20) {
        return eligibleChar[Math.floor(Math.random() * eligibleChar.length)];
    }

    // ── 優先順位8: カオスイベント（確率12%） ──
    const eligibleChaos = CHAOS_EVENTS.filter(e =>
        !triggered.includes(e.id) &&
        turn >= e.turnRange[0] && turn <= e.turnRange[1]
    );
    if (eligibleChaos.length > 0 && Math.random() < 0.12) {
        return eligibleChaos[Math.floor(Math.random() * eligibleChaos.length)];
    }

    return null;
}
