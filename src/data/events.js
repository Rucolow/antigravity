// Turn 1-16+ イベントデータ — 設計書 v3 準拠（フルゲーム版、目標¥300K）

export const EVENTS = [
    // ══════════════════════════════════════
    // Phase A（Turn 1-6）：導入
    // ══════════════════════════════════════

    // Turn 1: バイト開始
    {
        id: 'baito_start',
        turn: 1,
        type: 'story',
        character: null,
        text: [
            'バイトが決まった。',
            '初日で分かったこと——体力は有限、時間も有限。',
            '',
            'カフェを開くための、最初の一歩。',
            'まずはここから始めよう。',
        ],
        choices: null,
    },

    // Turn 2: ショウさん登場
    {
        id: 'shou_intro',
        turn: 2,
        type: 'story',
        character: 'shou',
        text: [
            'バイト帰り、見慣れない人に声をかけられた。',
            '',
            '「カフェ開きたいんだって？',
            '　いくら必要か知ってる？」',
            '',
            '……30万。自分の手でそれだけ貯めろ。',
            '',
            '「日給¥{baitoPay}。',
            '　生活費を引いて、手残りは——」',
            '',
            '　時給には天井がある。',
            '　天井を超えたいなら、',
            '　\"仕入れて売る\"を覚えろ。」',
        ],
        choices: null,
    },

    // Turn 3: せどり解放
    {
        id: 'sedori_unlock',
        turn: 3,
        type: 'unlock',
        character: 'shou',
        text: [
            'ショウさんからメッセージが来た。',
            '',
            '「リサイクルショップに行ってみろ。',
            '　安く買って、高く売る。',
            '　シンプルだけど、これがビジネスの原型だ。」',
            '',
            '……やってみるか。',
        ],
        choices: null,
        effect: { sedoriUnlocked: true },
        unlockLabel: '「せどり」が選べるようになった！',
    },

    // Turn 4: ケンジ登場
    {
        id: 'kenji_intro',
        turn: 4,
        type: 'story',
        character: 'kenji',
        text: [
            'リサイクルショップで声をかけてきた男。',
            '同い年。名前はケンジ。',
            '',
            '「俺もせどりやってんだよ！',
            '　先月15万稼いだぜ！',
            '　コツは仕入れ量だよ、量！」',
            '',
            '……15万。羨ましい。',
            '　でも、利益率は？　不良在庫は？',
            '　聞けなかった。',
        ],
        choices: null,
    },

    // Turn 5: マルシェ解放
    {
        id: 'marche_unlock',
        turn: 5,
        type: 'unlock',
        character: null,
        text: [
            '近所でフリーマーケットのチラシを見つけた。',
            '「手作り品でも、仕入品でもOK！',
            '　出店料込みで小規模¥8,000から。」',
            '',
            '……自分で値段をつけて、直接お客さんに売る。',
            'せどりとは違う手触りがある。',
        ],
        choices: null,
        effect: { marcheUnlocked: true },
        unlockLabel: '「マルシェ」に出店できるようになった！',
    },

    // Turn 6: リョウタ登場
    {
        id: 'ryouta_intro',
        turn: 6,
        type: 'story',
        character: 'ryouta',
        text: [
            '高校の同級生、リョウタからLINE。',
            '',
            '「元気か？　俺、来月から正社員だわ。',
            '　手取り22万。ボーナスもある。',
            '　お前はまだバイト？',
            '　……まあ、お前はお前のペースでいいんじゃね」',
            '',
            'でも、¥{money}。',
            'ゼロから始めて、ここまで来た。',
        ],
        choices: null,
    },

    // ══════════════════════════════════════
    // Phase B（Turn 7-12）：転機
    // ══════════════════════════════════════

    // Turn 7: 自炊の提案
    {
        id: 'cooking_proposal',
        turn: 7,
        type: 'choice',
        character: 'shou',
        text: [
            'ショウさんからアドバイスが来た。',
            '',
            '「食費を見直せ。',
            '　自炊で月¥15,000浮く。',
            '　ただし毎日の買い出しと調理で少し疲れる。',
            '　副業の効率が −5% 下がる。」',
            '',
            '月¥15,000の節約 vs 副業効率−5%。',
            '今の収入構造で、どっちが得か？',
        ],
        choices: [
            {
                label: '自炊する（生活費 −¥3,750/週、副業効率 −5%）',
                effect: { hasCooking: true },
                response: '自炊を始めた。食費は減ったが、毎日少し疲れる。',
            },
            {
                label: 'しない（今のままでいく）',
                effect: {},
                response: '今は副業に集中する。節約は後で考えよう。',
            },
        ],
    },

    // Turn 8: タクヤ登場（せどりライバル）— 転機①
    {
        id: 'takuya_intro',
        turn: 8,
        type: 'choice',
        character: 'takuya',
        text: [
            'リサイクルショップで、同じ棚を物色している人がいた。',
            '名前はタクヤ。同い年。副業でせどりをやっているらしい。',
            '',
            '「最近この店の良品、すぐなくなるんだよね。',
            '　お互い大変だな。」',
            '',
            '同じ店にライバルがいると、良い商品を先に取られるかもしれない。',
        ],
        choices: [
            {
                label: '「負けない。自分のペースで続ける」（せどり利益率 −10%）',
                effect: { rivalRelation: 'compete' },
                response: '同じ店で競争することにした。良い商品は早い者勝ちだ。',
            },
            {
                label: '「一緒に情報共有しよう」（リサーチ精度UP）',
                effect: { rivalRelation: 'cooperate' },
                response: 'タクヤと情報交換を始めた。競合だけど、情報の力は大きい。',
            },
        ],
    },

    // Turn 9: バイト先の異変 — 転機③
    {
        id: 'baito_change',
        turn: 9,
        type: 'story',
        character: null,
        variants: {
            cafe: {
                text: [
                    'バイト先のカフェが来月閉店する。',
                    '',
                    '店長は言った。',
                    '「家賃が上がって、もう利益が出ないんだ。',
                    '　月商120万あっても、経費が125万かかってる。',
                    '　5万円の赤字を1年続けた。もう限界だよ。」',
                    '',
                    '……月商120万でも赤字になる。',
                    '自分が開く店では、こうならないようにしないと。',
                    '',
                    '── 新しいカフェバイト先を見つけたが、日給が¥8,800→¥7,500に',
                ],
                effect: { baitoPayOverride: 7500 },
            },
            convenience: {
                text: [
                    '深夜シフトの人員が削減された。',
                    '',
                    '「会社の方針でね。人件費カットだって。',
                    '　来月から週4日までしか入れないよ。」',
                    '',
                    '── コンビニバイト 最大日数が 5日→4日 に減少',
                ],
                effect: { baitoMaxDaysOverride: 4 },
            },
            moving: {
                text: [
                    '繁忙期が終わり、引越しの依頼が減った。',
                    '',
                    '「今週の依頼は1件だけ。来週は3件入る予定。',
                    '　繁忙期はもう終わったからな……。」',
                    '',
                    '── 今週は引越し1日のみ',
                ],
                effect: { baitoMaxDaysOverrideTemp: 1 },
            },
        },
    },

    // Turn 10: シェアハウス提案
    {
        id: 'sharehouse_proposal',
        turn: 10,
        type: 'choice',
        character: null,
        text: [
            '友人から連絡が来た。',
            '「シェアハウスに空きが出た。',
            '　家賃が¥45,000→¥30,000になるよ。',
            '　ただし引越し費用¥50,000がかかる。',
            '　あと、荷物を減らさないといけない——」',
            '',
            '引越すと、せどりの在庫スペースが狭くなる。',
            '仕入れ重視の日は5品→3品に制限される。',
        ],
        choices: [
            {
                label: '引越す（−¥50,000、生活費−¥3,750/週、仕入上限3品）',
                effect: { hasSharehouse: true },
                response: 'シェアハウスに引っ越した。固定費は下がったが、在庫スペースが狭い。',
            },
            {
                label: '今の家に残る',
                effect: {},
                response: '在庫スペースを優先して、今の家に残ることにした。',
            },
        ],
    },

    // Turn 11: 値上げラッシュ — 転機⑤
    {
        id: 'price_hike',
        turn: 11,
        type: 'choice',
        character: null,
        text: [
            'ニュースを見ていたら、',
            '食品の値上げが相次いでいる。',
            'マルシェの材料費が上がりそうだ。',
            '',
            '材料費が+20%。',
            'どう対応する？',
        ],
        choices: [
            {
                label: '価格を上げる（利益維持、客足−10%）',
                effect: { marcheCostMultiplier: 1.2 },
                response: '価格を転嫁した。利益率は維持できるが、客足が少し減るかもしれない。',
            },
            {
                label: '価格据え置き（利益圧縮）',
                effect: { marcheCostMultiplier: 1.2 },
                response: '価格は変えない。お客さんを逃したくない。利益は減るが、信頼は残る。',
            },
        ],
        condition: (state) => state.marcheUnlocked,
    },

    // Turn 11（マルシェ未解放時）: 飲み会の誘い
    {
        id: 'drinking_invite',
        turn: 11,
        type: 'choice',
        character: null,
        text: [
            '久しぶりに友達から連絡が来た。',
            '「今週金曜、飲まない？ みんな集まるよ。」',
        ],
        choices: [
            {
                label: '行く（−¥5,000、来週パフォーマンス+10%）',
                effect: { money: -5000, nextWeekBonus: 0.10 },
                response: '久しぶりに笑った。明日から頑張れそうだ。',
            },
            {
                label: '断る（¥0）',
                effect: {},
                response: '「ごめん、今週は無理」。最近付き合い悪いよな、って言われた。',
            },
        ],
        condition: (state) => !state.marcheUnlocked,
    },

    // Turn 12: 友人の結婚式
    {
        id: 'wedding',
        turn: 12,
        type: 'story',
        character: null,
        text: [
            '友人から結婚式の招待が届いた。',
            '',
            'ご祝儀¥30,000。痛い出費だ。',
            'でも——行かない選択肢は、自分には、ない。',
            '',
            '── ¥30,000が自動的に引かれた',
        ],
        choices: null,
        effect: { money: -30000 },
    },

    // ══════════════════════════════════════
    // Phase C（Turn 11-16）：加速
    // ══════════════════════════════════════

    // Turn 11: 副業がバイトを超えた
    {
        id: 'side_income_surpass',
        turn: 11,
        type: 'story',
        character: null,
        text: [
            'ふと気づいた。',
            '',
            '先週の収入を振り返ると——',
            '副業の収入が、バイトを上回っている。',
            '',
            '「仕入れて売る」「作って売る」。',
            '日給の天井を超える手段が、少しずつ見えてきた。',
        ],
        choices: null,
        condition: (state) => state.money < 300000,
    },

    // Turn 12: SNSの同世代起業家
    {
        id: 'sns_entrepreneur',
        turn: 12,
        type: 'story',
        character: null,
        text: [
            '同い年の奴がSNSで月商100万って投稿してる。',
            '自分はまだ¥{money}。',
            '',
            '……でも、あいつの利益率は何%なんだろう。',
            '「売上」と「利益」は違う——あの閉店したカフェの店長の話を思い出す。',
            '',
            '月商120万でも、経費が上回れば赤字だった。',
            '大事なのは見せ方じゃなく、手残り。',
        ],
        choices: null,
    },

    // Turn 13: 親からの電話
    {
        id: 'parent_call',
        turn: 13,
        type: 'story',
        character: null,
        text: [
            '夜、親から電話があった。',
            '',
            '「いつまでバイトしてるの？ 同級生の〇〇くん、もう課長になったって。',
            '　あなたもそろそろちゃんとした仕事に——」',
            '',
            '電話を切った後、しばらく天井を見つめていた。',
            '',
            'でも、¥{money}。ゼロから始めて、ここまで来た。',
        ],
        choices: null,
    },

    // Turn 14: ショウ「確定申告しろ」
    {
        id: 'shou_tax',
        turn: 14,
        type: 'story',
        character: 'shou',
        text: [
            'ショウさんからメッセージ。',
            '',
            '「副業で年間20万以上稼いだら確定申告が必要だ。',
            '　知らなかったじゃ済まない。」',
            '',
            '「青色申告にすると最大65万円の控除がある。',
            '　小規模企業共済も使え。',
            '　節税は合法的な武器だ。」',
            '',
            '……税金のことは、カフェを開いたら本格的に関わることになる。',
        ],
        choices: null,
    },

    // Turn 15: ケンジの末路
    {
        id: 'kenji_failure',
        turn: 15,
        type: 'story',
        character: 'kenji',
        text: [
            'ケンジからLINEが来た。',
            '',
            '「やべー、在庫が30万円分残ってる……。',
            '　売れると思って仕入れたんだけどさ。',
            '　相場が崩れて、半額でも売れねぇ。」',
            '',
            '量だよ量！って言ってたケンジ。',
            'リサーチなしの仕入れが裏目に出た。',
        ],
        choices: null,
    },

    // Turn 16+（ゴール未達時）: ゴールが見える
    {
        id: 'final_sprint',
        turn: 16,
        type: 'story',
        character: null,
        text: [
            'あと少し。',
            '',
            '¥{money}。目標の¥300,000まで、あと¥{remaining}。',
            '',
            'ラストスパート。',
        ],
        choices: null,
        condition: (state) => state.money < 300000,
    },
];

