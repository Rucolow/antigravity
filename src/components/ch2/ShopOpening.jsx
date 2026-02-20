import React, { useState } from 'react';
import { useRetailStore } from '../../store/retailEngine';
import { INDUSTRIES, LOCATIONS, INTERIORS } from '../../data/ch2Constants';

export default function ShopOpening() {
    const state = useRetailStore(s => s);
    const startOperating = useRetailStore(s => s.startOperating);
    const [step, setStep] = useState(0);

    const ind = INDUSTRIES[state.industryKey];
    const loc = LOCATIONS[state.locationKey];
    const interior = INTERIORS[state.interiorGrade];

    const lines = [
        [
            `${loc?.name}の一角。`,
            '',
            `「${ind?.name}」——`,
            '在庫という名の現金が、棚に並んでいる。',
            '',
            '仕入れたモノが売れなければ、',
            'それはただの損失になる。',
            '',
            'カフェとは違う、モノを売るビジネス。',
        ],
        [
            'ショウさんの言葉が蘇る。',
            '',
            '「在庫は眠っている現金だ。',
            '　目を覚まさせるのが、お前の仕事だ。」',
            '',
            `残金 ¥${state.money.toLocaleString()}。`,
            '',
            '——開業。',
        ],
    ];

    const currentLines = lines[step];

    return (
        <div className="ch2-opening">
            <div className="ch2-opening__text" key={step}>
                {currentLines.map((line, i) => (
                    <p key={i} style={{ opacity: 0, animation: `fadeInUp 0.6s ease ${i * 0.12}s forwards` }}>
                        {line || '\u00A0'}
                    </p>
                ))}
            </div>

            <div style={{ marginTop: 24, opacity: 0, animation: `fadeInUp 0.6s ease ${currentLines.length * 0.12}s forwards` }}>
                {step < lines.length - 1 ? (
                    <button className="ch2-setup__confirm" onClick={() => setStep(step + 1)}>
                        →
                    </button>
                ) : (
                    <button className="ch2-setup__confirm" onClick={startOperating}>
                        店を開ける →
                    </button>
                )}
            </div>
        </div>
    );
}
