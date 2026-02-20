import { useGameStore } from '../store/gameEngine';
import { BAITO } from '../data/constants';

export default function BaitoSelect() {
    const selectBaito = useGameStore(s => s.selectBaito);

    const options = [
        { key: 'cafe', ...BAITO.cafe, desc: '週6日OK！シフトの融通がきくから副業もしやすい。', vibe: '体力消耗 ★☆☆' },
        { key: 'convenience', ...BAITO.convenience, desc: '週5日まで。深夜帯だから時給は高め！', vibe: '体力消耗 ★★☆' },
        { key: 'moving', ...BAITO.moving, desc: '週3日限定だけど一撃がデカい！体力勝負。', vibe: '体力消耗 ★★★' },
    ];

    return (
        <div className="screen">
            <p className="section-header">はじめの一歩</p>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 8 }}>まず、バイトを選ぼう！</h2>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 8 }}>
                これがキミの収入のベース。
            </p>
            <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: 32, color: 'var(--text-muted)' }}>
                ※ 一度決めたら変更できないよ
            </p>

            {options.map(opt => (
                <div key={opt.key} className="card baito-card" onClick={() => selectBaito(opt.key)}>
                    <div className="baito-card__name">{opt.name}</div>
                    <div className="baito-card__pay">日給 ¥{opt.dailyPay.toLocaleString()}　最大 {opt.maxDays}日/週</div>
                    <div className="baito-card__desc">{opt.desc}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{opt.vibe}</div>
                </div>
            ))}
        </div>
    );
}
