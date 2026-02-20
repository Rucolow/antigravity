import React, { useState } from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import { useRetailStore } from '../../store/retailEngine';
import { useGameStore } from '../../store/gameEngine';

export default function Ch2Bridge() {
    const state = useCafeStore(s => s);
    const initFromCh1 = useRetailStore(s => s.initFromCh1);
    const [step, setStep] = useState(0);

    const lines = [
        [
            'カフェを通じて学んだことを振り返る。',
            '',
            '損益計算書。損益分岐点。固定費の重力。',
            '人を雇う意味。税金の現実。',
            '「売上」と「利益」は違う——',
            'ケンジが教えてくれた、最も重要な教訓。',
            '',
            `純資産 ¥${state.money.toLocaleString()}。`,
            'カフェの売却益を含めた全財産。',
        ],
        [
            'ショウさんに相談した。',
            '',
            '「次はモノを売ってみろ。',
            '　カフェは『サービスを売る仕事』だった。',
            '　次は『モノを売る仕事』を経験しろ。',
            '',
            '　サービスは在庫がない。だから損失もない。',
            '　でもモノには在庫がある。',
            '　在庫は——眠っている現金だ。',
            '',
            '　それがどれだけ怖いか、体で知れ。」',
        ],
        [
            'タクヤから連絡。',
            '',
            '「せどりの延長で物販始めたんだけど、',
            '　在庫が全然捌けなくて困ってる。',
            '　お前もそっちの方面やるんじゃない？',
            '　情報交換しようぜ。」',
            '',
            '——',
            '',
            'Chapter 2：「専門小売店 — 在庫は眠っている現金」',
        ],
    ];

    const currentLines = lines[step];

    const startCh2 = () => {
        // Ch.1の状態をCh.2に引き継ぎ
        initFromCh1(state);
        // ゲーム全体のchapterを2に更新
        useGameStore.setState({ chapter: 2 });
    };

    return (
        <div className="ch1-exit ch1-exit--farewell">
            <div className="ch1-event__text" key={step}>
                {currentLines.map((line, i) => (
                    <p key={i} style={{ opacity: 0, animation: `fadeInUp 0.6s ease ${i * 0.12}s forwards` }}>
                        {line || '\u00A0'}
                    </p>
                ))}
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10, opacity: 0, animation: `fadeInUp 0.6s ease ${currentLines.length * 0.12}s forwards` }}>
                {step < lines.length - 1 ? (
                    <button className="ch1-setup__confirm" onClick={() => setStep(step + 1)}>
                        →
                    </button>
                ) : (
                    <button className="ch1-setup__confirm" onClick={startCh2}>
                        Chapter 2 を始める →
                    </button>
                )}
            </div>
        </div>
    );
}
