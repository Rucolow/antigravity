/**
 * Ch.4 振り返りレポート
 */
import React from 'react';
import { useECStore } from '../../store/ecEngine';
import { useGameStore } from '../../store/gameEngine';
import { useREStore } from '../../store/realEstateEngine';
import { PRODUCT_CATEGORIES, BRAND_CONCEPTS } from '../../data/ch4Constants';
import { gradeCh4 } from '../../data/chapterGrade';
import GradeDisplay from '../GradeDisplay';

export default function Ch4Report() {
    const state = useECStore();
    const cat = PRODUCT_CATEGORIES[state.productCategory];
    const brand = BRAND_CONCEPTS[state.brandConcept];

    const exitLabels = { mna: 'M&A（事業売却）', ipo: 'IPO（株式公開）', continue: '続ける（キャッシュカウ）', bankruptcy: '倒産（資金ショート）' };

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">振り返りレポート</div>
            </div>

            <GradeDisplay result={gradeCh4({
                ltvCacRatio: state.ltvCacRatio || 0,
                organicRatio: state.organicRatio || 0,
                money: state.money,
                skillCount: (state.skills || []).length,
            })} chapter={4} />

            {/* EXIT結果 */}
            <div className="ch4-exit-value">
                <div className="ch4-exit-value__label">{exitLabels[state.exitType] || 'EXIT'}</div>
                <div className="ch4-exit-value__amount">
                    ¥{(state.exitAmount || 0).toLocaleString()}
                </div>
                <div className="ch4-exit-value__multiple">
                    企業価値 ¥{(state.enterpriseValue || 0).toLocaleString()} ｜ {state.multiple || 0}x倍率
                </div>
            </div>

            {/* 事業概要 */}
            <div className="ch4-card">
                <div className="ch4-report-section">
                    <div className="ch4-report-section__title">事業概要</div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">商品カテゴリ</span>
                        <span className="ch4-row__value">{cat?.name || '—'}</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">ブランドコンセプト</span>
                        <span className="ch4-row__value">{brand?.name || '—'}</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">経営期間</span>
                        <span className="ch4-row__value">{state.turn}週間</span>
                    </div>
                    {state.isIncorporated && (
                        <div className="ch4-row">
                            <span className="ch4-row__label">法人化</span>
                            <span className="ch4-row__value" style={{ color: 'var(--ch4-green)' }}>✓ 実行済み</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 実績 */}
            <div className="ch4-card">
                <div className="ch4-report-section">
                    <div className="ch4-report-section__title">実績サマリー</div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">総売上</span>
                        <span className="ch4-row__value">¥{(state.totalSales || 0).toLocaleString()}</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">累計広告費</span>
                        <span className="ch4-row__value" style={{ color: 'var(--ch4-orange)' }}>
                            ¥{(state.totalAdSpend || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">累計利益</span>
                        <span className="ch4-row__value" style={{
                            color: (state.totalProfit || 0) >= 0 ? 'var(--ch4-green)' : 'var(--ch4-red)'
                        }}>
                            {(state.totalProfit || 0) >= 0 ? '' : '-'}¥{Math.abs(state.totalProfit || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">累計顧客数</span>
                        <span className="ch4-row__value">{(state.totalCustomers || 0).toLocaleString()}人</span>
                    </div>
                </div>
            </div>

            {/* ユニットエコノミクス */}
            <div className="ch4-card">
                <div className="ch4-report-section">
                    <div className="ch4-report-section__title">最終ユニットエコノミクス</div>
                    <div className="ch4-kpi-row ch4-kpi-row--quad">
                        <div className="ch4-kpi">
                            <div className="ch4-kpi__label">CAC</div>
                            <div className="ch4-kpi__value">¥{(state.cac || 0).toLocaleString()}</div>
                        </div>
                        <div className="ch4-kpi">
                            <div className="ch4-kpi__label">LTV</div>
                            <div className="ch4-kpi__value">¥{(state.ltv || 0).toLocaleString()}</div>
                        </div>
                        <div className="ch4-kpi">
                            <div className="ch4-kpi__label">LTV/CAC</div>
                            <div className={`ch4-kpi__value ${(state.ltvCacRatio || 0) >= 3 ? 'ch4-kpi__value--green' : 'ch4-kpi__value--accent'}`}>
                                {state.ltvCacRatio || 0}x
                            </div>
                        </div>
                        <div className="ch4-kpi">
                            <div className="ch4-kpi__label">ROAS</div>
                            <div className="ch4-kpi__value">{state.roas || 0}x</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 構造分析 */}
            <div className="ch4-card">
                <div className="ch4-report-section">
                    <div className="ch4-report-section__title">構造分析</div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">オーガニック比率</span>
                        <span className="ch4-row__value" style={{
                            color: (state.organicRatio || 0) >= 0.5 ? 'var(--ch4-green)' : 'var(--ch4-text)'
                        }}>
                            {Math.round((state.organicRatio || 0) * 100)}%
                        </span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">リピート率</span>
                        <span className="ch4-row__value">{Math.round((state.repeatRate || 0) * 100)}%</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">ブランド評判</span>
                        <span className="ch4-row__value">★{(state.reputation || 3.5).toFixed(1)}</span>
                    </div>
                    {state.subscriberCount > 0 && (
                        <div className="ch4-row">
                            <span className="ch4-row__label">サブスク会員数</span>
                            <span className="ch4-row__value">{state.subscriberCount}人</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 獲得スキル */}
            <div className="ch4-card">
                <div className="ch4-report-section">
                    <div className="ch4-report-section__title">獲得スキル</div>
                    {(state.skills || []).length > 0 ? (
                        <div className="ch4-skill-grid">
                            {state.skills.map((s, i) => (
                                <span key={i} className="ch4-skill-badge">{s}</span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.72rem', color: 'var(--ch4-text-sub)' }}>スキル未獲得</p>
                    )}
                </div>
            </div>

            {/* ストーリー */}
            <div className="ch4-card">
                <div className="ch4-story">
                    {`画面に向き合い続けた76週間が終わった。

カフェはドアベルの音。小売はレジの音。宿泊は「おはようございます」。
ECは——受注通知のプッシュ音。

会ったことのない人が、あなたの商品を買ってくれた。
レビューを書いてくれた。
友達にシェアしてくれた。

画面の向こうに人はいた。
数字の向こうに、生活があった。

——次のChapterへ。
「仕組み」の次は「レバレッジ」を学ぶ。`}
                </div>
            </div>

            <div className="ch4-card">
                <div className="ch4-event__character">
                    <div className="ch4-event__character-name">ショウさん</div>
                    <div className="ch4-event__character-text">
                        「お前はもう"仕組み"を作れる側の人間だ。{'\n'}
                        次は——他人の金（レバレッジ）を使って、仕組みを何倍にもする方法を教える。{'\n'}
                        不動産投資——1千万で1億を動かす世界だ。」
                    </div>
                </div>
            </div>

            {/* フッター（資金引き継ぎ + Ch.5 スタート） */}
            <div className="ch4-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--ch4-text-sub)' }}>最終資金残高</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ch4-gold)', marginTop: '0.1rem' }}>
                    ¥{(state.money || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.78rem', lineHeight: 1.7, marginTop: '0.5rem', padding: '10px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.08)' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 600 }}>📘 最後の挑戦</p>
                    <p style={{ margin: 0 }}>事業で稼いだ資金を、資産に変えて「お金に働いてもらう」段階へ。</p>
                    <p style={{ margin: 0 }}>P/Lを超え、B/S（貸借対照表）で考える世界が始まる。</p>
                </div>
                <button
                    className="ch4-btn ch4-btn--primary"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => {
                        const ch4State = useECStore.getState();
                        useREStore.getState().initFromCh4(ch4State);
                        useGameStore.setState({ chapter: 5 });
                    }}
                >
                    Chapter 5「不動産投資」を始める →
                </button>
            </div>
        </>
    );
}
