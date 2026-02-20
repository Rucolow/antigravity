import React, { useState } from 'react';
import { useHotelStore } from '../../store/hotelEngine';
import { PROPERTIES, ROOM_PRESETS, OTA_LEVELS } from '../../data/ch3Constants';

export default function HotelOpening() {
    const [step, setStep] = useState(0);
    const state = useHotelStore(s => s);
    const startOperating = useHotelStore(s => s.startOperating);

    const prop = PROPERTIES[state.propertyKey];
    const preset = ROOM_PRESETS[state.roomPresetKey];
    const ota = OTA_LEVELS[state.otaLevel];

    const lines = [
        [
            `Chapter 3 — 宿泊業「消える在庫」`,
            '',
            'カフェでサービスを売ることを学んだ。',
            '小売で在庫の恐ろしさを知った。',
            '',
            '次は——「時間が在庫」の世界。',
            '今夜売れなかった部屋は、明日には消えている。',
        ],
        [
            `選んだ物件: ${prop?.name || '---'}`,
            `客室: ${state.totalRooms}室`,
            `タイプ: ${preset?.name || '---'}`,
            `チャネル: ${ota?.name || '---'}`,
            '',
            `手元資金: ¥${state.money.toLocaleString()}`,
            '',
            'ローンの返済は毎月やってくる。',
            '空室であっても。',
        ],
        [
            'ショウさんの言葉：',
            '',
            '「宿泊業は"持っている"こと自体がコストになる。',
            '　空室は翌日に持ち越せない。',
            '　お前はこれから毎晩、',
            '　"誰もいない部屋の家賃"を払うことになる。」',
            '',
            '——さあ、開業だ。',
        ],
    ];

    const currentLines = lines[step];

    return (
        <div className="ch3-container ch3-opening">
            <div className="ch3-event__text" key={step}>
                {currentLines.map((line, i) => (
                    <p key={i} style={{ opacity: 0, animation: `ch3FadeUp 0.6s ease ${i * 0.12}s forwards` }}>
                        {line || '\u00A0'}
                    </p>
                ))}
            </div>

            <div style={{ marginTop: 24, opacity: 0, animation: `ch3FadeUp 0.6s ease ${currentLines.length * 0.12}s forwards` }}>
                {step < lines.length - 1 ? (
                    <button className="ch3-btn ch3-btn--secondary" onClick={() => setStep(step + 1)}>
                        →
                    </button>
                ) : (
                    <button className="ch3-btn" onClick={startOperating}>
                        🏨 開業する
                    </button>
                )}
            </div>
        </div>
    );
}
