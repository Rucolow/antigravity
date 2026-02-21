/**
 * Ch.5 — 不動産投資 イベント
 */
import { getCh5Phase } from './ch5Constants';

/* ===== ケンジ不動産アーク（5段階） ===== */
const KENJI_ARC = [
    {
        id: 'kenji_re_1',
        stage: 1,
        turn: { min: 5, max: 10 },
        trigger: (s) => s.turn >= 5 && s.kenjiStage < 1,
        title: 'ケンジ、フルレバで参入',
        character: 'ケンジ',
        text: `ケンジからLINE。
「マンション！ 買った！ フルローン！
　¥30,000,000のRC。自己資金ゼロ。
　表面利回り9%。年間家賃¥2,700,000。
　実質利回り？ そんなのは表面から1%引いときゃいいだろ。
　……え、そんな単純じゃない？ うるさいな。
　とにかく俺は不動産オーナーだ。大家だ。」`,
        choices: [],
        effect: { kenjiStage: 1 },
    },
    {
        id: 'kenji_re_2',
        stage: 2,
        turn: { min: 18, max: 24 },
        trigger: (s) => s.turn >= 18 && s.kenjiStage === 1,
        title: 'ケンジ、管理の現実',
        character: 'ケンジ',
        text: `ケンジ「テナントから"エアコンが壊れた"って連絡来た。
　修理費¥80,000。え、俺が払うの？
　借主が壊したんじゃないの？
　……設備はオーナー負担？ マジか。
　管理会社は"対応しときます"って言うだけで¥50,000。
　サラリーマンの時は故障しても総務に言えばよかった。
　大家ってこんなにめんどくせえのか。」`,
        choices: [],
        effect: { kenjiStage: 2 },
    },
    {
        id: 'kenji_re_3',
        stage: 3,
        turn: { min: 34, max: 40 },
        trigger: (s) => s.turn >= 34 && s.kenjiStage === 2,
        title: 'ケンジ、金利上昇パニック',
        character: 'ケンジ',
        text: `ケンジから電話。声が暗い。
「金利2.0%→2.5%。月返済が¥8,000上がった。
　¥8,000なんて大したことない——って思うだろ？
　俺もそう思った。でも、年間¥96,000。
　しかもフルローンだからローン残高がデカい。
　……DSCR、教えてくれ。俺の物件、いくつだ？
　1.05？ ギリギリ？
　空室1つ出たら返済できないってこと？
　おい、俺、4室中4室埋めないと死ぬのか？」`,
        choices: [],
        effect: { kenjiStage: 3 },
    },
    {
        id: 'kenji_re_4',
        stage: 4,
        turn: { min: 50, max: 56 },
        trigger: (s) => s.turn >= 50 && s.kenjiStage === 3,
        title: 'ケンジ、最大の危機',
        character: 'ケンジ',
        text: `ケンジ「退去出た。2室同時に。
　DSCR 0.85。家賃で返済が賄えない。
　自分の貯金から毎月¥40,000持ち出してる。
　……お前に相談していいか？ マジで。
　笑わないでくれ。頼む。
　俺、不動産で初めて怖いと思った。」`,
        choices: [
            { label: '家賃設定を見直すアドバイスをする', effect: { money: 0, resultText: 'ケンジは家賃を¥5,000下げた。2週間で空室が埋まった。' } },
            { label: 'リノベの提案をする（¥500,000）', effect: { money: -500_000, resultText: 'ケンジのためにリノベ費用を出した。空室はすぐに埋まった。' } },
            { label: '「売却した方がいい」と正直に言う', effect: { money: 0, resultText: 'ケンジは物件を売却した。損は出たが、借金地獄からは脱出した。' } },
        ],
        effect: { kenjiStage: 4 },
    },
    {
        id: 'kenji_re_5',
        stage: 5,
        turn: { min: 66, max: 72 },
        trigger: (s) => s.turn >= 66 && s.kenjiStage === 4,
        title: 'ケンジの復活',
        character: 'ケンジ',
        text: `ケンジ「お前のアドバイス通りにした。
　DSCR 1.25。まだギリだけど、死なない。

　……なあ。俺、いつもお前の後を追ってたよな。
　カフェで失敗して。ECで失敗して。民泊で失敗して。
　不動産でも危なくなった。
　でも全部、お前が先にやってて、俺はそれを見てた。

　追いつけないのはわかってる。
　でも——追いかけることはやめない。
　それが俺のスタイルだ。」`,
        choices: [],
        effect: { kenjiStage: 5 },
    },
];

