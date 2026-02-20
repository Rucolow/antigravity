import { useState } from 'react';
import { useGameStore } from '../store/gameEngine';
import { TOTAL_DAYS, MARCHE, SEDORI } from '../data/constants';
import TermTooltip from './TermTooltip';

export default function Allocation() {
    const { baitoMaxDays, sedoriUnlocked, marcheUnlocked, baitoDailyPay, confirmAllocation, stamina } = useGameStore();

    const [baito, setBaito] = useState(3);
    const [sedori, setSedori] = useState(0);
    const [marche, setMarche] = useState(false);

    const marcheDays = marche ? MARCHE.daysRequired : 0;
    const used = baito + sedori + marcheDays;
    const rest = TOTAL_DAYS - used;

    const canIncrease = (current, max) => current < max && used < TOTAL_DAYS;
    const canDecrease = (current) => current > 0;

    const adjust = (setter, current, delta, max) => {
        const next = current + delta;
        if (next < 0 || next > max) return;
        if (delta > 0 && used >= TOTAL_DAYS) return;
        setter(next);
    };

    const toggleMarche = () => {
        if (!marche && used + MARCHE.daysRequired > TOTAL_DAYS) return;
        setMarche(!marche);
    };

    const handleConfirm = () => {
        if (rest < 0) return;
        confirmAllocation({ baito, sedori, marche, rest });
    };

    // 期待収入の概算
    const estimateBaito = baito * baitoDailyPay;
    const estimateSedori = sedori > 0 ? `¥${(sedori * 8000).toLocaleString()}〜¥${(sedori * 15000).toLocaleString()}` : '—';

    // 体力状態ラベル
    const staminaLabel = stamina >= 80 ? { text: '絶好調！', color: 'var(--emerald)' }
        : stamina >= 60 ? { text: 'まずまず', color: 'var(--text-muted)' }
            : stamina >= 30 ? { text: 'お疲れ気味…', color: 'var(--gold)' }
                : { text: 'ヘトヘト！', color: 'var(--red)' };

    // 体力予測
    const baitoDrain = baito * 5;
    const sedoriDrain = sedori * 7;
    const marcheDrain = marche ? 15 : 0;
    const restRecover = rest * 15;
    const predictedDelta = restRecover - baitoDrain - sedoriDrain - marcheDrain;
    const predictedStamina = Math.max(0, Math.min(100, stamina + predictedDelta));

    // 休みの一言
    const restComment = rest === 0 ? '休みなし！大丈夫？'
        : rest >= 3 ? 'しっかり回復できそう！'
            : rest >= 2 ? 'バランスいいね'
                : '最低限の休み';

    return (
        <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 24 }}>
            <p className="section-header">日数配分</p>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 4 }}>今週の予定を決めよう！</h2>
            <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: 12 }}>
                全7日間をどう使う？ 休みは体力回復に使えるよ
            </p>

            {/* 体力予測 */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', marginBottom: 8,
                fontSize: '0.8rem',
            }}>
                <span style={{ color: 'var(--text-muted)' }}>
                    体力: {stamina} → <span style={{
                        color: predictedStamina <= 0 ? 'var(--red)'
                            : predictedDelta < 0 ? 'var(--gold)'
                                : 'var(--emerald)',
                        fontWeight: 600,
                    }}>
                        {predictedStamina}
                    </span>
                    <span style={{ color: predictedDelta >= 0 ? 'var(--emerald)' : 'var(--red)', marginLeft: 4 }}>
                        ({predictedDelta >= 0 ? '+' : ''}{predictedDelta})
                    </span>
                </span>
                <span style={{ color: staminaLabel.color, fontSize: '0.75rem' }}>
                    {staminaLabel.text}
                </span>
            </div>

            {predictedStamina <= 0 && (
                <div style={{
                    padding: '8px 12px',
                    background: 'rgba(240,64,64,0.15)',
                    border: '2px solid var(--red)',
                    marginBottom: 12,
                    fontSize: '0.8rem',
                    color: 'var(--red)',
                    fontWeight: 600,
                }}>
                    この配分だと体が持たないよ…！来週ダウンしちゃう！
                </div>
            )}

            <div className="allocation__remaining">
                残り <span>{rest}</span> 日
            </div>

            {/* バイト */}
            <div className="allocation__row" style={{ flexWrap: 'wrap' }}>
                <div className="allocation__label">バイト</div>
                <div className="mono" style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 600, flex: 1, textAlign: 'right', marginRight: 10 }}>
                    ¥{estimateBaito.toLocaleString()}
                </div>
                <div className="allocation__controls">
                    <button
                        className="allocation__btn"
                        disabled={!canDecrease(baito)}
                        onClick={() => adjust(setBaito, baito, -1, baitoMaxDays)}
                    >−</button>
                    <span className="allocation__days">{baito}</span>
                    <button
                        className="allocation__btn"
                        disabled={!canIncrease(baito, baitoMaxDays)}
                        onClick={() => adjust(setBaito, baito, 1, baitoMaxDays)}
                    >+</button>
                </div>
            </div>

            {/* せどり */}
            {sedoriUnlocked && (
                <div className="allocation__row" style={{ flexWrap: 'wrap' }}>
                    <div className="allocation__label"><TermTooltip term="せどり" /></div>
                    <div className="mono" style={{ fontSize: '0.9rem', color: sedori > 0 ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 600, flex: 1, textAlign: 'right', marginRight: 10 }}>
                        {estimateSedori}
                    </div>
                    <div className="allocation__controls">
                        <button
                            className="allocation__btn"
                            disabled={!canDecrease(sedori)}
                            onClick={() => adjust(setSedori, sedori, -1, SEDORI.maxDaysPerWeek)}
                        >−</button>
                        <span className="allocation__days">{sedori}</span>
                        <button
                            className="allocation__btn"
                            disabled={!canIncrease(sedori, SEDORI.maxDaysPerWeek)}
                            onClick={() => adjust(setSedori, sedori, 1, SEDORI.maxDaysPerWeek)}
                        >+</button>
                    </div>
                </div>
            )}

            {/* マルシェ */}
            {marcheUnlocked && (
                <div className="allocation__row">
                    <div className="allocation__label"><TermTooltip term="マルシェ" /></div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flex: 1, textAlign: 'right', marginRight: 10 }}>
                        {marche ? '2日（準備+出店）' : '—'}
                    </div>
                    <div className="allocation__controls">
                        <div
                            className={`toggle ${marche ? 'toggle--on' : ''}`}
                            onClick={toggleMarche}
                        >
                            <div className="toggle__knob" />
                        </div>
                    </div>
                </div>
            )}

            {/* 休み */}
            <div className="allocation__row">
                <div className="allocation__label">休み</div>
                <div style={{
                    fontSize: '0.7rem',
                    color: rest === 0 ? 'var(--red)' : rest >= 2 ? 'var(--emerald)' : 'var(--text-muted)',
                    flex: 1, textAlign: 'right', marginRight: 10,
                }}>
                    {restComment}
                </div>
                <div className="allocation__controls">
                    <span className="allocation__days" style={{ color: rest === 0 ? 'var(--red)' : 'var(--text-primary)' }}>
                        {rest}
                    </span>
                </div>
            </div>

            <div style={{ height: 24 }} />

            <button
                className="btn btn-primary"
                disabled={rest < 0}
                onClick={handleConfirm}
            >
                この配分でいこう！
            </button>
        </div>
    );
}
