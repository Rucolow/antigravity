import React, { useState } from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import { LOCATIONS } from '../../data/ch1Constants';

export default function CafeOpening() {
    const state = useCafeStore(s => s);
    const startOperating = useCafeStore(s => s.startOperating);
    const [lineIdx, setLineIdx] = useState(0);

    const loc = LOCATIONS[state.location];
    const estCustomers = Math.round(loc.baseCustomers * 0.5); // 初日は期待値の50%

    const lines = [
        '━━ 開店初日 ━━',
        '',
        '朝、シャッターを上げた。',
        'ドアにOPENの札をかけた。',
        'コーヒーの香りが外に漏れる。',
        '',
        '……1時間、誰も来ない。',
        '',
        `2時間目。１人目のお客さん。サラリーマン。`,
        `「コーヒー1杯。テイクアウトで。」`,
        `¥${state.menu[0]?.price || 450}。これがこの店の最初の売上。`,
        '手が震えた。嬉しいのか怖いのかわからない。',
        '',
        `推定来客: ${estCustomers}人/日`,
        `あなたのカフェが、今日から動き始める。`,
    ];

    const visibleLines = lines.slice(0, lineIdx + 1);
    const done = lineIdx >= lines.length - 1;

    return (
        <div className="ch1-opening" onClick={() => !done && setLineIdx(i => i + 1)}>
            <div className="ch1-opening__text">
                {visibleLines.map((line, i) => (
                    <p key={i} className={`ch1-opening__line ${i === lineIdx ? 'ch1-opening__line--new' : ''}`}>
                        {line || '\u00A0'}
                    </p>
                ))}
            </div>

            {done ? (
                <button className="ch1-setup__confirm" onClick={startOperating}>
                    経営開始 →
                </button>
            ) : (
                <p className="ch1-opening__tap">タップして続ける</p>
            )}
        </div>
    );
}