/* ===== 転機イベント ===== */
const PIVOT_EVENTS = [
    {
        id: 'first_vacancy',
        turn: { min: 12, max: 16 },
        trigger: (s) => s.turn >= 12 && s.properties.length > 0,
        title: '最初の退去通知',
        character: 'ショウ',
        text: `封筒が届いた。"退去届"。

入居8ヶ月。30代の会社員。退去理由：「転勤のため」。

——やめてくれ。

不動産の退去通知は——全部同時に来る。
退去 = 家賃収入ゼロ。退去 = 原状回復費用¥200,000。
退去 = 空室期間2-4ターン。退去 = 「ローンの返済は変わらない」。`,
        characterText: `「不動産で最も恐ろしいのは"退去"だ。
毎月のローン返済は、テナントがいてもいなくても来る。
空室は"沈黙の出血"だ。音がしない。痛くない。
だが、毎月ずつ血が流れる。」`,
        choices: [
            { label: '家賃を¥5,000下げて早期入居を狙う', effect: { money: -200_000, occupancyHit: -1, turnPenalty: 1, resultText: '家賃を下げた結果、1ターンで次のテナントが見つかった。' } },
            { label: '相場のまま募集する（空室2-4ターン）', effect: { money: -250_000, occupancyHit: -1, turnPenalty: 3, resultText: '相場のまま募集した。3ターン後に入居者が決まった。' } },
        ],
        effect: {},
    },
    {
        id: 'interest_rate_hike',
        turn: { min: 40, max: 52 },
        trigger: (s) => s.turn >= 40 && s.loans.some(l => l.rateType === 'variable') && s.interestRateHikes === 0,
        title: '金利上昇',
        text: `日銀の政策変更で、変動金利が0.5%上昇した。

変動金利ローンの月返済額が増加する。
全物件合計で月間返済額が増える。`,
        choices: [
            { label: 'このまま変動金利で様子を見る', effect: { rateHike: 0.005, resultText: '変動金利のまま様子を見ることにした。さらに上昇するリスクがある。' } },
            { label: '固定金利に借り換える（手数料¥300,000）', effect: { money: -300_000, refinanceToFixed: true, resultText: '固定金利に借り換えた。今後の金利不安がなくなった。' } },
            { label: '繰上返済で元本を減らす（¥2,000,000）', effect: { money: -2_000_000, prepayment: 2_000_000, resultText: '繰上返済でローン元本を減らした。月返済額が軽くなった。' } },
        ],
        effect: {},
    },
    {
        id: 'major_repair',
        turn: { min: 48, max: 60 },
        trigger: (s) => s.turn >= 48 && s.properties.some(p => (p.age || 0) >= 12) && !s._triggeredEvents.includes('major_repair'),
        title: '大規模修繕の必要性',
        text: `外壁の劣化が進んでいる。大規模修繕が必要。
放置すると入居率低下と資産価値の下落が見込まれる。

見積もり：
外壁塗装 + 防水工事 + 共用部修繕 = ¥4,500,000`,
        choices: [
            { label: '全面修繕（¥4,500,000）', effect: { money: -4_500_000, repairBoost: true, resultText: '全面修繕を実施。資産価値が維持され、家賃下落を防いだ。' } },
            { label: '最低限修繕（¥1,500,000）', effect: { money: -1_500_000, resultText: '最低限の修繕を行った。3年は持つが根本解決ではない。' } },
        ],
        effect: {},
    },
    {
        id: 'sublease_offer',
        turn: { min: 36, max: 44 },
        trigger: (s) => s.turn >= 36 && s.properties.length > 0 && !s._triggeredEvents.includes('sublease_offer'),
        title: 'サブリース（家賃保証）の提案',
        text: `管理会社がサブリースを提案してきた。
「空室リスクをゼロにします。家賃の85%を毎月保証。
　満室でも空室でも、あなたへの支払いは一定です。」

⚠ ただし2年ごとに家賃見直し条項あり（下げられるリスク）
⚠ 自分で入居者を選べなくなる`,
        choices: [
            { label: 'サブリース契約する（家賃85%保証）', effect: { sublease: true, resultText: 'サブリース契約を結んだ。空室リスクはゼロに。ただし家賃の15%を失った。' } },
            { label: '断る（自主管理を続ける）', effect: { resultText: 'サブリースを断った。空室リスクは自分で負うが、家賃100%を受け取れる。' } },
        ],
        effect: {},
    },
    {
        id: 'lending_limit',
        turn: { min: 60, max: 72 },
        trigger: (s) => s.turn >= 60 && s.totalLiabilities >= 200_000_000 && !s._triggeredEvents.includes('lending_limit'),
        title: '融資の壁',
        text: `金融機関から融資を断られた。
「これ以上の融資は、御社の財務状況では難しい……」

LTV比率が上限に近づいており、追加借入の余地がない。`,
        choices: [
            { label: '既存物件を売却して負債を減らす', effect: { resultText: 'ポートフォリオを見直し、融資枠を回復させる方針に。' } },
            { label: '自己資金（CF蓄積）で次の物件を買う', effect: { resultText: 'レバレッジなしでの拡大を選択。遅いが安全。' } },
        ],
        effect: {},
    },
    // ── フォースドチョイス ──
    {
        id: 'forced_portfolio_strategy',
        turn: { min: 24, max: 24 },
        trigger: (s) => s.turn === 24 && s.properties.length >= 1,
        title: 'ポートフォリオ戦略の転換点',
        text: `2年目に突入。物件運営が安定してきた。\n\nここからどう拡大するかが、不動産投資家としての分岐点。\n「速さ」を取るか「安全」を取るか。`,
        choices: [
            { label: 'レバレッジを効かせて追加物件を狙う', effect: { money: -500000, reputation: 0.15, resultText: 'レバレッジ拡大でスピード重視。DSCR管理がより重要に。攻めの姿勢が吉と出るか。' } },
            { label: 'CF蓄積を優先（自己資金を貯める）', effect: { money: 200000, resultText: '堅実路線を選択。現金比率を高め、次の好機を待つ。' } },
            { label: '今の物件のバリューアップに集中', effect: { reputation: 0.2, resultText: '既存物件の価値向上に注力。家賃アップと空室率改善を目指す。' } },
        ],
        effect: {},
    },
    {
        id: 'forced_exit_planning',
        turn: { min: 48, max: 48 },
        trigger: (s) => s.turn === 48 && s.properties.length >= 1,
        title: '出口戦略の検討',
        text: `4年目。不動産市場が活況で、物件価格が上昇中。\n\n「今売れば利益が出る」——だが、CF収入も捨てがたい。\n\n投資家として最も難しい判断——\n「いつ降りるか」を考えるとき。`,
        choices: [
            { label: '1棟売却して利益確定', effect: { money: 5000000, resultText: '1棟を売却。キャピタルゲインを確定した。ポートフォリオは縮小するが、現金は大幅に増えた。' } },
            { label: '全保有で長期ホールド', effect: { reputation: 0.15, resultText: '売却せず保有を続ける。CFの積み上げを優先。「時間が味方」の戦略。' } },
            { label: '借り換えでCFを改善', effect: { money: -200000, resultText: '既存ローンを借り換え。手数料はかかるが、月々の返済額が軽くなった。' } },
        ],
        effect: {},
    },
];

