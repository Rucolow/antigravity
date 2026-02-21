import React, { useState } from 'react';
import { useHotelStore } from '../../store/hotelEngine';
import { useECStore } from '../../store/ecEngine';
import { useGameStore } from '../../store/gameEngine';

export default function Ch4Bridge() {
    const state = useHotelStore(s => s);
    const initFromCh3 = useECStore(s => s.initFromCh3);
    const [step, setStep] = useState(0);

    const lines = [
        [
            '宿泊業を通じて学んだことを振り返る。',
            '',
            '消える在庫。稼働率。ダイナミックプライシング。',
            '時間が過ぎれば、今夜の空室は永遠に売れない。',
            '',
            `純資産 ¥${state.money.toLocaleString()}。`,
            '宿泊事業の売却益を含めた全財産。',
        ],
        [
            'ショウさんに相談した。',
            '',
            '「次は"仕組み"を作れ。',
            '　カフェは自分の手で淹れた。',
            '　小売は自分の目で仕入れた。',
            '　宿泊は自分の足で動いた。',
            '',
            '　次は——自分がいなくても回る仕組みを作れ。',
            '　広告が顧客を連れてきて、',
            '　ECサイトが注文を受けて、',
            '　倉庫が発送する。',
            '',
            '　お前の仕事は"仕組みを設計する"ことだ。」',
        ],
        [
            'ケンジからLINE。',
            '',
            '「俺もEC始めた。BASE? Shopify?',
            '　とりあえずBASEで出品したら',
            '　1週間で3個売れた！',
            '　広告？ いらないよ、SNSでバズらせるから。',
            '',
            '　……え、広告費って月10万もかかるの？',
            '　嘘だろ……」',
            '',
            '——',
            '',
            'Chapter 4：「EC・D2C — 仕組みが売る」',
        ],
    ];

    const currentLines = lines[step];

    const startCh4 = () => {
        const hotelState = useHotelStore.getState();
        initFromCh3({
            money: hotelState.money,
            skills: hotelState.ch3Skills || [],
            allPreviousSkills: [
                ...(hotelState.allPreviousSkills || []),
                ...(hotelState.ch3Skills || []),
            ],
            ayaJoined: hotelState.ayaJoined || false,
            ayaFromCh2: hotelState.ayaFromCh2 || false,
        });
        useGameStore.setState({ chapter: 4 });
    };

    return (
        <div className="ch3-container" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1.2rem' }}>
            <div key={step}>
                {currentLines.map((line, i) => (
                    <p key={i} style={{
                        fontSize: '0.82rem',
                        lineHeight: 1.8,
                        color: 'var(--ch3-text, #c8daf0)',
                        opacity: 0,
                        animation: `fadeInUp 0.6s ease ${i * 0.12}s forwards`,
                    }}>
                        {line || '\u00A0'}
                    </p>
                ))}
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10, opacity: 0, animation: `fadeInUp 0.6s ease ${currentLines.length * 0.12}s forwards` }}>
                {step < lines.length - 1 ? (
                    <button className="ch3-action-btn" onClick={() => setStep(step + 1)}>
                        →
                    </button>
                ) : (
                    <button className="ch3-action-btn" onClick={startCh4} style={{ width: '100%' }}>
                        Chapter 4 を始める →
                    </button>
                )}
            </div>
        </div>
    );
}
