import { useState } from 'react';
import { useGameStore } from '../store/gameEngine';

/* ── ショウ出資ティア ── */
const INVESTMENT_TIERS = [
    {
        amount: 1000000,
        label: '¥100万',
        desc: '小さい店だけど、自分の力で始められる',
        shouLine: '100万。まぁ、ミニマムでやるならそれでもいいか。',
    },
    {
        amount: 2000000,
        label: '¥200万',
        desc: 'いい物件も狙える。バランスの良い選択',
        shouLine: '200万。いいだろう。ちょうどいいサイズ感だ。',
    },
    {
        amount: 3000000,
        label: '¥300万',
        desc: '最高の設備と立地で最初から勝負できる',
        shouLine: '300万か。デカく出るな。面白い。',
    },
];

/* ── 融資面談 3問 ── */
const INTERVIEW_QUESTIONS = [
    {
        question: '「自己資金はいくらですか？ どうやって貯めましたか？」',
        choices: [
            { label: 'バイト、せどり、マルシェで稼ぎました', score: 3, reaction: '面談官がメモを取った。「複数の収入源を持っていたんですね。」' },
            { label: 'バイトでコツコツ貯めました', score: 2, reaction: '面談官が頷いた。「堅実ですね。」' },
            { label: '……頑張りました', score: 1, reaction: '面談官の表情が微妙に曇った。' },
        ],
    },
    {
        question: '「なぜカフェなのですか？ 市場調査はしましたか？」',
        choices: [
            { label: '近隣の競合を分析し、差別化できるポイントを見つけました', score: 3, reaction: '面談官が身を乗り出した。「具体的ですね。いい準備です。」' },
            { label: 'ずっとカフェで働いていたので、経験があります', score: 2, reaction: '面談官が頷いた。「経験は大事ですね。」' },
            { label: 'コーヒーが好きだからです', score: 1, reaction: '面談官が一瞬黙った。「……他の理由は？」' },
        ],
    },
    {
        question: '「月の売上見込みと、返済計画を教えてください。」',
        choices: [
            { label: '損益分岐点から計算して、月商¥50万を3ヶ月で達成する計画です', score: 3, reaction: '面談官がペンを置いた。「しっかりした事業計画ですね。」' },
            { label: '月¥40万くらいは売れると思います', score: 2, reaction: '面談官がメモした。「根拠をもう少し聞かせてください。」' },
            { label: '……頑張ります', score: 1, reaction: '面談官の表情が固くなった。「具体的な数字をお持ちですか？」' },
        ],
    },
];

/* ── 融資ランク表 ── */
const FUSION_TIERS = {
    high: { amount: 2000000, rate: 1.5, years: 7, label: '¥200万', grade: 'A', comment: '好条件です。事業計画が高く評価されました。' },
    mid: { amount: 1500000, rate: 2.0, years: 5, label: '¥150万', grade: 'B', comment: '標準的な条件です。実績を積めば借り換えも可能です。' },
    low: { amount: 1000000, rate: 2.5, years: 5, label: '¥100万', grade: 'C', comment: '慎重な条件です。まずは実績を見せてください。' },
};

function getFusionTier(score) {
    if (score >= 7) return FUSION_TIERS.high;
    if (score >= 4) return FUSION_TIERS.mid;
    return FUSION_TIERS.low;
}