/* ===== キャラクターイベント ===== */
const CHARACTER_EVENTS = [
    {
        id: 'shou_last_lesson',
        turn: { min: 3, max: 6 },
        trigger: (s) => s.turn >= 3 && !s._triggeredEvents.includes('shou_last_lesson'),
        title: 'ショウの最後の授業',
        character: 'ショウ',
        text: `ショウさんが来た。
「いいか。これが最後の授業だ。
　今まで——カフェのP/Lを読んだ。小売のCF計算書を読んだ。
　宿泊の稼働率を見た。ECのLTV/CACを計算した。

　不動産では、B/S（貸借対照表）を読む。
　P/Lは「いくら儲けたか」。CFは「いくら現金があるか」。
　B/Sは「いくら持っていて、いくら借りているか」。

　——全部同時に見る。最後のステージだけのことはある。」`,
        choices: [],
        effect: {},
    },
    {
        id: 'shou_antigravity',
        turn: { min: 5, max: 8 },
        trigger: (s) => s.turn >= 5 && s._triggeredEvents.includes('shou_last_lesson') && !s._triggeredEvents.includes('shou_antigravity'),
        title: 'ANTIGRAVITY ― 意味の回収',
        character: 'ショウ',
        text: `ショウさん：
「レバレッジ。これが最後の授業だ。
　借金は重力だ。だが、使い方次第で推進力になる。
　それを"反重力"と呼ぶ。

　——それがANTIGRAVITY。」`,
        choices: [],
        effect: {},
    },
    {
        id: 'aya_property_manager',
        turn: { min: 1, max: 3 },
        trigger: (s) => s.ayaFromCh4 && s.turn >= 1 && !s._triggeredEvents.includes('aya_property_manager'),
        title: 'アヤ、物件管理の右腕に',
        character: 'アヤ',
        text: `アヤさん「不動産、初めてですけど、
　人と向き合うのは得意です。
　テナントさんの対応、私に任せてください。」`,
        choices: [],
        effect: {},
    },
    {
        id: 'aya_retention',
        turn: { min: 15, max: 20 },
        trigger: (s) => s.ayaFromCh4 && s.turn >= 15 && !s._triggeredEvents.includes('aya_retention'),
        title: 'アヤの退去防止力',
        character: 'アヤ',
        text: `202号室のテナントから、ため息混じりの一言。
「隣の部屋の足音が気になるんですけど……」

アヤ「社長、これ、退去フラグです。
　カフェの時、常連さんが来なくなる直前の表情を覚えてますか？
　同じです。"言わないけど不満がある"。
　先に対応します。隣の部屋にスリッパとラグを提案します。」

2ヶ月後。202号室のテナントは更新を決めた。
スリッパとラグの原価：¥3,000。退去を防いだ価値：¥350,000。`,
        choices: [],
        effect: { money: -3000 },
    },
    {
        id: 'misaki_visit',
        turn: { min: 28, max: 35 },
        trigger: (s) => s.turn >= 28 && !s._triggeredEvents.includes('misaki_visit'),
        title: 'ミサキ、物件を見に来る',
        character: 'ミサキ',
        text: `ミサキさん「不動産王じゃん！ 物件見せてよ。
　私もいつか投資してみたいんだよね。」`,
        choices: [],
        effect: {},
    },
    {
        id: 'takuya_invest',
        turn: { min: 38, max: 45 },
        trigger: (s) => s.turn >= 38 && !s._triggeredEvents.includes('takuya_invest'),
        title: 'タクヤ「一緒に投資しようぜ」',
        character: 'タクヤ',
        text: `タクヤ「ECの利益で不動産始めたい。
　お前のポートフォリオ見せてくれよ。
　俺も"レバレッジ"ってやつを使いたい。」`,
        choices: [],
        effect: {},
    },
    {
        id: 'ryota_respect',
        turn: { min: 48, max: 55 },
        trigger: (s) => s.turn >= 48 && !s._triggeredEvents.includes('ryota_respect'),
        title: 'リョウタ「教えてくれ」',
        character: 'リョウタ',
        text: `リョウタ「お前、不動産までやってるのか。
　俺はまだ会社員だよ。すごいな。
　……いつか俺にも教えてくれよ。

　有給でドバイ行ったけど、パームジュメイラのマンション1億とかするの。
　お前の不動産の方がまだ現実的だな。
　……でも俺は有給でドバイ行けて、お前は行けない。
　どっちが勝ちかは……わからん。」`,
        choices: [],
        effect: {},
    },
    {
        id: 'aya_confession',
        turn: { min: 72, max: 80 },
        trigger: (s) => s.ayaFromCh4 && s.turn >= 72 && !s._triggeredEvents.includes('aya_confession'),
        title: 'アヤの告白',
        character: 'アヤ',
        text: `アヤ「社長……ひとつ聞いてもいいですか。
　私、いつか自分でも何か始めたいんです。
　カフェかもしれない。小さな、6席くらいの。

　……笑わないでくれますか？
　"数字が苦手なのに"って思いましたか？
　でも——社長の隣で、5つの事業を見てきました。
　P/Lも、CFも、B/Sも、少しはわかります。

　今度は私が、自分の名前で。」`,
        choices: [],
        effect: {},
    },
];

