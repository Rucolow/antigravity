/**
 * Ch.5 イベント表示
 */
import React from 'react';
import { useREStore } from '../../store/realEstateEngine';

export default function Ch5EventDisplay() {
    const currentEvent = useREStore(s => s.currentEvent);
    const eventResult = useREStore(s => s.eventResult);
    const dismissEvent = useREStore(s => s.dismissEvent);
    const clearEventResult = useREStore(s => s.clearEventResult);

    // 結果テキスト表示中
    if (eventResult) {
        return (
            <>
                <div className="ch5-header">
                    <div className="ch5-header__chapter">Chapter 5 — 不動産投資</div>
                    <div className="ch5-header__title">結果</div>
                </div>
                <div className="ch5-card">
                    <div className="ch5-event__text">{eventResult}</div>
                </div>
                <button className="ch5-btn ch5-btn--primary" onClick={clearEventResult}>
                    OK →
                </button>
            </>
        );
    }

    // イベントなし → ダッシュボードへ
    if (!currentEvent) {
        clearEventResult();
        return null;
    }

    const ev = currentEvent;
    const hasChoices = ev.choices && ev.choices.length > 0;

    return (
        <>
            <div className="ch5-header">
                <div className="ch5-header__chapter">Chapter 5 — 不動産投資</div>
                <div className="ch5-header__title">{ev.title}</div>
            </div>

            <div className="ch5-card">
                <div className="ch5-event__title">{ev.title}</div>
                <div className="ch5-event__text">
                    {(Array.isArray(ev.text) ? ev.text : (ev.text || '').split('\n')).map((line, i) => (
                        <p key={i} style={{ margin: '4px 0' }}>{line || '\u00A0'}</p>
                    ))}
                </div>

                {ev.character && ev.characterText && (
                    <div className="ch5-event__character">
                        <div className="ch5-event__character-name">{ev.character}</div>
                        <div className="ch5-event__character-text">{ev.characterText}</div>
                    </div>
                )}

                {ev.character && !ev.characterText && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--ch5-accent)', marginTop: '0.2rem' }}>— {ev.character}</div>
                )}
            </div>

            {hasChoices ? (
                <div className="ch5-event__choices">
                    {ev.choices.map((c, i) => (
                        <button
                            key={i}
                            className="ch5-btn ch5-btn--secondary"
                            onClick={() => dismissEvent(i)}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            ) : (
                <button className="ch5-btn ch5-btn--primary" onClick={() => dismissEvent(null)}>
                    OK →
                </button>
            )}
        </>
    );
}
