/**
 * Ch.4 イベント表示コンポーネント
 */
import React from 'react';
import { useECStore } from '../../store/ecEngine';

export default function Ch4EventDisplay() {
    const state = useECStore();
    const event = state.currentEvent;
    const eventResult = state.eventResult;

    // イベントもない & 結果テキストもない → ダッシュボードへ
    if (!event && !eventResult) {
        return (
            <div className="ch4-card" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p>読み込み中……</p>
                <button className="ch4-btn ch4-btn--primary" onClick={state.clearEventResult}>
                    ダッシュボードに戻る
                </button>
            </div>
        );
    }

    // 結果テキスト表示モード（選択肢を選んだ後）
    if (!event && eventResult) {
        return (
            <>
                <div className="ch4-header">
                    <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                    <div className="ch4-header__title">Week {state.turn}</div>
                </div>
                <div className="ch4-event__result">{eventResult}</div>
                <button className="ch4-btn ch4-btn--primary" onClick={state.clearEventResult}>
                    ダッシュボードに戻る
                </button>
            </>
        );
    }

    const handleChoice = (choice) => {
        state.dismissEvent(choice.effect);
    };

    const handleDismiss = () => {
        state.dismissEvent(event.effect || {});
    };

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">Week {state.turn}</div>
            </div>

            <div className="ch4-event">
                <div className="ch4-event__type">{event.type || 'event'}</div>
                <div className="ch4-event__title">{event.title}</div>
                <div className="ch4-event__text">{event.text}</div>

                {event.character && (
                    <div className="ch4-event__character">
                        <div className="ch4-event__character-name">{event.character}</div>
                        <div className="ch4-event__character-text">{event.characterText}</div>
                    </div>
                )}

                {/* 選択肢 */}
                {event.choices && (
                    <div style={{ marginTop: '0.75rem' }}>
                        {event.choices.map((c, i) => (
                            <button
                                key={i}
                                className="ch4-btn ch4-btn--secondary"
                                onClick={() => handleChoice(c)}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* 選択肢がないイベント → 了解ボタン */}
                {!event.choices && (
                    <button
                        className="ch4-btn ch4-btn--primary"
                        onClick={handleDismiss}
                        style={{ marginTop: '0.75rem' }}
                    >
                        了解
                    </button>
                )}
            </div>
        </>
    );
}
