import React, { useState } from 'react';
import { useCafeStore } from '../../store/cafeEngine';

export default function ExitSelect() {
    const state = useCafeStore(s => s);
    const selectExit = useCafeStore(s => s.selectExit);
    const [step, setStep] = useState('forecast'); // forecast → choose → farewell

    const ev = state.enterpriseValue;
    const mnaAmount = Math.floor(ev * 0.70);
    const ipoAmount = Math.floor(ev * 0.40);
    const ipoDividend = Math.floor(ev * 0.02);
    const successionAmount = Math.floor(ev * 0.30);
    const liquidationAmount = Math.floor(state.money * 0.40);

    // ── 「もし続けたら」予測 ──
    const recentProfits = state.profitHistory.slice(-12);
    const avgProfit = recentProfits.length > 0
        ? Math.floor(recentProfits.reduce((s, p) => s + p.profit, 0) / recentProfits.length)
        : 0;
    const avgSales = recentProfits.length > 0
        ? Math.floor(recentProfits.reduce((s, p) => s + p.sales, 0) / recentProfits.length)
        : 0;

    // 成長率計算
    let growthRate = 0;
    if (recentProfits.length >= 8) {
        const recent4 = recentProfits.slice(-4).reduce((s, p) => s + p.profit, 0);
        const older4 = recentProfits.slice(-8, -4).reduce((s, p) => s + p.profit, 0);
        growthRate = older4 > 0 ? ((recent4 - older4) / Math.abs(older4)) : 0;
    }

    const projectedSales = Math.floor(avgSales * (1 + growthRate * 0.5)); // 3ターン後予測（減衰）
    const projectedProfit = Math.floor(avgProfit * (1 + growthRate * 0.3));
    const projectedNetWorth = state.money + projectedProfit * 3;
    const repairCost = state.equipmentDegradation > 0 ? Math.floor(20000 * state.equipmentDegradation) : 15000;

    // ── Forecast画面 ──
    if (step === 'forecast') {
        return (
            <div className="ch1-exit">
                <h2>EXIT判断</h2>

                <div className="ch1-exit__forecast">
                    <h3>もし、このカフェを続けたら——</h3>

                    <div className="ch1-exit__forecast-box">
                        <div className="ch1-exit__forecast-label">3ターン後の予測：</div>
                        <div className="ch1-report__row">
                            <span>週売上</span>
                            <span>¥{projectedSales.toLocaleString()}（{growthRate >= 0 ? '+' : ''}{(growthRate * 100).toFixed(1)}%）</span>
                        </div>
                        <div className="ch1-report__row">
                            <span>週利益</span>
                            <span>¥{projectedProfit.toLocaleString()}</span>
                        </div>
                        <div className="ch1-report__row">
                            <span>純資産</span>
                            <span>¥{projectedNetWorth.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="ch1-exit__risks">
                        <div className="ch1-exit__risk-title">ただし——</div>
                        {state.chainCompetitorArrived && <div className="ch1-exit__risk">・チェーン出店リスクの継続（競合増加中）</div>}
                        <div className="ch1-exit__risk">・設備の経年劣化（修繕費月+¥{repairCost.toLocaleString()}見込み）</div>
                        <div className="ch1-exit__risk">・客数の天井（席数上限に接近中）</div>
                    </div>

                    <div className="ch1-exit__philosophy">
                        <p>「続けることにもコストがある。」</p>
                        <p>「手放すことにも勇気がいる。」</p>
                        <p>「どちらが正解かは、未来だけが知っている。」</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button className="ch1-setup__confirm" onClick={() => setStep('choose')}>
                        EXITする →
                    </button>
                    <button className="ch1-actions__back" onClick={() => useCafeStore.setState({ phase: 'ch1-dashboard' })}>
                        もう少し続ける
                    </button>
                </div>
            </div>
        );
    }

    // ── EXIT選択画面 ──
    if (step === 'choose') {
        const handleExit = (type) => {
            selectExit(type);
            setStep('farewell');
        };

        return (
            <div className="ch1-exit">
                <h2>EXIT方法を選択</h2>

                <div className="ch1-exit__value">
                    <div className="ch1-exit__label">企業価値</div>
                    <div className="ch1-exit__amount">¥{ev.toLocaleString()}</div>
                    <div className="ch1-exit__sub">
                        直近平均週利益 ¥{avgProfit.toLocaleString()} × 年換算 × {state.multiple.toFixed(1)}倍
                    </div>
                </div>

                <div className="ch1-exit__options">
                    <div className="ch1-exit__option" onClick={() => handleExit('mna')}>
                        <h3>M&A（売却）</h3>
                        <div className="ch1-exit__opt-amount">¥{mnaAmount.toLocaleString()}</div>
                        <p>企業価値の70%を現金で受取。Ch.2の初期資本に</p>
                    </div>

                    <div className="ch1-exit__option" onClick={() => handleExit('ipo')}>
                        <h3>IPO（上場）</h3>
                        <div className="ch1-exit__opt-amount">¥{ipoAmount.toLocaleString()}</div>
                        <p>40%を現金 + 毎ターン¥{ipoDividend.toLocaleString()}配当（永久）</p>
                    </div>

                    <div className="ch1-exit__option" onClick={() => handleExit('succession')}>
                        <h3>事業承継</h3>
                        <div className="ch1-exit__opt-amount">¥{successionAmount.toLocaleString()}</div>
                        <p>30%を受取 + 人材育成速度 永久+20%</p>
                    </div>

                    <div className="ch1-exit__option ch1-exit__option--danger" onClick={() => handleExit('liquidation')}>
                        <h3>清算</h3>
                        <div className="ch1-exit__opt-amount">¥{liquidationAmount.toLocaleString()}</div>
                        <p>資産の40%を回収。赤字経営からの撤退</p>
                    </div>
                </div>

                <button className="ch1-actions__back" onClick={() => setStep('forecast')}>
                    ← 戻る
                </button>
            </div>
        );
    }

    // ── 別れの演出 ──
    const cafeName = state.cafeName || 'My Cafe';
    const exitType = state.exitType;

    const farewellTexts = {
        mna: [
            `カフェ「${cafeName}」に、新しいオーナーがやってきた。`,
            '引き継ぎの日、あなたは最後に1杯のコーヒーを淹れた。',
            '',
            '常連の田中さんが来た。',
            '「寂しいねぇ。新しいオーナーさんにも、',
            '　この味を守ってほしいもんだ。」',
            '',
            'ミサキからLINE。',
            '「お疲れ。次は何やるの？ また面白いことやるんでしょ。',
            '　教えてね。応援するから。」',
            '',
            state.staff.length > 0 ? 'アヤさんが帰り際に言った。' : null,
            state.staff.length > 0 ? '「次も、連れて行ってくださいね。約束ですよ。」' : null,
            '',
            '最後に店を出る時、ドアのベルが鳴った。',
            'この音を聞くのも、これが最後だ。',
        ].filter(Boolean),
        ipo: [
            `カフェ「${cafeName}」は上場企業になった。`,
            'オーナーではなくなったが、株式を持ち続ける。',
            '',
            '「自分の店」から「みんなの店」へ。',
            '成長は続く。でも、あのカウンターの向こう側には、もう立たない。',
            '',
            'ミサキからLINE。',
            '「上場おめでとう！ ……って、株買えるの？ 買うわ。」',
            '',
            'ショウさんからメッセージ。',
            '「よくやった。次のステージで待ってるぞ。」',
        ],
        succession: [
            `カフェ「${cafeName}」を、信頼できる人に託した。`,
            '',
            state.staff.length > 0
                ? 'アヤさんが新しいオーナーになった。\n「この店を守ります。約束します。」'
                : '新しいオーナーに引き継いだ。「この味を変えないでほしい」とだけ伝えた。',
            '',
            '田中さんが安心したように言った。',
            '「良い人に引き継いだんだね。よかった。」',
            '',
            'お前の名前は、このカフェの歴史に残る。',
        ],
        liquidation: [
            `カフェ「${cafeName}」は閉店した。`,
            '',
            '在庫を処分し、設備を売り、保証金を回収した。',
            '赤字を止められたのは、正しい判断だった。',
            '',
            '最後の1日。',
            '田中さんが花を持ってきてくれた。',
            '「短い間だったけど、ありがとうね。」',
            '',
            '閉店の掃除をしながら思う。',
            'この経験は、次に活きる。必ず。',
        ],
    };

    const farewell = farewellTexts[exitType] || farewellTexts.mna;

    return (
        <div className="ch1-exit ch1-exit--farewell">
            <div className="ch1-event__text">
                {farewell.map((line, i) => (
                    <p key={i} style={{ opacity: 0, animation: `fadeInUp 0.6s ease ${i * 0.15}s forwards` }}>
                        {line || '\u00A0'}
                    </p>
                ))}
            </div>

            <button
                className="ch1-setup__confirm"
                style={{ marginTop: 24, opacity: 0, animation: `fadeInUp 0.6s ease ${farewell.length * 0.15}s forwards` }}
                onClick={() => useCafeStore.setState({ phase: 'ch1-report' })}
            >
                振り返りレポートへ →
            </button>
        </div>
    );
}
