/**
 * Ch.5 オープニング
 */
import React from 'react';
import { useREStore } from '../../store/realEstateEngine';

export default function REOpening() {
    const startGame = useREStore(s => s.startGame);
    const properties = useREStore(s => s.properties);
    const prop = properties[0];

    return (
        <>
            <div className="ch5-header">
                <div className="ch5-header__chapter">Chapter 5 — 不動産投資</div>
                <div className="ch5-header__title">所有権移転</div>
            </div>

            <div className="ch5-card">
                <div className="ch5-story">
                    {`司法書士の事務所で登記手続き。

登記簿謄本に法人の名前が載った。
——この建物は、もう「自分のもの」だ。
${prop ? `${prop.totalUnits}室。${prop.totalUnits}つの玄関。${prop.totalUnits}つの人生を受け入れる箱。` : ''}`}
                </div>
            </div>

            <div className="ch5-card">
                <div className="ch5-event__character">
                    <div className="ch5-event__character-name">アヤさん</div>
                    <div className="ch5-event__character-text">
                        {`「社長……建物って、重いですね。
カフェの時は"お店"だった。
小売も"お店"だった。
宿泊は"旅の拠点"だった。
不動産は——"誰かの住む場所"。
ここで起きること全部に、私たちが責任を持つんですよね。」`}
                    </div>
                </div>
            </div>

            <div className="ch5-card">
                <div className="ch5-event__character">
                    <div className="ch5-event__character-name">ショウさん</div>
                    <div className="ch5-event__character-text">
                        {`「いいか。これが最後のステージだ。
P/Lは"いくら儲けたか"。CFは"いくら現金があるか"。
B/Sは"いくら持っていて、いくら借りているか"。

全部同時に見る。最後のステージだけのことはある。
純資産¥100,000,000——それがゴールだ。」`}
                    </div>
                </div>
            </div>

            <button className="ch5-btn ch5-btn--primary" onClick={startGame}>
                不動産経営を始める →
            </button>
        </>
    );
}