// ミサキ SNSバズ（Turn 6、マルシェ未解放時の代替イベント）
const MISAKI_SNS_EVENT = {
    id: 'misaki_sns',
    type: 'story',
    character: 'misaki',
    text: [
        'マルシェの出店者を何気なくフォローしてたミサキからLINE。',
        '',
        '「ね、あのハンドメイドの人のインスタ、いいね100超えたよ！',
        '　SNSで見せ方変えるだけで、全然反応違うんだね。」',
        '',
        '「あなたも何か売ってるんでしょ？ 写真の撮り方、教えたげようか？」',
        '',
        '── SNSの力。商品は同じでも「見せ方」で価値が変わる。',
    ],
    choices: null,
};

// リョウタ初任給報告（Turn 10）
const RYOUTA_SALARY_EVENT = {
    id: 'ryouta_salary',
    type: 'story',
    character: 'ryouta',
    text: [
        'リョウタからLINE。',
        '',
        '「初任給入った！ ¥230,000。手取り¥185,000。',
        '　税金と社保で¥45,000も引かれるんだな……。」',
        '',
        '「お前は？ 今月いくら稼いだ？」',
        '',
        '── 会社員は安定しているが、天井も見える。',
        '　 自分の選択は——不安定だが、天井がない。',
    ],
    choices: null,
};