/* ===== カオスイベント ===== */
const CHAOS_EVENTS = [
    {
        id: 'youtube_tenant',
        turn: { min: 24, max: 36 },
        trigger: (s) => s.turn >= 24 && s.properties.some(p => p.totalUnits >= 4) && !s._triggeredEvents.includes('youtube_tenant'),
        probability: 0.15,
        title: 'テナントがYouTubeスタジオに',
        text: `203号室のテナントから騒音クレーム。
原因：201号室。調査したところ、
部屋をYouTubeスタジオに改造していた。

防音パネル設置。照明機材。グリーンバック。
契約書には「居住用」と書いてある。

ただし、チャンネル登録者12万人。
「このアパートから配信してます！」と動画内で紹介。
物件の知名度は上がっている。`,
        choices: [
            { label: '契約違反で退去勧告', effect: { occupancyHit: -1, resultText: '退去勧告を出した。空室が1つ発生したが、ルールは守られた。' } },
            { label: 'SOHO可に契約変更（家賃+¥10,000）', effect: { rentBoost: 10_000, resultText: '「SOHO可」に変更。家賃もアップし、win-winの関係に。' } },
            { label: '物件のプロモーションを依頼する', effect: { money: -30_000, occupancyBoost: true, resultText: '月¥30,000の広告契約を結んだ。物件の知名度が上がり、空室が減った。' } },
        ],
        effect: {},
    },
    {
        id: 'underground_relic',
        turn: { min: 40, max: 52 },
        trigger: (s) => s.turn >= 40 && s.properties.length >= 2 && !s._triggeredEvents.includes('underground_relic'),
        probability: 0.10,
        title: '地中から何か出てきた',
        text: `新しく取得した物件の庭を掘ったら、
古い井戸が出てきた。
さらに掘ったら、江戸時代の陶器が出てきた。

文化財保護法に引っかかる可能性が浮上。
工事が3ヶ月ストップ。
ただし、自治体から「歴史的建造物」の認定を受けると
固定資産税が50%減免される。`,
        choices: [
            { label: '自治体に報告する（工事遅延。税優遇の可能性）', effect: { money: -300_000, taxBreak: true, resultText: '報告した結果、固定資産税50%減免の認定を受けた。長期的にはプラス。' } },
            { label: '「歴史ある物件」としてブランディングに活用', effect: { money: -100_000, rentBoost: 5_000, resultText: '「歴史ある物件」としてPRした。物件のブランド価値が上がった。' } },
        ],
        effect: {},
    },
];

