import { useGameStore } from '../store/gameEngine';
import { TARGET_MONEY } from '../data/constants';

export default function Dashboard() {
    const { money, proceedFromDashboard, stamina } = useGameStore();
    const remaining = Math.max(0, TARGET_MONEY - money);

    // ステータスはすべてHUDに表示されているため、
    // ダッシュボードはシンプルに「今週を始める」ボタンだけ

    return (
        <div className="screen dashboard" style={{
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: 24,
        }}>
            <div>
                <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                    letterSpacing: '0.05em',
                }}>
                    カフェ開業まで
                </div>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: 'var(--gold)',
                }}>
                    ¥{remaining.toLocaleString()}
                </div>
            </div>

            {stamina < 30 && (
                <div style={{
                    fontSize: '0.78rem',
                    color: 'var(--red)',
                    padding: '8px 14px',
                    background: 'rgba(216, 48, 48, 0.06)',
                    borderRadius: 8,
                }}>
                    ⚠️ 体力が低い！今週は休みを多めにとろう
                </div>
            )}

            <button className="btn btn-primary" onClick={proceedFromDashboard}>
                今週を始める →
            </button>
        </div>
    );
}