// せどりクレーム（Turn 9-12、せどり経験者向け）
const SEDORI_CLAIM_EVENT = {
    id: 'sedori_claim',
    type: 'choice',
    character: null,
    text: [
        'フリマアプリで売った商品にクレームが来た。',
        '',
        '「届いた商品、説明と状態が違います。傷があります。返品したいのですが。」',
        '',
        '写真を確認すると……たしかに見落としていた小さな傷がある。',
    ],
    choices: [
        {
            label: '全額返金する（−¥3,000、評価を守る）',
            effect: { money: -3000 },
            response: '返金した。評価は守られた。信用 = 長期的な資産。Ch.1でも同じだ。',
        },
        {
            label: '半額返金で交渉する',
            effect: { money: -1500 },
            response: '半額で落ち着いた。ただ、評価に「やや汚れあり」と書かれた。',
        },
        {
            label: '「検品済みです」と突っぱねる',
            effect: {},
            response: '相手が折れた。でも低評価がついた。目先はセーフだが……信用って何だろう。',
        },
    ],
};

// ケンジのセミナー誘い（Turn 14）
const KENJI_SEMINAR_EVENT = {
    id: 'kenji_seminar',
    type: 'choice',
    character: 'kenji',
    text: [
        'ケンジから連絡が来た。',
        '',
        '「知り合いが "副業で月100万稼ぐ方法" のセミナーやるんだけど、',
        '　一緒に行かない？ 参加費¥30,000。',
        '　これで人生変わるらしいぜ！」',
        '',
        '……¥30,000。それだけあれば、何品仕入れられるだろう。',
    ],
    choices: [
        {
            label: '行かない。自分で考えて動く',
            effect: {},
            response: '「ごめん、今は実践に集中する」。ケンジは残念そうだったが、自分の道を進もう。',
        },
        {
            label: '行く（−¥30,000）',
            effect: { money: -30000 },
            response: '……内容は薄かった。ネットで調べれば分かることばかり。帰り道、ショウさんの言葉を思い出した。「情報より実践だ」。',
        },
    ],
};

