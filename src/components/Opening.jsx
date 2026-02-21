import { useGameStore } from '../store/gameEngine';
import { TARGET_MONEY } from '../data/constants';

export default function Opening() {
    const startGame = useGameStore(s => s.startGame);

    return (
        <div className="screen opening">
            <h1 className="opening__title">ANTIGRAVITY</h1>

            <p className="opening__text">あなたには夢がある。</p>
            <p className="opening__text">自分のカフェを開くこと。</p>

            <div style={{ height: 32 }} />

            <p className="opening__text">
                開業資金<span className="text-gold mono"> ¥{TARGET_MONEY.toLocaleString()} </span>を貯めよう！
            </p>
            <p className="opening__text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                バイトに副業、やれることは全部やる。
                <br />でも、無理しすぎると体を壊すかも…？
            </p>

            <p className="opening__money">¥0</p>

            <p className="opening__text" style={{ fontSize: '0.9rem' }}>
                全財産ゼロからのスタート！
            </p>

            <div style={{ height: 48 }} />

            <button className="btn btn-primary" onClick={startGame}>
                はじめる
            </button>
        </div>
    );
}
