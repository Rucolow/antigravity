import React from 'react';
import { useHotelStore } from '../../store/hotelEngine';

export default function Ch3EventDisplay() {
    const event = useHotelStore(s => s.currentEvent);
    const eventResult = useHotelStore(s => s.eventResult);
    const dismissEvent = useHotelStore(s => s.dismissEvent);
    const dismissEventResult = useHotelStore(s => s.dismissEventResult);
    const turn = useHotelStore(s => s.turn);

    if (!event) return null;

    // 結果表示中
    if (eventResult) {
        return (
            <div className="ch3-container">
                <div className="ch3-event">
                    <div className="ch3-event__title">{event.title}</div>
                    <div className="ch3-event__result">{eventResult}</div>
                    <button className="ch3-btn" onClick={dismissEventResult}>
                        続ける →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="ch3-container">
            <div style={{ fontSize: '0.7rem', color: 'var(--ch3-text-sub)', marginBottom: 8 }}>
                Week {turn}
            </div>

            <div className="ch3-event">
                <div className="ch3-event__title">{event.title}</div>
                <div className="ch3-event__text">
                    {(Array.isArray(event.text) ? event.text : (event.text || '').split('\n')).map((line, i) => (
                        <p key={i} style={{ margin: '4px 0' }}>{line || '\u00A0'}</p>
                    ))}
                </div>

                {/* キャラクター台詞 */}
                {event.character && event.characterText && (
                    <div className="ch3-event__character">
                        <div className="ch3-event__character-name">{event.character}</div>
                        <div>{event.characterText}</div>
                    </div>
                )}

                {/* 選択肢 */}
                {event.choices ? (
                    <div className="ch3-event__choices">
                        {event.choices.map((choice, i) => (
                            <button
                                key={i}
                                className="ch3-event__choice-btn"
                                onClick={() => dismissEvent(i)}
                            >
                                {choice.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <button className="ch3-btn" onClick={() => dismissEvent()}>
                        続ける →
                    </button>
                )}
            </div>
        </div>
    );
}
