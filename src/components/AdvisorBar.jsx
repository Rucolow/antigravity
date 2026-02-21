import React from 'react';
import { getAdvisorComment, getCharEmoji } from '../data/advisorComments';

/**
 * リアクティブ・アドバイザーバー
 * キャラクターが経営数値に反応して1行コメントを表示
 */
export default function AdvisorBar({ chapter, state }) {
    const comment = getAdvisorComment(chapter, state);
    if (!comment) return null;

    return (
        <div style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            padding: '10px 12px', marginBottom: 10, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.06)',
        }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
            }}>
                {getCharEmoji(comment.char)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.6rem', fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: 2, letterSpacing: '0.05em',
                }}>
                    💬 {comment.char}
                </div>
                <div style={{
                    fontSize: '0.72rem', lineHeight: 1.5,
                    color: 'rgba(255,255,255,0.8)',
                }}>
                    「{comment.msg}」
                </div>
            </div>
        </div>
    );
}
