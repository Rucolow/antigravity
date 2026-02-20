import React from 'react';
import { useHotelStore } from '../../store/hotelEngine';
import { PROPERTIES, CH3_EXIT_BASE_MULTIPLE } from '../../data/ch3Constants';

const EXIT_OPTIONS = [
    {
        type: 'mna',
        name: 'M&A（事業売却）',
        desc: '物件・ブランド込みで売却。EV×70%がリターン。',
        icon: '🤝',
        ratio: 0.70,
    },
    {
        type: 'management',
        name: '運営委託（MBO）',
        desc: '物件は保有したまま運営を委託。EV×50%＋管理手数料5%。',
        icon: '🏢',
        ratio: 0.50,
    },
    {
        type: 'ipo',
        name: 'IPO（上場）',
        desc: '宿泊チェーンとして上場。EV×40%＋配当2%/年。',
        icon: '📈',
        ratio: 0.40,
    },
    {
        type: 'liquidation',
        name: '清算',
        desc: '事業を畳む。手元資金×40%＋物件売却益50%。',
        icon: '🔚',
        ratio: 0,
    },
];

export default function HotelExitSelect() {
    const state = useHotelStore(s => s);
    const selectExit = useHotelStore(s => s.selectExit);
    const setPhase = useHotelStore(s => s.setPhase);
    const ev = state.enterpriseValue;
    const prop = PROPERTIES[state.propertyKey];

    return (
        <div className="ch3-container">
            <h2 className="ch3-title">🚪 EXIT — 次のステージへ</h2>
            <p className="ch3-subtitle">
                企業価値: ¥{ev.toLocaleString()} / 倍率: ×{state.multiple.toFixed(1)}
            </p>

            <div className="ch3-exit-grid">
                {EXIT_OPTIONS.map(opt => {
                    let amount;
                    if (opt.type === 'liquidation') {
                        const propValue = prop?.propertyCost || 0;
                        amount = Math.floor(state.money * 0.40 + propValue * 0.5);
                    } else {
                        amount = Math.floor(ev * opt.ratio);
                    }

                    return (
                        <div
                            key={opt.type}
                            className="ch3-card ch3-card--clickable ch3-exit-card"
                            onClick={() => selectExit(opt.type)}
                        >
                            <div className="ch3-exit-card__name">{opt.icon} {opt.name}</div>
                            <div className="ch3-exit-card__desc">{opt.desc}</div>
                            <div className="ch3-exit-card__amount">¥{amount.toLocaleString()}</div>
                        </div>
                    );
                })}
            </div>

            <button
                className="ch3-btn ch3-btn--secondary"
                onClick={() => setPhase('ch3-dashboard')}
            >
                ← もう少し経営を続ける
            </button>
        </div>
    );
}