/* ===== マイルストーン ===== */
const MILESTONE_EVENTS = [
    {
        id: 'bs_first_display',
        turn: { min: 20, max: 28 },
        trigger: (s) => s.turn >= 20 && !s._triggeredEvents.includes('bs_first_display'),
        title: 'B/S（貸借対照表）初登場',
        character: 'ショウ',
        text: `ショウさんが来た。
「お前に見せたいものがある。座れ。」

画面に表示されたもの——
P/Lではない。CF計算書でもない。
見たことのない形をしている。

左に「資産」。右に「負債」と「純資産」。
そして——左右の合計が一致している。`,
        characterText: `「これがB/S。貸借対照表。
お前の全財産が、この1枚に映っている。

資産 — すごい数字に見えるが、
その大部分は"借りている"お金だ。
本当にお前のものは——純資産だけ。

でも、この純資産の自己資金で
何倍もの資産をコントロールしている。
これがレバレッジの力だ。
借金は重力——だが、使い方次第で推進力になる。」`,
        choices: [],
        effect: { showBS: true },
    },
    {
        id: 'total_assets_100m',
        turn: { min: 30, max: 60 },
        trigger: (s) => s.totalAssets >= 100_000_000 && !s._triggeredEvents.includes('total_assets_100m'),
        title: '総資産¥100,000,000突破',
        text: `総資産1億。
すごい数字に見えるが、そのうち多くは借金。
本当の資産（純資産）はまだ目標の途中。

B/Sを読めないと、この違いに気づかない。`,
        choices: [],
        effect: {},
    },
    {
        id: 'depreciation_expire_warning',
        turn: { min: 58, max: 70 },
        trigger: (s) => s.properties.some(p => (p.remainingUsefulLife || 99) <= 3) && !s._triggeredEvents.includes('depreciation_expire_warning'),
        title: '減価償却「魔法の消滅」',
        character: 'ショウ',
        text: `⚠ ダッシュボードに警告が出た。
物件の減価償却が残りわずかで終了する。`,
        characterText: `「お前は今まで毎年、"経費"としてお金を使わずに計上してきた。
これで税金が安くなっていた。

もうすぐ——この魔法が消える。

同じ家賃、同じ運営なのに——課税所得が増える。税金が増える。

対策は3つ。
① 新しい物件を買って新たな減価償却を作る
② この物件を売却する
③ 大規模修繕で追加の減価償却を発生させる

減価償却は"税金の消滅"ではない。"税金の先送り"だ。
いつか必ず追いかけてくる。それでも使う価値がある。
"今"の¥545,000と"5年後"の¥545,000は、同じ金額でも"重さ"が違うからだ。」`,
        choices: [],
        effect: {},
    },
];

