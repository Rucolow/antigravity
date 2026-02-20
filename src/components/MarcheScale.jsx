import { useGameStore } from '../store/gameEngine';
import { MARCHE, getPhase } from '../data/constants';

export default function MarcheScale() {
    const selectMarcheScale = useGameStore(s => s.selectMarcheScale);
    const turn = useGameStore(s => s.turn);
    const marcheCostMultiplier = useGameStore(s => s.marcheCostMultiplier);
    const currentPhase = getPhase(turn);

    const scales = [
        { key: 'small', ...MARCHE.scales.small },
        { key: 'medium', ...MARCHE.scales.medium },
        { key: 'large', ...MARCHE.scales.large },
    ];

    return (
        <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 32 }}>
            <p className="section-header">マルシェ出店</p>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>今回はどの規模でいく？</h2>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 8 }}>
                大きく出ればリターンも大きい！でもコストも上がるよ
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 32 }}>
                ※ 準備＋出店で2日間を使うよ
            </p>

            {scales.map(scale => {
                const phaseRange = scale.profitRange[currentPhase] || scale.profitRange.A;
                const actualCost = Math.floor(scale.cost * marcheCostMultiplier);
                return (
                    <div key={scale.key} className="card" style={{ marginBottom: 12 }} onClick={() => selectMarcheScale(scale.key)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                                {scale.name}
                            </span>
                            <span className="mono text-red" style={{ fontSize: '0.85rem' }}>
                                初期費用 ¥{actualCost.toLocaleString()}
                                {marcheCostMultiplier > 1 && <span style={{ fontSize: '0.7rem', color: '#e11d48' }}> (値上げ中)</span>}
                            </span>
                        </div>
                        <div className="mono text-emerald" style={{ fontSize: '0.85rem' }}>
                            うまくいけば ¥{phaseRange.min.toLocaleString()} 〜 ¥{phaseRange.max.toLocaleString()} の利益！
                        </div>
                    </div>
                );
            })}

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
                ※ 雨の日は売上ダウン（{MARCHE.rainChance * 100}%の確率で雨）
            </p>
        </div>
    );
}

