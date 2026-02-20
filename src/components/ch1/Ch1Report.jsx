import React from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import { LOCATIONS, INTERIORS, MACHINES, OPERATING_HOURS } from '../../data/ch1Constants';

export default function Ch1Report() {
    const state = useCafeStore(s => s);

    const totalTurns = state.turn;
    const initialInvestment = state.ch0Transfer ? state.ch0Transfer.money + (state.ch0Transfer.shouInvestment || 0) : 0;
    const roi = initialInvestment > 0 ? ((state.money - initialInvestment) / initialInvestment * 100).toFixed(1) : 0;
    const loc = LOCATIONS[state.location];
    const interior = INTERIORS[state.interiorGrade];
    const machine = MACHINES[state.machineGrade];
    const hours = OPERATING_HOURS[state.operatingHours];

    // 平均KPI
    const ph = state.profitHistory;
    const avgSales = ph.length > 0 ? Math.floor(ph.reduce((s, p) => s + p.sales, 0) / ph.length) : 0;
    const avgProfit = ph.length > 0 ? Math.floor(ph.reduce((s, p) => s + p.profit, 0) / ph.length) : 0;
    const avgCustomers = ph.length > 0 ? Math.floor(ph.reduce((s, p) => s + p.customers, 0) / ph.length) : 0;
    const profitRate = state.totalSales > 0 ? ((state.totalProfit / state.totalSales) * 100).toFixed(1) : '0.0';

    // EXIT名
    const exitLabel = {
        mna: 'M&A（売却）', ipo: 'IPO（上場）',
        succession: '事業承継', liquidation: '清算',
    }[state.exitType] || '—';

    // Ch.1で獲得したスキル
    const learnedSkills = [];
    if (state.totalProfit > 0) learnedSkills.push({ icon: '📊', name: 'P&L思考', desc: '損益計算書で経営を管理する力' });
    if (state.firstBlackTurn) learnedSkills.push({ icon: '⚖️', name: '損益分岐点', desc: '固定費と変動費から最低必要売上を逆算する力' });
    if (state.staff.length > 0 || state.staffQuitOccurred) learnedSkills.push({ icon: '👥', name: '人材管理', desc: '人件費と生産性のバランスを取る力' });
    if (state.chainCompetitorArrived) learnedSkills.push({ icon: '🏪', name: '競合対応', desc: '差別化と共存を判断する力' });
    if (state.taxRecords?.length > 0 || state.turn >= 24) learnedSkills.push({ icon: '🧾', name: '税務知識', desc: '所得税・住民税・事業税・国保の基礎' });
    learnedSkills.push({ icon: '🚪', name: 'EXIT判断', desc: '事業を手放すタイミングを見極める力' });

    // 重要判断のフィルタ
    const keyDecisions = state.decisions.filter(d =>
        ['location', 'interior', 'machine', 'hours', 'exit', 'hire', 'event'].includes(d.type)
    ).slice(0, 15);

    return (
        <div className="ch1-report">
            <h2>Chapter 1 振り返りレポート</h2>
            <h3 className="ch1-report__cafe-name">{state.cafeName || 'My Cafe'} — {totalTurns}週間の記録</h3>

            {/* サマリー */}
            <div className="ch1-report__section">
                <h4>📋 店舗情報</h4>
                <div className="ch1-report__row"><span>立地</span><span>{loc?.name || '—'}</span></div>
                <div className="ch1-report__row"><span>内装</span><span>{interior?.name || '—'}</span></div>
                <div className="ch1-report__row"><span>マシン</span><span>{machine?.name || '—'}</span></div>
                <div className="ch1-report__row"><span>営業時間</span><span>{hours?.name || '—'}</span></div>
                <div className="ch1-report__row"><span>メニュー数</span><span>{state.menu.length}品</span></div>
                <div className="ch1-report__row"><span>最終スタッフ数</span><span>{state.staff.length}人</span></div>
            </div>

            {/* 経営結果 */}
            <div className="ch1-report__section">
                <h4>💰 経営結果</h4>
                <div className="ch1-report__row"><span>EXIT方法</span><span>{exitLabel}</span></div>
                <div className="ch1-report__row"><span>EXIT受取額</span><span>¥{(state.exitAmount || 0).toLocaleString()}</span></div>
                <div className="ch1-report__row ch1-report__row--highlight"><span>最終現金</span><span>¥{state.money.toLocaleString()}</span></div>
                <div className="ch1-report__row"><span>累計売上</span><span>¥{state.totalSales.toLocaleString()}</span></div>
                <div className="ch1-report__row"><span>累計利益</span><span className={state.totalProfit >= 0 ? 'ch1-kpi--positive' : 'ch1-kpi--negative'}>¥{state.totalProfit.toLocaleString()}</span></div>
                <div className="ch1-report__row"><span>利益率</span><span>{profitRate}%</span></div>
                <div className="ch1-report__row"><span>投資倍率</span><span>{roi}%</span></div>
            </div>

            {/* 平均KPI */}
            <div className="ch1-report__section">
                <h4>📈 平均KPI</h4>
                <div className="ch1-report__row"><span>週平均売上</span><span>¥{avgSales.toLocaleString()}</span></div>
                <div className="ch1-report__row"><span>週平均利益</span><span>¥{avgProfit.toLocaleString()}</span></div>
                <div className="ch1-report__row"><span>週平均来客数</span><span>{avgCustomers}人</span></div>
                <div className="ch1-report__row"><span>最終評判</span><span>{'★'.repeat(Math.floor(state.reputation))} {state.reputation.toFixed(1)}</span></div>
            </div>

            {/* マイルストーン */}
            {state.milestonesHit.length > 0 && (
                <div className="ch1-report__section">
                    <h4>🏆 マイルストーン</h4>
                    {state.milestonesHit.map((m, i) => (
                        <div key={i} className="ch1-report__milestone">
                            <span className="ch1-report__dturn">W{m.turn}</span>
                            <span>
                                {m.type === 'first_black' && `初の黒字週（¥${m.value?.toLocaleString()}）`}
                                {m.type === 'monthly_500k' && '月商¥500,000突破'}
                                {m.type === 'net_worth_3m' && '純資産¥3,000,000突破'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* 習得スキル */}
            <div className="ch1-report__section">
                <h4>🎓 習得スキル（Ch.2に引き継ぎ）</h4>
                <div className="ch1-report__skills">
                    {learnedSkills.map((sk, i) => (
                        <div key={i} className="ch1-report__skill">
                            <span className="ch1-report__skill-icon">{sk.icon}</span>
                            <div>
                                <div className="ch1-report__skill-name">{sk.name}</div>
                                <div className="ch1-report__skill-desc">{sk.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 判断の記録 */}
            <div className="ch1-report__section">
                <h4>📝 判断の記録</h4>
                {keyDecisions.map((d, i) => (
                    <div key={i} className="ch1-report__decision">
                        <span className="ch1-report__dturn">W{d.turn}</span>
                        <span>{d.label}</span>
                    </div>
                ))}
            </div>

            {/* ケンジ */}
            {state.kenjiStage > 0 && (
                <div className="ch1-report__section">
                    <h4>😤 ケンジの結末</h4>
                    <p style={{ fontSize: '0.75rem', color: '#8b7355', lineHeight: 1.6 }}>
                        {state.kenjiStage >= 5
                            ? 'ケンジのカフェは閉店した。売上はあったが、利益が出ていなかった。P&Lを見ていなかった。——Ch.2で再起を図る。'
                            : `ケンジは現在ステージ${state.kenjiStage}。まだ踏ん張っている。`
                        }
                    </p>
                </div>
            )}

            {/* Ch.2へ */}
            <div className="ch1-report__footer">
                <p>次のChapterでは「在庫 = 眠っている現金」を学びます。</p>
                <p>カフェで培った損益分岐点の感覚が、仕入れ量の判断に直接活きます。</p>
                <button
                    className="ch1-setup__confirm"
                    onClick={() => useCafeStore.setState({ phase: 'ch1-bridge' })}
                    style={{ marginTop: 16 }}
                >
                    Chapter 2 へ →
                </button>
            </div>
        </div>
    );
}