/* ===== 人間関係（テキストのみ） ===== */
const HUMAN_EVENTS = [
    {
        id: 'owner_loneliness',
        turn: { min: 14, max: 22 },
        trigger: (s) => s.turn >= 14 && !s._triggeredEvents.includes('owner_loneliness'),
        probability: 0.5,
        title: '深夜の電話',
        text: `深夜1時。電話が鳴る。
管理会社の緊急連絡先——自分だ。

「101号室の方が、鍵をなくしたそうです。
　合鍵を持ってきてくれませんか。」

深夜1時に鍵を届ける。車で15分。鍵を渡す。「すみません」と言われる。帰る。

カフェは閉店後は自由だった。
ECは画面を閉じれば終わりだった。
不動産は——建物が「ある」限り、責任は続く。`,
        choices: [],
        effect: {},
    },
    {
        id: 'snow_duty',
        turn: { min: 30, max: 50 },
        trigger: (s) => {
            const month = (s.turn - 1) % 12;
            return (month >= 10 || month <= 1) && !s._triggeredEvents.includes('snow_duty');
        },
        probability: 0.3,
        title: '雪の日の責任',
        character: 'リョウタ',
        text: `大雪予報。

アヤ「社長、物件の前の道路、凍結しそうです。
　入居者さんが転んだら——」

除雪道具を買う。¥5,000。朝6時に物件に行く。雪かきをする。
入居者が出勤する前に終わらせる。
誰も気づかない。それでいい。
大家の仕事の半分は、入居者が気づかない仕事だ。`,
        characterText: `リョウタからLINE（朝8時）：
「雪やべえ。会社は在宅に切り替えたわ。
　お前は？ 家にいるんだろ？
　……え、雪かき？ 朝6時から？
　不動産オーナーって大変なんだな……」`,
        choices: [],
        effect: { money: -5000 },
    },
];