// 共同仕入れイベント（タクヤと協力時のみ）
const JOINT_PURCHASE_EVENT = {
    id: 'joint_purchase',
    type: 'choice',
    character: 'takuya',
    text: [
        'タクヤから連絡が来た。',
        '',
        '「閉店セールの情報を掴んだ！',
        '　一人じゃ資金が足りないけど、',
        '　2人で¥50,000ずつ出せばまとめて仕入れて',
        '　大きく利益が出せる。どう？」',
        '',
        '期待リターン：¥80,000〜¥130,000（2ターン後）',
        'リスク：¥50,000を失う可能性もゼロではない。',
    ],
    choices: [
        {
            label: '乗る（−¥50,000、2ターン後にリターン）',
            effect: { jointPurchaseInvested: true },
            response: '¥50,000を投資した。2週間後に結果が出る。うまくいくといいが……。',
        },
        {
            label: '断る（リスク回避）',
            effect: {},
            response: '「ごめん、今はリスクを取れない」。堅実な判断だ。',
        },
    ],
};

// マルシェ常連客イベント
const MARCHE_LOYALTY_EVENT = {
    id: 'marche_regular',
    type: 'story',
    character: 'misaki',
    text: [
        'マルシェで3回目の出店。',
        '顔を覚えてくれたお客さんがいた。',
        '',
        '「毎週楽しみにしてるのよ。来週も来るからね。」',
        '',
        '一度来たお客さんが、また来てくれる。',
        'これが「リピーター」。',
        'Chapter 1のカフェでは、これが生命線になる。',
    ],
    choices: null,
    effect: { marcheHasLoyalty: true },
    unlockLabel: 'マルシェに常連客がついた！売上が安定する。',
};

