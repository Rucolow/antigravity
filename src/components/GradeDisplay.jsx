/**
 * チャプター成績ランク表示コンポーネント
 * 全チャプターのReport画面で共通使用
 */
import React from 'react';
import { gradeColor } from '../data/chapterGrade';

export default function GradeDisplay({ result, chapter }) {
    if (!result) return null;

    const color = gradeColor(result.grade);

    return (
        <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            margin: '12px 0',
            background: `linear-gradient(135deg, rgba(${result.grade === 'S' ? '255,215,0' : result.grade === 'A' ? '52,211,153' : '96,165,250'},0.06), transparent)`,
            border: `1px solid ${color}33`,
            borderRadius: 8,
        }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: '#888', marginBottom: 4 }}>
                CHAPTER {chapter} GRADE
            </div>
            <div style={{
                fontSize: '2.2rem',
                fontWeight: 900,
                color,
                lineHeight: 1,
                textShadow: `0 0 20px ${color}44`,
            }}>
                {result.grade}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#888', marginTop: 2 }}>
                {result.score} / 100
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: 'center', marginTop: 10 }}>
                {result.details.map((d, i) => (
                    <div key={i} style={{ fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: '#999', minWidth: 48, textAlign: 'right' }}>{d.label}</span>
                        <span style={{ color, letterSpacing: '-1px' }}>
                            {'★'.repeat(d.stars)}{'☆'.repeat(5 - d.stars)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
