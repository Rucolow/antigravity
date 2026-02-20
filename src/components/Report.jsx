import { useGameStore } from '../store/gameEngine';
import { useCafeStore } from '../store/cafeEngine';
import { evaluateSkills } from '../data/skills';

export default function Report() {
    const state = useGameStore(s => s);
    const {
        money, turn, baitoType, baitoDaysWorked, sedoriItemsBought,
        marcheSessions, decisions, furima, shouInvestment, fusionAmount,
        fusionRate, fusionYears, fusionScore,
    } = state;

    // スキル判定（skills.js の定義を使用）
    const acquiredSkills = evaluateSkills(state);

    // 開業資金計算
    const selfCapital = money + shouInvestment;
    const totalFunding = selfCapital + fusionAmount;
    const monthlyRepay = fusionAmount > 0
        ? Math.round(fusionAmount * (1 + fusionRate / 100 * fusionYears) / (fusionYears * 12))
        : 0;

    // バイト名マップ
    const baitoNames = { cafe: 'カフェホール', convenience: 'コンビニ（深夜）', moving: '引越し' };

    return (
        <div className="report-screen">
            <h2 className="report__title">Chapter 0 — 振り返りレポート</h2>

            {/* 基本データ */}
            <div className="report__section">
                <h3>📊 データ</h3>
                <div className="report__stats">
                    <div className="report__stat">
                        <span className="report__stat-label">到達週数</span>
                        <span className="report__stat-value">{turn}週</span>
                    </div>
                    <div className="report__stat">
                        <span className="report__stat-label">バイト</span>
                        <span className="report__stat-value">{baitoNames[baitoType]}（{baitoDaysWorked}日）</span>
                    </div>
                    <div className="report__stat">
                        <span className="report__stat-label">せどり仕入</span>
                        <span className="report__stat-value">{sedoriItemsBought}品</span>
                    </div>
                    <div className="report__stat">
                        <span className="report__stat-label">マルシェ出店</span>
                        <span className="report__stat-value">{marcheSessions}回</span>
                    </div>
                    <div className="report__stat">
                        <span className="report__stat-label">フリマ売却</span>
                        <span className="report__stat-value">{furima.totalSold}品</span>
                    </div>
                </div>
            </div>

            {/* 開業資金 */}
            <div className="report__section">
                <h3>💼 開業資金</h3>
                <div className="report__funding">
                    <div className="report__funding-row">
                        <span>あなたの貯金</span>
                        <span className="mono">¥{money.toLocaleString()}</span>
                    </div>
                    <div className="report__funding-row">
                        <span>ショウの出資</span>
                        <span className="mono">¥{shouInvestment.toLocaleString()}</span>
                    </div>
                    <div className="report__funding-row report__funding-sub">
                        <span>自己資金合計</span>
                        <span className="mono">¥{selfCapital.toLocaleString()}</span>
                    </div>
                    <div className="report__funding-divider" />
                    <div className="report__funding-row">
                        <span>融資（公庫）</span>
                        <span className="mono">¥{fusionAmount.toLocaleString()}</span>
                    </div>
                    {fusionAmount > 0 && (
                        <div className="report__funding-detail">
                            面談スコア {fusionScore}/9 ・ 金利{fusionRate}% ・ {fusionYears}年 ・ 月返済¥{monthlyRepay.toLocaleString()}
                        </div>
                    )}
                    <div className="report__funding-divider report__funding-divider--gold" />
                    <div className="report__funding-row report__funding-total">
                        <span>開業資金 合計</span>
                        <span className="mono text-gold">¥{totalFunding.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* スキル */}
            <div className="report__section">
                <h3>🎯 獲得スキル（Ch.1に引き継ぎ）</h3>
                {acquiredSkills.length > 0 ? (
                    <div className="report__skills">
                        {acquiredSkills.map(sk => (
                            <div key={sk.id} className="report__skill">
                                <div className="report__skill-header">
                                    <span className="report__skill-icon">{sk.icon}</span>
                                    <span className="report__skill-name">{sk.name}</span>
                                </div>
                                <div className="report__skill-desc">{sk.desc}</div>
                                <div className="report__skill-bonus">→ {sk.ch1Bonus}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        スキルを獲得できなかった…次はもっと頑張ろう！
                    </p>
                )}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 8 }}>
                    ※ バイト{baitoDaysWorked >= 12 ? '✓' : `${baitoDaysWorked}/12日`}
                    ・せどり{sedoriItemsBought >= 20 ? '✓' : `${sedoriItemsBought}/20品`}
                    ・マルシェ{marcheSessions >= 5 ? '✓' : `${marcheSessions}/5回`}
                    ・フリマ{furima.totalSold >= 10 ? '✓' : `${furima.totalSold}/10品`}
                </p>
            </div>

            {/* 判断記録 */}
            {decisions.length > 0 && (
                <div className="report__section">
                    <h3>📝 あなたの判断</h3>
                    <div className="report__decisions">
                        {decisions.map((d, i) => (
                            <div key={i} className="report__decision">
                                <span className="report__decision-turn">Turn {d.turn}</span>
                                <span className="report__decision-label">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="report__footer">
                <p>Chapter 1「カフェ経営」に続く——</p>
                <button
                    className="btn-gold"
                    style={{ marginTop: '1rem', width: '100%' }}
                    onClick={() => {
                        // Ch.0 state → Ch.1 transition
                        const ch0State = useGameStore.getState();
                        useGameStore.setState({ chapter: 1 });
                        useCafeStore.getState().initFromCh0({
                            money: ch0State.money,
                            shouInvestment: ch0State.shouInvestment,
                            baitoType: ch0State.baitoType,
                            acquiredSkills: acquiredSkills.map(s => s.id),
                            fusionAmount: ch0State.fusionAmount,
                            fusionRate: ch0State.fusionRate,
                            fusionYears: ch0State.fusionYears,
                        });
                    }}
                >
                    Chapter 1 へ →
                </button>
            </div>
        </div>
    );
}
