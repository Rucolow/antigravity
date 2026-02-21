import React from 'react';

/**
 * WeeklyFocusBar — 毎週の戦略カード選択UI
 * 3枚のカードから1枚を選ぶ。選択しないとconfirmWeekできない。
 */
export default function WeeklyFocusBar({ cards, selected, onSelect }) {
    if (!cards || cards.length === 0) return null;

    return (
        <div style={{
            padding: '10px 14px', marginBottom: 12, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.08)',
        }}>
            <div style={{
                fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
                marginBottom: 8, letterSpacing: '0.04em',
            }}>
                ⚡ 今週の経営判断
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
                {cards.map(card => {
                    const isSelected = selected === card.id;
                    return (
                        <button
                            key={card.id}
                            onClick={() => onSelect(card.id)}
                            style={{
                                flex: 1,
                                padding: '8px 6px',
                                borderRadius: 8,
                                border: isSelected
                                    ? '2px solid #60a5fa'
                                    : '1px solid rgba(255,255,255,0.1)',
                                background: isSelected
                                    ? 'rgba(96,165,250,0.12)'
                                    : 'rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s ease',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                            }}
                        >
                            <div style={{ fontSize: '1.1rem', marginBottom: 2 }}>{card.icon}</div>
                            <div style={{
                                fontSize: '0.65rem', fontWeight: 700,
                                color: isSelected ? '#60a5fa' : 'rgba(255,255,255,0.85)',
                                marginBottom: 3,
                            }}>
                                {card.title}
                            </div>
                            <div style={{
                                fontSize: '0.52rem', color: 'rgba(255,255,255,0.45)',
                                marginBottom: 4, lineHeight: 1.3,
                            }}>
                                {card.desc}
                            </div>
                            <div style={{ fontSize: '0.5rem', lineHeight: 1.5 }}>
                                <div style={{ color: '#34d399' }}>▲ {card.upside}</div>
                                <div style={{ color: '#f87171' }}>▼ {card.downside}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {!selected && (
                <div style={{
                    textAlign: 'center', fontSize: '0.55rem',
                    color: 'rgba(255,200,100,0.6)', marginTop: 6,
                    animation: 'pulse 2s ease-in-out infinite',
                }}>
                    ☝ カードを選んでから「次の週へ」
                </div>
            )}
        </div>
    );
}
