/**
 * ベンチマークバー — KPIの業界平均との対比をビジュアル表示
 * KPIグリッド下に配置し、プレイヤーの経営判断の参考にする
 */
import React from 'react';

/**
 * @param {string} label  - 指標名
 * @param {number} value  - プレイヤーの現在値
 * @param {number} avg    - 業界平均値
 * @param {number} max    - ゲージの最大値
 * @param {string} unit   - 単位（%, ¥, x, etc.）
 * @param {boolean} lowerIsBetter - 低いほうが良い指標（CAC等）
 */
export default function BenchmarkBar({ label, value, avg, max, unit = '', lowerIsBetter = false }) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    const avgPct = Math.min(100, Math.max(0, (avg / max) * 100));
    const isGood = lowerIsBetter ? value <= avg : value >= avg;

    return (
        <div style={{ marginBottom: 6 }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.58rem', marginBottom: 2,
            }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                <span style={{
                    color: isGood ? 'var(--emerald, #34d399)' : 'var(--red, #ef4444)',
                    fontWeight: 600,
                }}>
                    {typeof value === 'number' ? (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)) : value}{unit}
                    {' '}
                    <span style={{ opacity: 0.6, fontWeight: 400 }}>
                        {isGood ? '▲ 良好' : '▼ 要改善'}
                    </span>
                </span>
            </div>
            <div style={{
                position: 'relative', height: 6, borderRadius: 3,
                background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
                {/* プレイヤーの値 */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, height: '100%',
                    width: `${pct}%`, borderRadius: 3,
                    background: isGood
                        ? 'linear-gradient(90deg, #34d399, #10b981)'
                        : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                    transition: 'width 0.3s',
                }} />
                {/* 業界平均マーカー */}
                <div style={{
                    position: 'absolute', top: -1, left: `${avgPct}%`,
                    width: 2, height: 8, borderRadius: 1,
                    background: 'rgba(255,255,255,0.6)',
                    transform: 'translateX(-1px)',
                }} />
            </div>
            <div style={{
                fontSize: '0.48rem', color: 'rgba(255,255,255,0.3)',
                textAlign: 'right', marginTop: 1,
            }}>
                業界平均 {typeof avg === 'number' ? (Number.isInteger(avg) ? avg.toLocaleString() : avg.toFixed(1)) : avg}{unit}
            </div>
        </div>
    );
}
