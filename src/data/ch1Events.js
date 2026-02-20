// Ch.1 イベントデータ — 設計書 v3 準拠
// 転機5種 + 人間関係4種 + カオス2種 + 税金4種 + ケンジ5段階 + マイルストーン + キャラ

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 転機イベント（Phase B中心）
// ━━━━━━━━━━━━━━━━━━━━━━━━━

export const TURNING_POINT_CHAIN = {
    id: 'chain_competitor',
    type: 'turning_point',
    turnRange: [16, 20],
    title: '大手チェーン出店',
    text: [
        '駅前に大手コーヒーチェーンが出店する。',
        '3ターン後にオープン。来客数−20%の影響が見込まれる。',
    ],
    choices: [
        {
            label: '差別化（スペシャルティ豆に切替）',
            response: 'スペシャルティ豆に切り替えた。原価は上がったが、「ここでしか飲めない味」が武器になる。',
            effect: { reputation: 0.5, priceHikeMult: 1.08, chainCompetitorArrived: true },
        },
        {
            label: '価格対抗（全品¥50値下げ）',
            response: '全品¥50値下げ。客数は維持できそうだが、利益率が下がった。',
            effect: { menuPriceChange: -50, chainCompetitorArrived: true },
        },
        {
            label: '客層変更（営業時間を拡大）',
            response: '客層を変えて勝負する。固定費は上がるが、競合とかぶらない時間帯で戦う。',
            effect: { money: -30000, chainCompetitorArrived: true },
        },
        {
            label: '何もしない',
            response: '競合を受け入れる。来客が減った分、できることに集中する。',
            effect: { chainCompetitorArrived: true },
        },
    ],
    condition: (s) => !s.chainCompetitorArrived,
};

export const TURNING_POINT_STAFF_QUIT = {
    id: 'staff_quit',
    type: 'turning_point',
    turnRange: [20, 28],
    title: 'エース退職',
    text: [
        `スタッフが退職を申し出た。`,
        '「もっと条件のいいところが見つかって……」',
    ],
    choices: [
        {
            label: '昇給で引き留める（人件費+¥20,000/月）',
            response: '昇給を提示した。引き留めに成功！ だが人件費は上がった。',
            effect: { staffRaise: 20000, staffQuitAvoided: true },
            successRate: 0.70,
            failResponse: '昇給を提示したが、「ここに将来性が見えない」と断られた。スタッフが退職した。',
            failEffect: { staffQuitOccurred: true },
        },
        {
            label: '新しいスタッフを探す（2ターンワンオペ）',
            response: '採用開始。2ターンの間はワンオペに戻る。新しい人が来るまでの辛抱だ。',
            effect: { staffQuitOccurred: true, hiringInProgress: true, hiringTurnsLeft: 2 },
        },
        {
            label: 'ワンオペに戻す',
            response: '人件費が消えた。利益率は改善するが、天井も戻る。「小さく堅く」の判断。',
            effect: { staffQuitOccurred: true },
        },
    ],
    condition: (s) => s.staff.length > 0 && !s.staffQuitOccurred,
};

export const TURNING_POINT_EQUIPMENT = {
    id: 'equipment_degrade',
    type: 'turning_point',
    turnRange: [28, 36],
    title: '設備老朽化',
    text: [
        'エスプレッソマシンの調子が悪い。',
        '修理なら¥80,000。新品に買い替えなら¥400,000。',
        'このまま使い続けることもできるが、品質が下がるかもしれない。',
    ],
    choices: [
        {
            label: '修理する（¥80,000）',
            response: '修理完了。品質は維持。ただあ3ヶ月後にまた壊れるかもしれない。',
            effect: { money: -80000 },
        },
        {
            label: '新品購入（¥400,000）',
            response: '最新マシンを導入。品質UP。5年は持つ。大きな投資だが、品質は上がった。',
            effect: { money: -400000, reputation: 0.3, equipmentDegradation: -2 },
        },
        {
            label: '中古を買う（¥150,000）',
            response: '中古マシンを購入。品質維持。2年は持つだろう。',
            effect: { money: -150000 },
        },
        {
            label: 'そのまま使う',
            response: 'そのまま使い続ける。品質が少しずつ下がっていく。',
            effect: { equipmentDegraded: true, equipmentDegradation: 1 },
        },
    ],
    condition: (s) => !s.equipmentDegraded && s.turn >= 28,
};

