/**
 * EXIT選択画面（Turn 76以降）
 */
import React from 'react';
import { useECStore } from '../../store/ecEngine';

export default function ECExitSelect() {
    const state = useECStore();
    const preview = state.getExitPreview();

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">EXIT — 事業の価値を決める</div>
            </div>

            <div className="ch4-card">
                <div className="ch4-story">
                    {`76週間。約1年半。

画面の中で始まったビジネスが、数字を生み出し続けた。
顧客は${(state.totalCustomers || 0).toLocaleString()}人。
累計売上は¥${(state.totalSales || 0).toLocaleString()}。

——この事業に値段をつけるとしたら、いくらだろう？`}
                </div>
            </div>

            {/* 企業価値 */}
            <div className="ch4-exit-value">
                <div className="ch4-exit-value__label">推定企業価値（EV）</div>
                <div className="ch4-exit-value__amount">
                    ¥{(preview.enterpriseValue || 0).toLocaleString()}
                </div>
                <div className="ch4-exit-value__multiple">
                    年間利益 ¥{(preview.annualProfit || 0).toLocaleString()} × {preview.multiple || 0}倍
                </div>
            </div>

            {/* バリュエーション内訳 */}
            <div className="ch4-card">
                <div className="ch4-card__title">マルチプル構成要素</div>
                <div className="ch4-row">
                    <span className="ch4-row__label">ベースマルチプル</span>
                    <span className="ch4-row__value">5.0x</span>
                </div>
                <div className="ch4-row">
                    <span className="ch4-row__label">成長率ボーナス</span>
                    <span className="ch4-row__value" style={{ color: preview.growthRate > 5 ? 'var(--ch4-green)' : preview.growthRate < -5 ? 'var(--ch4-red)' : 'var(--ch4-text)' }}>
                        {preview.growthRate > 0 ? '+' : ''}{preview.growthRate}%
                    </span>
                </div>
                <div className="ch4-row">
                    <span className="ch4-row__label">オーガニック比率</span>
                    <span className="ch4-row__value">{Math.round((state.organicRatio || 0) * 100)}%</span>
                </div>
                <div className="ch4-row">
                    <span className="ch4-row__label">ブランド評判</span>
                    <span className="ch4-row__value">★{(state.reputation || 3.5).toFixed(1)}</span>
                </div>
                <div className="ch4-row">
                    <span className="ch4-row__label">サブスク会員</span>
                    <span className="ch4-row__value">{state.subscriberCount || 0}人</span>
                </div>
            </div>

            {/* EXIT選択肢 */}
            <div className="ch4-card">
                <div className="ch4-card__title">EXITの方法を選ぶ</div>

                <div className="ch4-select-card" style={{ marginBottom: '0.6rem' }} onClick={() => state.selectExit('mna')}>
                    <div className="ch4-select-card__name">🤝 M&A（事業売却）</div>
                    <div className="ch4-select-card__desc">
                        企業価値の70%が手元に入る。完全に手放す。<br />
                        推定受取額: ¥{Math.round((preview.enterpriseValue || 0) * 0.70).toLocaleString()}
                    </div>
                </div>

                <div className="ch4-select-card" style={{ marginBottom: '0.6rem' }} onClick={() => state.selectExit('ipo')}>
                    <div className="ch4-select-card__name">📈 IPO（株式公開）</div>
                    <div className="ch4-select-card__desc">
                        持株の30%を売却。100%手放すわけではない。<br />
                        推定受取額: ¥{Math.round((preview.enterpriseValue || 0) * 0.30).toLocaleString()}
                    </div>
                </div>

                <div className="ch4-select-card" onClick={() => state.selectExit('continue')}>
                    <div className="ch4-select-card__name">🏗️ 続ける（キャッシュカウ）</div>
                    <div className="ch4-select-card__desc">
                        売却せず安定経営を続ける。売却益はないが、毎月の利益が入り続ける。
                    </div>
                </div>
            </div>

            <div className="ch4-card">
                <div className="ch4-event__character">
                    <div className="ch4-event__character-name">ショウさん</div>
                    <div className="ch4-event__character-text">
                        「お前は今から「自分の事業に値段をつけられる」人間になる。{'\n'}
                        カフェは"場所"だった。小売は"在庫"だった。宿泊は"体験"だった。{'\n'}
                        ECは——"仕組み"だ。仕組みには値段がつく。」
                    </div>
                </div>
            </div>
        </>
    );
}
