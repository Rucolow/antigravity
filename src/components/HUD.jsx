import { useState } from 'react';
import { useGameStore } from '../store/gameEngine';
import { TARGET_MONEY, BAITO } from '../data/constants';
import TermTooltip from './TermTooltip';

const CHAR_PROFILES = {
    shou: {
        icon: '翔', color: '#2868d8', bg: '#e8f0ff',
        name: 'ショウ',
        role: 'メンター',
        desc: '元コンサルタント。近所のスーパーの価格を全て暗記している謎の男。知識量が異常だが、お節介で人間味がある。',
        quote: '「その程度の原価意識でどうする」',
    },
    kenji: {
        icon: '健', color: '#d83030', bg: '#ffe8e8',
        name: 'ケンジ',
        role: 'ライバル',
        desc: '同い年。やたら声がデカい。行動力はあるが判断力がない。せどりで月50万稼ぐ「予定」。',
        quote: '「俺、目利きすごいから」',
    },
    ryouta: {
        icon: '亮', color: '#1a9e52', bg: '#e8fff0',
        name: 'リョウタ',
        role: '大学の友人',
        desc: '大手メーカーに内定済み。「安定した人生」の象徴。悪気なくマウントを取ってくる。',
        quote: '「有給。知ってる？ 休んでも金もらえるやつ」',
    },
    misaki: {
        icon: '美', color: '#7840c8', bg: '#f0e8ff',
        name: 'ミサキ',
        role: 'マルシェ仲間',
        desc: 'ハンドメイドアクセサリー作家。インスタの映え重視。売上と利益の区別がつかない。',
        quote: '「材料費引いたら¥8,000だけど。それって利益？」',
    },
    takuya: {
        icon: '拓', color: '#d4920a', bg: '#fff8e0',
        name: 'タクヤ',
        role: 'せどり仲間',
        desc: '同い年。副業でせどりをやっている。同じ店で仕入れを競うライバルでもあり、情報交換できる仲間にもなる。',
        quote: '「最近この店の良品、すぐなくなるんだよね」',
    },
};
const ALL_CHARS = ['shou', 'kenji', 'ryouta', 'misaki', 'takuya'];

export default function HUD() {
    const phase = useGameStore(s => s.phase);
    const money = useGameStore(s => s.money);
    const stamina = useGameStore(s => s.stamina);
    const turn = useGameStore(s => s.turn);
    const baitoType = useGameStore(s => s.baitoType);
    const weekResult = useGameStore(s => s.weekResult);
    const sedoriUnlocked = useGameStore(s => s.sedoriUnlocked);
    const marcheUnlocked = useGameStore(s => s.marcheUnlocked);
    const metCharacters = useGameStore(s => s.metCharacters);

    const [profileOpen, setProfileOpen] = useState(null);

    if (phase === 'opening' || phase === 'baito-select') return null;

    const progress = Math.min((money / TARGET_MONEY) * 100, 100);
    const staminaColor = stamina >= 60 ? 'var(--emerald)' : stamina >= 30 ? 'var(--gold)' : 'var(--red)';
    const staminaLabel = stamina >= 80 ? '絶好調'
        : stamina >= 60 ? 'まずまず'
            : stamina >= 30 ? 'お疲れ'
                : 'ヘトヘト';

    const baitoName = baitoType ? BAITO[baitoType]?.name : '';



    const openProfile = CHAR_PROFILES[profileOpen];

    return (
        <div className="hud">
            {/* Row 1: Week + BaitoName + Money */}
            <div className="hud__top">
                <div className="hud__left">
                    <span className="hud__week">{turn}週目</span>
                    {baitoName && <span className="hud__baito-name">{baitoName}</span>}
                </div>
                <div className="hud__money-block">
                    <span className="hud__money-value">¥{money.toLocaleString()}</span>
                </div>
            </div>

            {/* Row 2: Progress bar */}
            <div className="hud__progress-row">
                <span className="hud__progress-label">目標</span>
                <div className="hud__progress-bar">
                    <div className="hud__progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="hud__progress-text">
                    {progress >= 100 ? '達成！' : `${Math.floor(progress)}%`}
                </span>
            </div>

            {/* Row 3: Stamina bar */}
            <div className="hud__stamina-row">
                <span className="hud__stamina-label">体力</span>
                <div className="hud__stamina-bar">
                    <div
                        className="hud__stamina-fill"
                        style={{ width: `${stamina}%`, background: staminaColor }}
                    />
                </div>
                <span className="hud__stamina-text" style={{ color: staminaColor }}>
                    {stamina}
                </span>
                <span className="hud__stamina-status" style={{ color: staminaColor }}>
                    {staminaLabel}
                </span>
            </div>

            {/* Divider */}
            <div className="hud__divider" />

            {/* Row 4: 収支 + できること */}
            <div className="hud__info-row">
                {/* 先週の収支 */}
                <div className="hud__info-cell">
                    <span className="hud__info-label">先週</span>
                    {weekResult && !weekResult.forcedRest ? (
                        <span className={`hud__info-value mono ${weekResult.total >= 0 ? 'text-emerald' : 'text-red'}`}>
                            {weekResult.total >= 0 ? '+' : ''}¥{weekResult.total.toLocaleString()}
                        </span>
                    ) : (
                        <span className="hud__info-value" style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                </div>

                {/* できること */}
                <div className="hud__info-cell">
                    <span className="hud__info-label">できること</span>
                    <div className="hud__tags">
                        <span className="hud__tag">バイト</span>
                        {sedoriUnlocked && (
                            <span className="hud__tag hud__tag--emerald">
                                <TermTooltip term="せどり" />
                            </span>
                        )}
                        {marcheUnlocked && (
                            <span className="hud__tag hud__tag--purple">
                                <TermTooltip term="マルシェ" />
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 5: 知り合い —名前＋役割付き */}
            <div className="hud__chars-row">
                <span className="hud__info-label">知り合い</span>
                <div className="hud__chars">
                    {ALL_CHARS.map(key => {
                        const met = metCharacters?.includes(key);
                        const ch = CHAR_PROFILES[key];
                        return met ? (
                            <div
                                key={key}
                                className="hud__char-chip"
                                style={{ background: ch.bg, color: ch.color, borderColor: ch.color + '30' }}
                                onClick={(e) => { e.stopPropagation(); setProfileOpen(key); }}
                            >
                                <span className="hud__char-chip-icon">{ch.icon}</span>
                                <span className="hud__char-chip-name">{ch.name}</span>
                                <span className="hud__char-chip-role">{ch.role}</span>
                            </div>
                        ) : (
                            <div key={key} className="hud__char-chip hud__char-chip--unknown">
                                <span className="hud__char-chip-icon">？</span>
                                <span className="hud__char-chip-name">？？？</span>
                            </div>
                        );
                    })}
                </div>
            </div>



            {/* Character Profile Popup */}
            {openProfile && (
                <div className="char-profile__overlay" onClick={() => setProfileOpen(null)}>
                    <div className="char-profile__popup" onClick={(e) => e.stopPropagation()}>
                        <div className="char-profile__header">
                            <div
                                className="char-profile__icon"
                                style={{ background: openProfile.bg, color: openProfile.color }}
                            >
                                {openProfile.icon}
                            </div>
                            <div>
                                <div className="char-profile__name">{openProfile.name}</div>
                                <div className="char-profile__role">{openProfile.role}</div>
                            </div>
                        </div>
                        <div className="char-profile__desc">{openProfile.desc}</div>
                        <div className="char-profile__quote">{openProfile.quote}</div>
                        <button className="char-profile__close" onClick={() => setProfileOpen(null)}>
                            とじる
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
