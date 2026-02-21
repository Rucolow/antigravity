import React from 'react';
import { useCafeStore } from '../../store/cafeEngine';

export default function Ch1EventDisplay() {
    const event = useCafeStore(s => s.currentEvent);
    const eventResult = useCafeStore(s => s.eventResult);
    const dismissEvent = useCafeStore(s => s.dismissEvent);

    if (!event) {
        return (
            <div className="ch1-event">
                <p>イベントなし</p>
                <button className="ch1-setup__confirm" onClick={() => useCafeStore.setState({ phase: 'ch1-dashboard' })}>
                    戻る →
                </button>
            </div>
        );
    }

    // イベント結果表示中
    if (eventResult) {
        return (
            <div className="ch1-event">
                <div className="ch1-event__result">
                    <p>{eventResult}</p>
                </div>
                <button className="ch1-setup__confirm" onClick={() => useCafeStore.setState({ eventResult: null, phase: 'ch1-dashboard' })}>
                    OK →
                </button>
            </div>
        );
    }

    return (
        <div className="ch1-event">
            {event.character && (
                <div className="ch1-event__character">
                    {event.character === 'shou' ? '👓' : event.character === 'kenji' ? '😤' : event.character === 'aya' ? '👩' : event.character === 'misaki' ? '📸' : event.character === 'ryouta' ? '👔' : '👤'}
                    <span>{event.character}</span>
                </div>
            )}

            <div className="ch1-event__text">
                {(Array.isArray(event.text) ? event.text : [event.text]).map((line, i) => (
                    <p key={i}>{line || '\u00A0'}</p>
                ))}
            </div>

            {event.choices ? (
                <div className="ch1-event__choices">
                    {event.choices.map((choice, i) => (
                        <button
                            key={i}
                            className="ch1-event__choice"
                            onClick={() => dismissEvent(i)}
                        >
                            {choice.label}
                        </button>
                    ))}
                </div>
            ) : (
                <>
                    <button className="ch1-setup__confirm" onClick={() => dismissEvent()}>
                        OK →
                    </button>
                    <button onClick={() => dismissEvent()} style={{ background: 'none', border: 'none', color: '#8b7355', fontSize: '0.65rem', cursor: 'pointer', marginTop: 6, opacity: 0.5 }}>
                        スキップ ▸
                    </button>
                </>
            )}
        </div>
    );
}
