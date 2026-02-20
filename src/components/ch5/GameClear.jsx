/**
 * ゲームクリア演出
 */
import React from 'react';
import { useREStore } from '../../store/realEstateEngine';

export default function GameClear() {
    const s = useREStore();
    const goToFinalReport = useREStore(st => st.goToFinalReport);

    const netWorthYen = `¥${(s.netWorth || 0).toLocaleString()}`;

    return (
        <>
            <div className="ch5-header">
                <div className="ch5-header__chapter">ANTIGRAVITY</div>
                <div className="ch5-header__title">GAME CLEAR</div>
            </div>

            <div className="ch5-clear-value">
                <div className="ch5-clear-value__label">純 資 産</div>
                <div className="ch5-clear-value__amount">{netWorthYen}</div>
                <div className="ch5-clear-value__sub">¥100,000,000 達成</div>
            </div>

            <div className="ch5-card">
                <div className="ch5-story">
                    {`¥0 から始まった物語。

Chapter 1。¥300万のカフェ。
P/Lを初めて読んだ。「赤字」という言葉の重さを知った。

Chapter 2。小売の棚に商品を並べた。
在庫が「現金が眠った姿」だと知った。

Chapter 3。宿泊業。
空室率という「見えない敵」と戦った。

Chapter 4。EC/D2C。
CAC＞LTV、という方程式の呪いを解いた。

そしてChapter 5。不動産。
借金は重力だと教わった。
でも——使い方次第で推進力になると知った。

それが ANTIGRAVITY。

純資産 ${netWorthYen}。
¥0からこの数字まで。
全部、自分の判断で。`}
                </div>
            </div>

            <div className="ch5-card">
                <div className="ch5-event__character">
                    <div className="ch5-event__character-name">ショウさん</div>
                    <div className="ch5-event__character-text">
                        {`「教えることは、もう何もない。

P/L。CF。B/S。
3つの財務諸表。3つの"レンズ"。
同じ現実を、3つの角度から見る力。

お前はもう——数字が読める。
数字から"物語"が読める。

俺の授業は終わりだ。
これからは——お前が誰かの"ショウさん"になる番だ。」`}
                    </div>
                </div>
            </div>

            <div className="ch5-card">
                <div className="ch5-event__character">
                    <div className="ch5-event__character-name">ケンジ</div>
                    <div className="ch5-event__character-text">
                        {`「お前……マジで¥1億か。
俺はまだ途中だけど——
お前が先に行ってくれたおかげで、道が見える。
いつか追いつく。……たぶん。」`}
                    </div>
                </div>
            </div>

            <div className="ch5-card">
                <div className="ch5-event__character">
                    <div className="ch5-event__character-name">アヤさん</div>
                    <div className="ch5-event__character-text">
                        {`「社長。私も……いつか自分のお店を持ちます。
社長の隣で5つの事業を見てきました。
P/LもCFもB/Sも、少しはわかります。

ありがとうございました。」`}
                    </div>
                </div>
            </div>

            <button className="ch5-btn ch5-btn--primary" onClick={goToFinalReport}>
                最終レポートを見る →
            </button>
        </>
    );
}