export default function Ending() {
    const money = useGameStore(s => s.money);
    const turn = useGameStore(s => s.turn);
    const baitoType = useGameStore(s => s.baitoType);
    const shouInvestment = useGameStore(s => s.shouInvestment);
    const fusionAmount = useGameStore(s => s.fusionAmount);
    const selectShouInvestment = useGameStore(s => s.selectShouInvestment);
    const setFusionResult = useGameStore(s => s.setFusionResult);
    const goToReport = useGameStore(s => s.goToReport);

    // step: 0=narrative, 1=shou-proposal, 2=shou-choice, 3=shou-confirm,
    //        4/5/6=interview Q1-Q3, 7=fusion-result, 8=total-summary
    const [step, setStep] = useState(0);
    const [interviewScore, setInterviewScore] = useState(0);
    const [interviewAnswers, setInterviewAnswers] = useState([]);

    const dailyPayMap = { cafe: 8800, convenience: 10000, moving: 12000 };
    const basePay = dailyPayMap[baitoType] || 8800;
    const weeklyNet = basePay * 5 - 25750;
    const baitoOnlyWeeks = weeklyNet > 0 ? Math.ceil(500000 / weeklyNet) : 999;

    const selectedTier = INVESTMENT_TIERS.find(t => t.amount === shouInvestment);
    const selfCapital = money + shouInvestment;

    /* ─────────── Step 0: Achievement ─────────── */
    if (step === 0) {
        return (
            <div className="ending-screen">
                <div className="ending__achievement">
                    <div className="ending__money-label">自己資金</div>
                    <div className="ending__money">¥{money.toLocaleString()}</div>
                </div>
                <div className="ending__narrative">
                    <p><strong>{turn}週間前</strong>、全財産は¥0だった。</p>
                    <p>
                        最初はバイトだけ。<br />
                        日給¥{basePay.toLocaleString()}。手残りは週¥{weeklyNet.toLocaleString()}。<br />
                        このペースなら¥50万まで<strong>{baitoOnlyWeeks}週——{Math.ceil(baitoOnlyWeeks / 4)}ヶ月</strong>。
                    </p>
                    <p>あなたは<strong>{turn}週</strong>でここに立っている。</p>
                    <p>
                        せどりで「仕入れて売る」を覚えた。<br />
                        マルシェで「作って売る」を覚えた。<br />
                        配分を変え続けて、ここまで来た。
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setStep(1)}>
                    続きを読む →
                </button>
            </div>
        );
    }

    /* ─────────── Step 1: Shou Proposal ─────────── */
    if (step === 1) {
        return (
            <div className="ending-screen">
                <div className="ending__narrative">
                    <p>ショウさんから電話が来た。</p>
                    <p>
                        「¥{(money / 10000).toFixed(0)}万か。よくここまで貯めたな。<br />
                        でも、カフェを開くにはまだ足りない。<br />
                        内装、設備、当面の運転資金——<br />
                        自己資金だけじゃ厳しい。」
                    </p>
                    <p>
                        「——俺が<strong>出資</strong>する。<br />
                        いくら必要か考えろ。」
                    </p>
                    <p>
                        「多く出せばデカい店が開ける。<br />
                        少なく済ませれば自分の裁量が増える。<br />
                        どっちがいいかは——お前次第だ。」
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setStep(2)}>
                    出資額を選ぶ →
                </button>
            </div>
        );
    }

    /* ─────────── Step 2: Investment Tier ─────────── */
    if (step === 2) {
        return (
            <div className="ending-screen">
                <p className="section-header">ショウの出資</p>
                <h2 style={{ fontSize: '1.1rem', marginBottom: 8 }}>
                    いくら出してもらう？
                </h2>
                <p className="text-secondary" style={{ fontSize: '0.82rem', marginBottom: 24 }}>
                    自己資金 ¥{money.toLocaleString()} ＋ ショウの出資でカフェを開く
                </p>
                {INVESTMENT_TIERS.map(tier => {
                    const total = money + tier.amount;
                    return (
                        <div
                            key={tier.amount}
                            className="card"
                            style={{ marginBottom: 12, cursor: 'pointer' }}
                            onClick={() => {
                                selectShouInvestment(tier.amount);
                                setStep(3);
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                                    {tier.label}
                                </span>
                                <span className="mono text-gold" style={{ fontSize: '0.85rem' }}>
                                    自己資金 ¥{(total / 10000).toFixed(0)}万
                                </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {tier.desc}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    /* ─────────── Step 3: Shou Confirm → Interview Transition ─────────── */
    if (step === 3) {
        return (
            <div className="ending-screen">
                <div className="ending__narrative">
                    <p>「{selectedTier?.shouLine}」</p>
                    <p>
                        「自分で稼いだ¥{(money / 10000).toFixed(0)}万。<br />
                        俺の{selectedTier?.label}。<br />
                        自己資金合計<strong>¥{(selfCapital / 10000).toFixed(0)}万</strong>。」
                    </p>

                    <hr className="ending-divider" />

                    <p>
                        「だがな、自己資金だけじゃ運転資金が心もとない。<br />
                        <strong>融資</strong>も受けろ。日本政策金融公庫なら新規開業でも貸してくれる。」
                    </p>
                    <p>
                        「銀行は『好き』に金を貸さない。『数字』に貸す。<br />
                        面談があるから、ちゃんと準備しろ。」
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setStep(4)}>
                    融資面談へ →
                </button>
            </div>
        );
    }

    /* ─────────── Step 4-6: Interview Questions ─────────── */
    const qIndex = step - 4; // 0, 1, 2
    if (step >= 4 && step <= 6) {
        const q = INTERVIEW_QUESTIONS[qIndex];
        const lastAnswer = interviewAnswers[interviewAnswers.length - 1];

        return (
            <div className="ending-screen">
                <p className="section-header">融資面談</p>
                <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: 12 }}>
                    質問 {qIndex + 1} / 3
                </p>

                {/* Show reaction from previous answer */}
                {qIndex > 0 && lastAnswer && (
                    <div className="card" style={{ marginBottom: 16, fontSize: '0.82rem', background: 'var(--surface-alt, rgba(255,255,255,0.05))' }}>
                        {lastAnswer.reaction}
                    </div>
                )}

                <div className="ending__narrative">
                    <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                        面談官：<br />{q.question}
                    </p>
                </div>

                {q.choices.map((choice, i) => (
                    <div
                        key={i}
                        className="card"
                        style={{ marginBottom: 10, cursor: 'pointer', padding: '12px 16px' }}
                        onClick={() => {
                            const newScore = interviewScore + choice.score;
                            const newAnswers = [...interviewAnswers, choice];
                            setInterviewScore(newScore);
                            setInterviewAnswers(newAnswers);

                            if (step === 6) {
                                // Last question — calculate fusion result
                                setFusionResult(newScore);
                                setStep(7);
                            } else {
                                setStep(step + 1);
                            }
                        }}
                    >
                        <span style={{ fontSize: '0.88rem' }}>{choice.label}</span>
                    </div>
                ))}
            </div>
        );
    }

    /* ─────────── Step 7: Fusion Result ─────────── */
    if (step === 7) {
        const lastAnswer = interviewAnswers[interviewAnswers.length - 1];
        const tier = getFusionTier(interviewScore);
        const totalAll = selfCapital + tier.amount;

        return (
            <div className="ending-screen">
                <p className="section-header">融資結果</p>

                {/* Last question reaction */}
                {lastAnswer && (
                    <div className="card" style={{ marginBottom: 16, fontSize: '0.82rem', background: 'var(--surface-alt, rgba(255,255,255,0.05))' }}>
                        {lastAnswer.reaction}
                    </div>
                )}

                <div style={{ marginBottom: 24 }}>
                    <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                            スコア {interviewScore}/9 — 評価{tier.grade}
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)' }}>
                            融資 {tier.label}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                            金利 {tier.rate}% ・ {tier.years}年返済
                        </div>
                        <div style={{ fontSize: '0.8rem', marginTop: 8 }}>
                            {tier.comment}
                        </div>
                    </div>
                </div>

                <button className="btn btn-primary" onClick={() => setStep(8)}>
                    開業資金の全体を見る →
                </button>
            </div>
        );
    }

    /* ─────────── Step 8: Total Summary ─────────── */
    const fTier = getFusionTier(interviewScore);
    const totalAllFunding = selfCapital + fTier.amount;
    const monthlyRepay = Math.round(fTier.amount * (1 + fTier.rate / 100 * fTier.years) / (fTier.years * 12));

    return (
        <div className="ending-screen">
            <p className="section-header">開業資金</p>

            <div className="card" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span>あなたの貯金</span>
                    <span className="mono">¥{money.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span>ショウの出資</span>
                    <span className="mono">¥{shouInvestment.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4, color: 'var(--text-secondary)' }}>
                    <span>　自己資金合計</span>
                    <span className="mono">¥{selfCapital.toLocaleString()}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span>融資（公庫）</span>
                    <span className="mono">¥{fTier.amount.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4, paddingLeft: 12 }}>
                    金利{fTier.rate}% ・ {fTier.years}年 ・ 月返済約¥{monthlyRepay.toLocaleString()}
                </div>
                <hr style={{ border: 'none', borderTop: '2px solid var(--gold)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800 }}>
                    <span>開業資金 合計</span>
                    <span className="mono text-gold">¥{totalAllFunding.toLocaleString()}</span>
                </div>
            </div>

            <div className="ending__narrative" style={{ marginTop: 16 }}>
                <p>
                    「これだけあれば、カフェは開ける。<br />
                    あとは——どんな店にするかだ。」
                </p>
                <p>
                    「ここからが本番だ。<br />
                    金を集めるのと、金を使って利益を出すのは、<br />
                    全く別のゲームだからな。」
                </p>
            </div>

            <button className="btn btn-primary" onClick={goToReport}>
                Chapter 0 — 振り返りを見る →
            </button>
        </div>
    );
}
