import { useGameStore } from '../store/gameEngine';
import { TARGET_MONEY } from '../data/constants';
import { renderWithTooltips } from './TermTooltip';

const CHARACTER_COLORS = {
    shou: { bg: '#e8f0ff', color: '#2868d8', label: 'ショウ', icon: '翔' },
    kenji: { bg: '#ffe8e8', color: '#d83030', label: 'ケンジ', icon: '健' },
    ryouta: { bg: '#e8fff0', color: '#1a9e52', label: 'リョウタ', icon: '亮' },
    misaki: { bg: '#f0e8ff', color: '#7840c8', label: 'ミサキ', icon: '美' },
    takuya: { bg: '#fff8e0', color: '#d4920a', label: 'タクヤ', icon: '拓' },
};

function interpolateText(lines, state) {
    const projectedWeekly = (state.baitoDailyPay || 0) * 5;
    const projectedNet = projectedWeekly - 25750;
    const projectedWeeks = projectedNet > 0 ? Math.ceil(TARGET_MONEY / projectedNet) : 999;
    const projectedMonths = Math.ceil(projectedWeeks / 4);

    return lines.map(line =>
        line
            .replace('{baitoPay}', state.baitoDailyPay?.toLocaleString() || '—')
            .replace('{projectedWeekly}', projectedWeekly.toLocaleString())
            .replace('{projectedNet}', projectedNet.toLocaleString())
            .replace('{projectedWeeks}', projectedWeeks.toString())
            .replace('{projectedMonths}', projectedMonths.toString())
            .replace('{money}', state.money?.toLocaleString() || '0')
            .replace('{remaining}', Math.max(0, TARGET_MONEY - state.money).toLocaleString())
            .replace('{furimaRemaining}', state.furima?.remaining?.toString() || '0')
    );
}

export default function EventDisplay() {
    const { currentEvent, eventChoiceResult, dismissEvent, dismissEventResult, ...state } = useGameStore();

    // 選択結果画面
    if (eventChoiceResult) {
        return (
            <div className="screen event">
                <div className="event__text">{renderWithTooltips(eventChoiceResult)}</div>
                <button className="btn btn-primary" onClick={dismissEventResult}>
                    次へ →
                </button>
            </div>
        );
    }

    if (!currentEvent) return null;

    const char = currentEvent.character ? CHARACTER_COLORS[currentEvent.character] : null;
    const textLines = interpolateText(currentEvent.text, state);

    return (
        <div className="screen event">
            {char && (
                <div className="event__character">
                    <div
                        className="event__character-icon"
                        style={{ background: char.bg, color: char.color }}
                    >
                        {char.icon}
                    </div>
                    {char.label}
                </div>
            )}

            <div className="event__text">
                {textLines.map((line, i) => (
                    line === '' ? <div key={i} className="event__text--empty" /> : <div key={i}>{renderWithTooltips(line)}</div>
                ))}
            </div>

            {currentEvent.type === 'unlock' && (
                <div className="unlock-badge">
                    {currentEvent.unlockLabel || '新しい選択肢が増えた！'}
                </div>
            )}

            <div style={{ marginTop: 24 }} />

            {currentEvent.choices ? (
                currentEvent.choices.map((choice, i) => (
                    <button
                        key={i}
                        className="btn btn-choice"
                        onClick={() => dismissEvent(i)}
                    >
                        {choice.label}
                    </button>
                ))
            ) : (
                <button className="btn btn-primary" onClick={() => dismissEvent()}>
                    次へ →
                </button>
            )}
        </div>
    );
}
