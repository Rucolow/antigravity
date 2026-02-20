import { useGameStore } from '../store/gameEngine';
import { TARGET_MONEY } from '../data/constants';

export default function PrototypeEnd() {
    const { money, turn } = useGameStore();
    const reached = money >= TARGET_MONEY;

    return (
        <div className="screen prototype-end">
            <div className="prototype-end__title">
                {reached ? 'おめでとう！' : 'おつかれさま！'}
            </div>
            <p className="text-secondary" style={{ lineHeight: 1.8, marginBottom: 16 }}>
                {reached
                    ? '目標達成！カフェ開業の夢に一歩近づいた！'
                    : '10週間の挑戦が終わりました'}
            </p>

            <div className="prototype-end__stats">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="text-secondary">がんばった期間</span>
                    <span className="mono text-gold">{turn - 1} 週間</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="text-secondary">貯めたお金</span>
                    <span className="mono text-gold">¥{money.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">目標</span>
                    <span className="mono text-muted">¥{TARGET_MONEY.toLocaleString()}</span>
                </div>
            </div>

            <p className="text-secondary" style={{ lineHeight: 1.8, marginTop: 24, fontSize: '0.9rem' }}>
                {reached
                    ? 'でも、本当の挑戦はここから。'
                    : '配分を変えたらもっと稼げるかも？'}
                <br />
                続きをお楽しみに！
            </p>

            <div style={{ height: 32 }} />

            <button
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
            >
                もう一回チャレンジ！
            </button>
        </div>
    );
}