export const TURNING_POINT_PRICE_HIKE = {
    id: 'price_hike',
    type: 'turning_point',
    turnRange: [22, 32],
    title: '原材料高騰',
    text: [
        '豆の卸値が15%上がった。',
        'このままだと原価率が悪化する。',
    ],
    choices: [
        {
            label: 'メニュー値上げ（全品+¥50）',
            response: '値上げを実施。客数が少し減るかもしれないが、利益率は守れる。',
            effect: { menuPriceChange: 50, reputation: -0.1 },
        },
        {
            label: '豆のグレードを下げる',
            response: '原価率は維持できるが、味が変わった。常連は気づくかもしれない。',
            effect: { reputation: -0.3 },
        },
        {
            label: '仕入先を変える（2ターンかかる）',
            response: '新しいロースターを探す。2ターン後に結果が出る。',
            effect: { supplierChanged: true, supplierChangeTurnsLeft: 2 },
        },
        {
            label: 'そのまま吸収する',
            response: '利益率は下がるが、客には影響なし。体力勝負だ。',
            effect: { priceHikeOccurred: true, priceHikeMult: 1.15 },
        },
    ],
    condition: (s) => !s.priceHikeOccurred,
};

export const TURNING_POINT_MEDIA = {
    id: 'media_offer',
    type: 'turning_point',
    turnRange: [18, 28],
    title: 'メディア掲載',
    text: [
        '地元の情報誌から取材の依頼が来た。',
        '掲載されれば一時的に来客が2倍になるが、',
        '対応できなければ悪評がつく可能性もある。',
    ],
    choices: [
        {
            label: '受ける',
            response: '取材OK！ 来週から2ターン、来客が爆増する。品質を維持できるかが勝負。',
            effect: { mediaActive: true, mediaTurnsLeft: 2 },
        },
        {
            label: '断る',
            response: '取材をお断りした。今の規模を安定させることを優先する。',
            effect: {},
        },
        {
            label: '受けて臨時スタッフを増やす',
            response: '取材OKし、臨時スタッフも手配。人件費+¥50,000/ターンだが品質も維持。',
            effect: { mediaActive: true, mediaTurnsLeft: 2, money: -100000 },
        },
    ],
    condition: (s) => s.reputation >= 3.5 && !s.mediaActive,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 人間関係イベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━

export const HUMAN_REGULAR_GIFT = {
    id: 'regular_gift',
    type: 'human',
    title: '常連からの差し入れ',
    text: [
        '常連の田中さんが花を持ってきてくれた。',
        '「いつもおいしいコーヒーをありがとう。',
        '　これ、庭に咲いたやつ。飾ってよ。」',
    ],
    choices: null, // テキストのみ
    effect: { reputation: 0.1 },
    condition: (s) => s.reputation >= 3.5 && Math.random() < 0.10,
};

export const HUMAN_CLAIMER = {
    id: 'claimer',
    type: 'human',
    title: 'クレーマー',
    text: [
        'お客さんから厳しいクレーム。',
        '「この味でこの値段は高い。二度と来ない。」',
        '口コミサイトに★1のレビューを書かれた。',
    ],
    choices: [
        {
            label: '丁寧に返信する',
            response: '真摯に返信した。ダメージは最小限に。時間はかかったが、信頼は守れた。',
            effect: { reputation: -0.1 },
        },
        {
            label: '無視する',
            response: '無視した。★1のレビューがしばらく残る。',
            effect: { reputation: -0.3 },
        },
        {
            label: '菓子折りを送る（¥3,000）',
            response: '菓子折りを送った。少し気まずいが、誠意は伝わったかもしれない。',
            effect: { money: -3000, reputation: -0.05 },
        },
    ],
    condition: (s) => Math.random() < 0.05,
};

export const HUMAN_FORMER_BOSS = {
    id: 'former_boss',
    type: 'human',
    turnRange: [28, 32],
    character: 'shou',
    title: '元店長からの連絡',
    text: [
        '閉店したカフェの店長から連絡が来た。',
        '「お前が店を出したって聞いたよ。',
        '　俺の失敗を繰り返すなよ。',
        '　月商120万でも経費が125万なら死ぬんだ。',
        '　……お前なら大丈夫だ。頑張れ。」',
    ],
    choices: null,
    condition: (s) => s.ch0JobType === 'cafe',
};

export const HUMAN_WEDDING = {
    id: 'wedding_party',
    type: 'human',
    turnRange: [38, 42],
    title: '結婚パーティの会場依頼',
    text: [
        'お客さんから相談。',
        '「来月、ここで結婚パーティをやらせてもらえませんか？',
        '　貸切で。予算は¥150,000。」',
    ],
    choices: [
        {
            label: '受ける（¥150,000の売上、1日休業）',
            response: '結婚パーティを開催。¥150,000の売上。お客さんの幸せそうな顔が嬉しい。',
            effect: { money: 150000, reputation: 0.2 },
        },
        {
            label: '断る（通常営業を優先）',
            response: '通常営業を優先した。安定した売上を守る判断。',
            effect: {},
        },
    ],
    condition: (s) => s.reputation >= 4.0,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// カオスイベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━

export const CHAOS_STARBUCKS = {
    id: 'starbucks_next_door',
    type: 'chaos',
    turnRange: [18, 22],
    title: '隣にスタバができる',
    text: [
        '……は？',
        '',
        '隣のテナントにスターバックスが入ることが決まった。',
        'コーヒー1杯¥500のお前の店の隣に、',
        '「世界最強のカフェチェーン」が来る。',
        '',
        '来月オープン。',
    ],
    choices: [
        {
            label: '「勝てるわけないだろ」と絶望する',
            response: '1ターン何もできなかった。でも3ターン後——スタバ効果で通りの人流が1.5倍に。スタバに来た客の12%がこっちにも来た。',
            effect: { _skipNextTurn: true },
        },
        {
            label: 'スタバと真逆の路線で差別化（¥200,000）',
            response: 'メニューを大改造。スタバにない体験を提供する。差別化成功！来客+20%。',
            effect: { money: -200000, reputation: 0.5 },
        },
        {
            label: 'スタバ客をハシゴさせる作戦',
            response: '「スタバ帰りに寄るとデザート半額」作戦。スタバ客の8%が流れてきた。賢い。',
            effect: { reputation: 0.2 },
        },
        {
            label: 'むしろスタバ前でチラシを配る',
            response: 'スタバの店長に怒られた。だが一部の客が「面白い」と来店。来客+5%、評判−0.2。',
            effect: { reputation: -0.2 },
        },
    ],
    condition: (s) => !s.chainCompetitorArrived,
};

export const CHAOS_FOOD_SCARE = {
    id: 'food_scare',
    type: 'chaos',
    turnRange: [28, 36],
    title: '食中毒「疑惑」',
    text: [
        'お客さんから電話。',
        '「昨日そちらで食べた後、お腹壊したんですけど……」',
        '',
        '保健所に連絡された。',
        '※ 実際には食中毒ではなかった。',
        '※ だが「調査中」の間、噂が広まる。',
    ],
    choices: [
        {
            label: '全食材を入れ替え（¥80,000）',
            response: '万全を期して全食材を入れ替え。「安心安全」をアピール。評判への影響は最小限。',
            effect: { money: -80000, reputation: -0.1 },
        },
        {
            label: 'SNSで「検査結果は問題なし」と発信',
            response: Math.random() < 0.5
                ? '発信が拡散。「ちゃんと対応してる」と好意的な反応。評判ダメージなし。'
                : '発信が炎上。「本当は隠してるんじゃ？」と余計に悪化。',
            effect: { reputation: Math.random() < 0.5 ? 0 : -0.5 },
        },
        {
            label: '何もしない。事実は味方だ',
            response: '正しいが、客は「事実」では動かない。来客が減った。',
            effect: { reputation: -0.3 },
        },
    ],
    condition: (s) => s.menu.some(m => m.category === 'food'),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// 税金イベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━

export function createTaxEvent(state) {
    const yearlyIncome = state.totalProfit > 0 ? state.totalProfit : 0;
    const blueDeduction = state.blueFilingEnabled ? 650000 : 0;
    const basicDeduction = 480000;
    const socialInsurance = 360000;
    const taxableIncome = Math.max(0, yearlyIncome - blueDeduction - basicDeduction - socialInsurance);

    // 所得税（簡易計算）
    let incomeTax = 0;
    if (taxableIncome <= 1950000) incomeTax = taxableIncome * 0.05;
    else if (taxableIncome <= 3300000) incomeTax = taxableIncome * 0.10 - 97500;
    else if (taxableIncome <= 6950000) incomeTax = taxableIncome * 0.20 - 427500;
    else incomeTax = taxableIncome * 0.23 - 636000;
    incomeTax = Math.floor(incomeTax);
    const reconstructionTax = Math.floor(incomeTax * 0.021);

    // 住民税
    const residentTax = Math.floor(taxableIncome * 0.10);

    // 事業税（事業所得290万超）
    const businessTax = yearlyIncome > 2900000 ? Math.floor((yearlyIncome - 2900000) * 0.05) : 0;

    // 国保
    const healthInsurance = Math.floor(Math.min(yearlyIncome * 0.11, 1060000));

    const totalTax = incomeTax + reconstructionTax + residentTax + businessTax + healthInsurance;

    return {
        yearlyIncome,
        taxableIncome,
        incomeTax,
        reconstructionTax,
        residentTax,
        businessTax,
        healthInsurance,
        totalTax,
        blueDeduction,
    };
}

export const TAX_FILING = {
    id: 'tax_filing',
    type: 'tax',
    turn: 24,
    title: '確定申告の季節',
    getText: (tax) => [
        '【年次イベント】確定申告の季節',
        '',
        `売上高　　　　¥${tax.yearlyIncome.toLocaleString()}`,
        `課税所得　　　¥${tax.taxableIncome.toLocaleString()}`,
        tax.blueDeduction > 0 ? `（青色申告特別控除 −¥${tax.blueDeduction.toLocaleString()}）` : '',
        '',
        `所得税　　　　¥${tax.incomeTax.toLocaleString()}`,
        `復興特別所得税 ¥${tax.reconstructionTax.toLocaleString()}`,
        '',
        '⚠️ 今後届く税金の予告：',
        `　6月：住民税 約¥${tax.residentTax.toLocaleString()}/年`,
        `　8月：個人事業税 約¥${tax.businessTax.toLocaleString()}`,
        `　毎月：国保 約¥${tax.healthInsurance.toLocaleString()}/年`,
        '',
        `合計税負担：約¥${tax.totalTax.toLocaleString()}`,
    ],
    choices: [
        {
            label: '納税する',
            effect: { taxType: 'income' },
        },
    ],
};

export const TAX_RESIDENT = {
    id: 'tax_resident',
    type: 'tax',
    turn: 37,
    title: '住民税通知',
    getText: (amount) => [
        '住民税の通知が届いた。',
        `前年の事業所得に対して、年額¥${amount.toLocaleString()}。`,
        '4回に分けて支払う。第1回は今月。',
    ],
};

export const TAX_BUSINESS = {
    id: 'tax_business',
    type: 'tax',
    turn: 38,
    title: '個人事業税',
    getText: (amount) => [
        '個人事業税の通知。',
        `¥${amount.toLocaleString()}。`,
        '事業税には青色申告控除が効かない。',
        '所得税とは別の計算。',
    ],
};

export const TAX_HEALTH_INSURANCE = {
    id: 'tax_health',
    type: 'tax',
    turn: 39,
    title: '国保の急騰',
    getText: (amount) => [
        '国民健康保険料の決定通知。',
        `年額¥${amount.toLocaleString()}。`,
        '所得が増えると保険料も増える。',
    ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// ケンジ5段階アーク
// ━━━━━━━━━━━━━━━━━━━━━━━━━

export const KENJI_ARC = [
    {
        stage: 1,
        turnRange: [5, 8],
        title: '全盛期',
        text: [
            'ケンジもカフェを開いた。駅前の路面店。',
            '内装にこだわり、InstagramでPR開始。',
            '「俺は最初から攻めるよ。守りに入ったら負けだ。」',
        ],
    },
    {
        stage: 2,
        turnRange: [13, 16],
        title: '違和感',
        text: [
            'ケンジのカフェ、インスタは賑わっている。',
            'でも、「原価率って何？」とLINEで聞いてきた。',
            '……知らないでやってたのか。',
        ],
    },
    {
        stage: 3,
        turnRange: [24, 28],
        title: '焦り',
        text: [
            'ケンジから久しぶりの連絡。',
            '「なんか売上あるのに金ないんだよね……」',
            '「確定申告とかやった？ 俺やってないんだけど」',
            '',
            '……P&Lを見ていない。それが全てだ。',
        ],
    },
    {
        stage: 4,
        turnRange: [36, 40],
        title: '末期',
        text: [
            'ケンジのインスタ、更新が減っている。',
            '直接聞いたら——',
            '「家賃が払えなくて……大家に待ってもらってる」',
            '「でも来月にはバズるから大丈夫」',
            '',
            '……大丈夫じゃない。',
        ],
    },
    {
        stage: 5,
        turnRange: [44, 48],
        title: '閉店',
        text: [
            'ケンジのSNSが3日間更新されなかった。',
            '',
            '……「閉店のお知らせ」が投稿された。',
            '「資金繰りが厳しくなりました。',
            '　応援してくれた皆さん、ありがとう。」',
            '',
            '売上はあった。客も来ていた。',
            'でも、利益が出ていなかった。',
            '',
            '——P&Lを見ていなかったのかもしれない。',
        ],
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// キャラクターイベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━

export const CHARACTER_EVENTS = [
    {
        id: 'misaki_visit',
        type: 'character',
        character: 'misaki',
        turnRange: [7, 9],
        title: 'ミサキ来店',
        text: [
            'バイト先の先輩だったミサキさんが、カフェに来てくれた。',
            '「え、ここお前の店？ すごいじゃん。コーヒーちょうだい。',
            '　……うん、美味い。でもさ、看板が見えにくいよ。',
            '　外からだとカフェってわかんないかも。」',
        ],
        effect: { reputation: 0.1 },
    },
    {
        id: 'misaki_friends',
        type: 'character',
        character: 'misaki',
        turnRange: [28, 32],
        title: 'ミサキが友人を連れてくる',
        text: [
            'ミサキさんが友人5人を連れて来店。',
            '「ここのコーヒー本当に美味しいから。',
            '　みんなに教えたかったの。」',
        ],
        effect: { _tempCustomerMult: 1.20 },
    },
    {
        id: 'shou_advice',
        type: 'character',
        character: 'shou',
        turnRange: [34, 36],
        title: 'ショウさんからメッセージ',
        text: [
            'ショウさんからメッセージ。',
            '「EXIT考えてる？ 作った物を売るのも経営の判断だ。',
            '　自分の店に固執しすぎるな。',
            '　……次のステージで待ってるぞ。」',
        ],
    },
    {
        id: 'ryouta_holiday',
        type: 'character',
        character: 'ryouta',
        turnRange: [18, 22],
        title: 'リョウタの有給報告',
        text: [
            'リョウタからLINE。',
            '「有給で箱根行ってきた♨️',
            '　お前、最後に休んだのいつ？',
            '　……え、開業してから一回も？ マジ？ｗ」',
        ],
    },
    {
        id: 'aya_loyalty',
        type: 'character',
        character: 'aya',
        turnRange: [38, 42],
        title: 'アヤの決意',
        text: [
            'アヤさんが相談がある、と。',
            '「もしお店を辞める時が来たら、私も連れて行ってください。',
            '　次の事業でも一緒に働きたいです。」',
        ],
        condition: (s) => s.staff.length > 0,
    },
    {
        id: 'misaki_insta',
        type: 'character',
        character: 'misaki',
        turnRange: [7, 9],
        title: 'ミサキのインスタ投稿',
        text: [
            'ミサキさんがインスタに投稿。',
            '「友達のカフェ♡ 雰囲気最高♡ #隠れ家カフェ #穴場」',
            '',
            '……「穴場」と書かれた瞬間、穴場ではなくなる。',
            'でも来客+15%。ありがたい。矛盾してる。',
        ],
        effect: { _tempCustomerMult: 1.15 },
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// ワンオペ天井イベント
// ━━━━━━━━━━━━━━━━━━━━━━━━━

export const ONEOPE_CEILING = {
    id: 'oneope_ceiling',
    type: 'milestone',
    title: 'ワンオペの天井',
    getText: (turnedAway) => [
        `今週、${turnedAway}人のお客さんをお断りしました。`,
        '席が満席で、入れなかった人たちです。',
        '',
        'ワンオペの提供上限に近づいている。',
        '売上に天井が見え始めた。',
    ],
    choices: [
        {
            label: 'スタッフを雇う（パート ¥120,000/月）',
            response: '提供上限が2倍に。ただし損益分岐点も上がる。',
            effect: { hire: 'part' },
        },
        {
            label: 'テイクアウトを始める',
            response: '席を使わず提供可能。上限+30%。ただしリピート率は下がる。',
            effect: { takeoutEnabled: true },
        },
        {
            label: '現状維持',
            response: '利益率を優先する。天井は受け入れる。「小さく堅く」の経営判断。',
            effect: {},
        },
    ],
    condition: (s) => s.capacityUtilization > 0.80 && s.staff.length === 0,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// イベント選択ロジック
// ━━━━━━━━━━━━━━━━━━━━━━━━━

const ALL_TURNING_POINTS = [
    TURNING_POINT_CHAIN,
    TURNING_POINT_STAFF_QUIT,
    TURNING_POINT_EQUIPMENT,
    TURNING_POINT_PRICE_HIKE,
    TURNING_POINT_MEDIA,
];

const ALL_HUMAN_EVENTS = [
    HUMAN_REGULAR_GIFT,
    HUMAN_CLAIMER,
    HUMAN_FORMER_BOSS,
    HUMAN_WEDDING,
];

const ALL_CHAOS_EVENTS = [
    CHAOS_STARBUCKS,
    CHAOS_FOOD_SCARE,
];

export function getCh1EventForTurn(turn, state) {
    // ケンジアーク（固定タイミング）
    const kenjiEvent = KENJI_ARC.find(k =>
        k.stage === state.kenjiStage + 1 &&
        turn >= k.turnRange[0] && turn <= k.turnRange[1]
    );
    if (kenjiEvent) {
        return {
            id: `kenji_stage_${kenjiEvent.stage}`,
            type: 'kenji',
            character: 'kenji',
            title: `ケンジ — ${kenjiEvent.title}`,
            text: kenjiEvent.text,
            choices: null,
            _kenjiStage: kenjiEvent.stage,
        };
    }

    // 税金イベント（固定ターン）
    if (turn === TAX_FILING.turn && state.totalProfit > 0) {
        const tax = createTaxEvent(state);
        return {
            id: TAX_FILING.id,
            type: 'tax',
            title: TAX_FILING.title,
            text: TAX_FILING.getText(tax),
            choices: [{ label: '納税する', effect: { money: -(tax.incomeTax + tax.reconstructionTax) }, response: `所得税¥${(tax.incomeTax + tax.reconstructionTax).toLocaleString()}を納付した。` }],
            _taxData: tax,
        };
    }
    if (turn === TAX_RESIDENT.turn) {
        const tax = createTaxEvent(state);
        if (tax.residentTax > 0) {
            return {
                id: TAX_RESIDENT.id, type: 'tax', title: TAX_RESIDENT.title,
                text: TAX_RESIDENT.getText(tax.residentTax),
                choices: [{ label: '支払う', effect: { money: -Math.floor(tax.residentTax / 4) }, response: `住民税第1回 ¥${Math.floor(tax.residentTax / 4).toLocaleString()}を支払った。` }],
            };
        }
    }
    if (turn === TAX_BUSINESS.turn) {
        const tax = createTaxEvent(state);
        if (tax.businessTax > 0) {
            return {
                id: TAX_BUSINESS.id, type: 'tax', title: TAX_BUSINESS.title,
                text: TAX_BUSINESS.getText(tax.businessTax),
                choices: [{ label: '支払う', effect: { money: -tax.businessTax }, response: `事業税¥${tax.businessTax.toLocaleString()}を支払った。` }],
            };
        }
    }
    if (turn === TAX_HEALTH_INSURANCE.turn) {
        const tax = createTaxEvent(state);
        if (tax.healthInsurance > 0) {
            return {
                id: TAX_HEALTH_INSURANCE.id, type: 'tax', title: TAX_HEALTH_INSURANCE.title,
                text: TAX_HEALTH_INSURANCE.getText(tax.healthInsurance),
                choices: [{ label: '支払う', effect: { money: -Math.floor(tax.healthInsurance / 12) }, response: `国保¥${Math.floor(tax.healthInsurance / 12).toLocaleString()}を支払った。` }],
            };
        }
    }

    // ワンオペ天井（条件付き）
    if (ONEOPE_CEILING.condition(state) && turn >= 13) {
        return {
            ...ONEOPE_CEILING,
            text: ONEOPE_CEILING.getText(state.customersTurnedAway),
        };
    }

    // キャラクターイベント（固定タイミング）
    for (const ev of CHARACTER_EVENTS) {
        if (turn >= ev.turnRange[0] && turn <= ev.turnRange[0] + 1) {
            if (!state._triggeredEvents?.includes(ev.id)) {
                return { ...ev, choices: null };
            }
        }
    }

    // 転機イベント（確率＋条件＋重複防止）
    if (Math.random() < 0.25) {
        const triggered = state._triggeredEvents || [];
        const available = ALL_TURNING_POINTS.filter(e =>
            e.condition(state) &&
            !triggered.includes(e.id) &&
            turn >= e.turnRange[0] && turn <= e.turnRange[1]
        );
        if (available.length > 0) {
            const event = available[Math.floor(Math.random() * available.length)];
            return { ...event };
        }
    }

    // 人間関係イベント（確率＋条件＋重複防止）
    if (Math.random() < 0.15) {
        const triggered = state._triggeredEvents || [];
        const available = ALL_HUMAN_EVENTS.filter(e => {
            if (triggered.includes(e.id)) return false;
            if (e.turnRange && (turn < e.turnRange[0] || turn > e.turnRange[1])) return false;
            return e.condition ? e.condition(state) : true;
        });
        if (available.length > 0) {
            const event = available[Math.floor(Math.random() * available.length)];
            return { ...event };
        }
    }

    // カオスイベント（確率＋条件＋重複防止）
    if (Math.random() < 0.08) {
        const triggered = state._triggeredEvents || [];
        const available = ALL_CHAOS_EVENTS.filter(e =>
            e.condition(state) &&
            !triggered.includes(e.id) &&
            turn >= e.turnRange[0] && turn <= e.turnRange[1]
        );
        if (available.length > 0) {
            const event = available[Math.floor(Math.random() * available.length)];
            return { ...event };
        }
    }

    return null;
}
