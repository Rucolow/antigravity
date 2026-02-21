import React from 'react';

/**
 * チャプターゴール進捗バー
 * Ch.0の¥300,000目標バーと同様の、常時表示される進捗UI
 */
export default function GoalBar({ goal, state }) {
    if (!goal) return null;

    const achieved = goal.check(state);
    const prog = goal.progress(state);
    const pct = prog.target > 0 ? Math.min(100, (prog.current / prog.target) * 100) : 0;

    return (
        <div style={{
            padding: '10px 14px',
            marginBottom: 12,
            borderRadius: 10,
            background: achieved
                ? 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            border: achieved ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.08)',
        }}>
            {/* ヘッダー */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: '1rem' }}>{goal.icon}</span>
                <span style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    color: achieved ? '#34d399' : 'rgba(255,255,255,0.9)',
                    letterSpacing: '0.02em',
                }}>
                    {achieved ? '✅ GOAL達成！' : `🎯 ${goal.title}`}
                </span>
            </div>

            {/* プログレスバー */}
            {!achieved && (
                <div style={{
                    height: 6, borderRadius: 3,
                    background: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden', marginBottom: 6,
                }}>
                    <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${pct}%`,
                        background: pct >= 75
                            ? 'linear-gradient(90deg, #34d399, #22c55e)'
                            : pct >= 50
                                ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                : 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                        transition: 'width 0.5s ease',
                    }} />
                </div>
            )}

            {/* サブテキスト */}
            <div style={{
                fontSize: '0.62rem',
                color: achieved ? 'rgba(52,211,153,0.8)' : 'rgba(255,255,255,0.45)',
                lineHeight: 1.4,
            }}>
                {achieved
                    ? goal.reward
                    : <>
                        <span style={{ fontWeight: 600 }}>{prog.label}</span>
                        <span style={{ marginLeft: 8 }}>{goal.narrative}</span>
                    </>
                }
            </div>
        </div>
    );
}