/* ===== 全イベントリスト ===== */
export const CH5_EVENTS = [
    ...KENJI_ARC,
    ...PIVOT_EVENTS,
    ...CHARACTER_EVENTS,
    ...CHAOS_EVENTS,
    ...MILESTONE_EVENTS,
    ...HUMAN_EVENTS,
];

/* ===== イベント抽選 ===== */
export function pickCh5Event(state) {
    const candidates = CH5_EVENTS.filter(e => {
        if (state._triggeredEvents.includes(e.id)) return false;
        if (e.turn && (state.turn < e.turn.min || state.turn > e.turn.max)) return false;
        if (e.trigger && !e.trigger(state)) return false;
        return true;
    });

    if (candidates.length === 0) return null;

    // ── 優先順位1: アヤ合流（確定発火） ──
    const aya = candidates.find(e => e.id === 'aya_property_manager');
    if (aya) return aya;

    // ── 優先順位2: ショウの授業（確定発火。ストーリー必須） ──
    const shou = candidates.find(e => e.id === 'shou_last_lesson' || e.id === 'shou_antigravity');
    if (shou) return shou;

    // ── 優先順位3: ケンジアーク ──
    const kenji = candidates.filter(e => e.id.startsWith('kenji_'));
    if (kenji.length > 0) return kenji[0];

    // ── 優先順位4: マイルストーン（B/S初登場、総資産1億、減価償却警告） ──
    const milestones = candidates.filter(e => MILESTONE_EVENTS.some(m => m.id === e.id));
    if (milestones.length > 0) return milestones[0];

    // ── 優先順位5: 転機イベント（退去、金利上昇、修繕 etc.） ──
    const pivots = candidates.filter(e => PIVOT_EVENTS.some(p => p.id === e.id));
    if (pivots.length > 0) return pivots[0];

    // ── 優先順位6: 確定キャラクターイベント（確率フィルタなし） ──
    const charEvents = candidates.filter(e =>
        CHARACTER_EVENTS.some(c => c.id === e.id) &&
        e.id !== 'aya_property_manager'   // アヤは優先順位1で処理済み
    );
    if (charEvents.length > 0) return charEvents[0];

    // ── 優先順位7: カオス・人間関係（確率判定付き） ──
    const probabilistic = candidates.filter(e => e.probability);
    for (const e of probabilistic) {
        if (Math.random() < e.probability) return e;
    }

    // ── 優先順位8: その他の残り ──
    const remaining = candidates.filter(e =>
        !e.probability &&
        !e.id.startsWith('kenji_') &&
        !MILESTONE_EVENTS.some(m => m.id === e.id) &&
        !PIVOT_EVENTS.some(p => p.id === e.id) &&
        !CHARACTER_EVENTS.some(c => c.id === e.id)
    );
    if (remaining.length > 0) return remaining[Math.floor(Math.random() * remaining.length)];

    return null;
}

/* ===== スキル判定 ===== */
export function evaluateCh5Skills(state) {
    const skills = [];
    if (state.properties.length >= 3) skills.push('ポートフォリオ思考');
    if (state.ltvRatio <= 70 && state.properties.length >= 2) skills.push('レバレッジ感覚');
    if (state.totalAnnualDepreciation > 0 && state.properties.length >= 2) skills.push('減価償却マスター');
    if (state.interestRateHikes > 0 && state.monthlyCashFlow > 0) skills.push('金利リスク管理');
    if (state.soldPropertyCount >= 1) skills.push('出口戦略');
    if (state.loanCount >= 3) skills.push('銀行交渉力');
    if (state._triggeredEvents.includes('major_repair')) skills.push('修繕判断力');
    // BS経営はB/S画面を見た回数で判定
    if ((state.bsViewCount || 0) >= 3) skills.push('BS経営');
    // 利回り分析は全Phaseプレイした場合
    if (state.turn >= 60) skills.push('利回り分析');
    // 不動産王 = ゲームクリア
    if (state.netWorth >= 100_000_000) skills.push('不動産王');
    return skills;
}
