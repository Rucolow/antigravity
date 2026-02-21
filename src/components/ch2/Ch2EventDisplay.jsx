import React from 'react';
import { useRetailStore } from '../../store/retailEngine';

const CHARACTER_ICONS = {
    character: '👤',
    kenji: '🧑‍💼',
    milestone: '🎯',
    human: '👥',
    turning_point: '⚡',
    tax: '🧾',
};

export default function Ch2EventDisplay() {
    const state = useRetailStore(s => s);
    const dismissEvent = useRetailStore(s => s.dismissEvent);
    const dismissEventResult = useRetailStore(s => s.dismissEventResult);
    const event = state.currentEvent;

    if (!event) return null;

    // イベント結果表示中
    if (state.eventResult) {
        return (
            <div className="ch2-event">
                <div className="ch2-event__character">
                    <span>{CHARACTER_ICONS[event.type] || '📋'}</span>
                    <span>{event.title}</span>
                </div>

                <div className="ch2-event__result">
                    {state.eventResult}
                </div>

                <div className="ch2-actions" style={{ marginTop: 20 }}>
                    <button className="ch2-actions__go" onClick={dismissEventResult}>
                        了解 →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="ch2-event">
            <div className="ch2-event__character">
                <span>{CHARACTER_ICONS[event.type] || '📋'}</span>
                <span>{event.title}</span>
            </div>

            <div className="ch2-event__text">
                {(event.description || event.text || '').split('\n').map((line, i) => (
                    <p key={i} style={{ opacity: 0, animation: `fadeInUp 0.5s ease ${i * 0.1}s forwards` }}>
                        {line || '\u00A0'}
                    </p>
                ))}
            </div>

            {event.choices && event.choices.length > 0 ? (
                <div className="ch2-event__choices">
                    {event.choices.map((choice, idx) => (
                        <button
                            key={idx}
                            className="ch2-event__choice"
                            onClick={() => dismissEvent(idx)}
                        >
                            <div className="ch2-event__choice-label">{choice.label}</div>
                            {choice.description && (
                                <div className="ch2-event__choice-desc">{choice.description}</div>
                            )}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="ch2-actions" style={{ marginTop: 20 }}>
                    <button className="ch2-actions__go" onClick={() => dismissEvent()}>
                        了解 →
                    </button>
                    <button onClick={() => dismissEvent()} style={{ background: 'none', border: 'none', color: 'var(--ch2-text-sub, #7a8ba0)', fontSize: '0.65rem', cursor: 'pointer', marginTop: 6, opacity: 0.5, width: '100%' }}>
                        スキップ ▸
                    </button>
                </div>
            )}
        </div>
    );
}
