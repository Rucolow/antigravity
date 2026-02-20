import React, { useState } from 'react';
import { useRetailStore } from '../../store/retailEngine';
import { useHotelStore } from '../../store/hotelEngine';
import { useGameStore } from '../../store/gameEngine';

export default function Ch3Bridge() {
    const state = useRetailStore(s => s);
    const initFromCh2 = useHotelStore(s => s.initFromCh2);
    const [step, setStep] = useState(0);

    const lines = [
        [
            '小売店を通じて学んだことを振り返る。',
            '',
            '在庫は眠っている現金。死に筋の恐怖。',
            '仕入れと売上のタイムラグ。掛け払いのリスク。',
            'ECで広がった世界。季節の波。',
            '',
            `純資産 ¥${state.money.toLocaleString()}。`,
            '小売の売却益を含めた全財産。',
        ],
        [
            'ショウさんに相談した。',
            '',
            '「次は"時間が在庫"の世界に行け。',
            '　カフェはサービスを売った。',
            '　小売はモノを売った。',
            '　次は"空間×時間"を売れ。',
            '',
            '　今夜売れなかった部屋は、明日には消えている。',
            '　在庫を"持たない"んじゃない。',
            '　在庫が"消える"んだ。',
            '',
            '　それがどれだけ恐ろしいか、体で知れ。」',
        ],
        [
            'ケンジからLINE。',
            '',
            '「民泊やってみたんだけど、',
            '　Airbnbに登録して初日で予約入った！',
            '　IKEAで家具揃えたら¥30,000。',
            '　お前が不動産に何千万もかける意味わからんww',
            '',
            '　……本当にゲストハウスやるの？',
            '　ローンとか大丈夫？」',
            '',
            '——',
            '',
            'Chapter 3：「宿泊業 — 消える在庫」',
        ],
    ];

    const currentLines = lines[step];

    const startCh3 = () => {
        initFromCh2(state);
        useGameStore.setState({ chapter: 3 });
    };

    return (
        <div className="ch1-exit ch1-exit--farewell" style={{ background: 'var(--ch3-bg, #0a1628)', color: 'var(--ch3-text, #c8daf0)' }}>
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
                    <button className="ch1-setup__confirm" onClick={startCh3}>
                        Chapter 3 を始める →
                    </button>
                )}
            </div>
        </div>
    );
}
