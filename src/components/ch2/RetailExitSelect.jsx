import React from 'react';
import { useRetailStore } from '../../store/retailEngine';

export default function RetailExitSelect() {
    const state = useRetailStore(s => s);
    const selectExit = useRetailStore(s => s.selectExit);
    const ev = state.enterpriseValue;

    const options = [
        {
            key: 'mna',
            icon: '🤝',
            title: 'M&A（事業売却）',
            amount: Math.floor(ev * 0.70),
            desc: '企業価値の70%を即金で受取。もっとも資金効率が高い。',
        },
        {
            key: 'ipo',
            icon: '📈',
            title: 'IPO（上場）',
            amount: Math.floor(ev * 0.40),
            desc: '40%の売出+毎ターン2%の配当。長期的な収入源になる。',
        },
        {
            key: 'succession',
            icon: '🏪',
            title: '事業承継',
            amount: Math.floor(ev * 0.30),
            desc: '30%を受取。Ch.3で人脈・雇用スピードボーナスあり。',
        },
        {
            key: 'liquidation',
            icon: '🔨',
            title: '清算',
            amount: Math.floor(state.money * 0.40),
            desc: '現金の40%のみ回収。最後の手段。',
        },
    ];

    return (
        <div className="ch2-exit">
            <h2>EXIT — 事業をどうする？</h2>
            <div className="ch2-exit__ev">
                <div className="ch2-exit__ev-label">現在の企業価値</div>
                <div className="ch2-exit__ev-value">¥{ev.toLocaleString()}</div>
            </div>

            <div className="ch2-exit__options">
                {options.map(opt => (
                    <div
                        key={opt.key}
                        className="ch2-exit__option"
                        onClick={() => selectExit(opt.key)}
                    >
                        <h3>{opt.icon} {opt.title}</h3>
                        <div className="ch2-exit__option-amount">
                            ¥{opt.amount.toLocaleString()}
                        </div>
                        <div className="ch2-exit__option-desc">{opt.desc}</div>
                    </div>
                ))}
            </div>

            <button
                className="ch2-actions__back"
                onClick={() => useRetailStore.setState({ phase: 'ch2-dashboard' })}
            >
                ← ダッシュボードに戻る
            </button>
        </div>
    );
}