// 飲み会（ランダム）
const DRINKING_EVENT = {
    id: 'drinking_random',
    type: 'choice',
    character: null,
    text: [
        '友達から連絡が来た。',
        '「今週末、飲まない？」',
    ],
    choices: [
        {
            label: '行く（−¥5,000、来週パフォ+10%）',
            effect: { money: -5000, nextWeekBonus: 0.10 },
            response: '久しぶりに息抜きできた。来週は調子が良さそうだ。',
        },
        {
            label: '断る',
            effect: {},
            response: '今は稼ぐことに集中しよう。',
        },
    ],
};

/**
 * 指定ターンのイベントを取得
 * 優先順序: 固定イベント > マルシェ常連 > 共同仕入れ > 条件付きイベント > ランダム
 */
export function getEventForTurn(turn, state) {
    // ── 固定イベント（最優先） ──
    const fixedEvent = EVENTS.find(e => {
        if (e.turn !== turn) return false;
        if (e.condition && !e.condition(state)) return false;
        return true;
    });
    if (fixedEvent) return fixedEvent;

    // ── 条件付き動的イベント ──

    // マルシェ常連客（出店3回以上、未取得）
    if (turn >= 8 && turn <= 10 && state.marcheSessions >= 3 && !state.marcheHasLoyalty) {
        return { ...MARCHE_LOYALTY_EVENT, turn };
    }

    // 共同仕入れ（Turn 11-15、タクヤと協力関係、固定イベント無い週にフォールバック）
    if (turn >= 11 && turn <= 15 && state.rivalRelation === 'cooperate'
        && !state.jointPurchaseInvested && !state.jointPurchaseAvailable) {
        return { ...JOINT_PURCHASE_EVENT, turn };
    }

    // ミサキ SNS（Turn 6、ミサキ未登場時のみ）
    if (turn === 6 && !state.metCharacters?.includes('misaki')) {
        return { ...MISAKI_SNS_EVENT, turn };
    }

    // リョウタ初任給（Turn 10、シェアハウスイベントと被らない場合）
    if (turn === 10 && state.metCharacters?.includes('ryouta') && !state.hasSharehouse) {
        return { ...RYOUTA_SALARY_EVENT, turn };
    }

    // ケンジのセミナー誘い（Turn 16、目標達成済みなら表示）
    if (turn === 16 && state.metCharacters?.includes('kenji') && state.money >= 300000) {
        return { ...KENJI_SEMINAR_EVENT, turn };
    }

    // せどりクレーム（Turn 9-12、せどり経験あり、15%確率）
    if (turn >= 9 && turn <= 12 && state.sedoriItemsBought >= 5 && Math.random() < 0.15) {
        return { ...SEDORI_CLAIM_EVENT, turn };
    }

    // ランダム飲み会（Phase B以降、12%確率、Turn 7,9,11,13,15のみ）
    if (turn >= 7 && turn % 2 === 1 && Math.random() < 0.12) {
        return { ...DRINKING_EVENT, turn };
    }

    return null;
}

