/**
 * EC開業演出画面
 */
import React from 'react';
import { useECStore } from '../../store/ecEngine';

export default function ECOpening() {
    const startGameplay = useECStore(s => s.startGameplay);

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">EC・D2C事業 開業</div>
            </div>

            <div className="ch4-card">
                <div className="ch4-story">
                    {`「配信開始」ボタンを押した。

5分後——
表示回数：1,247。クリック：3。購入：0。

1,247人があなたの広告を見た。
でも1,244人が無視した。
3人がクリックした。
でも3人が買わなかった。

カフェでは、ドアを開けた人の80%が注文した。
ECでは、広告を見た人の0.24%しかクリックしない。

——これが「普通」。`}
                </div>
            </div>

            <div className="ch4-card">
                <div className="ch4-event__character">
                    <div className="ch4-event__character-name">ショウさん</div>
                    <div className="ch4-event__character-text">
                        今からお前がやることは"デジタルの焚き火"だ。{'\n'}
                        広告費という薪をくべる。{'\n'}
                        火が付けば客が来る。付かなければ灰になる。{'\n'}
                        薪の質——つまりクリエイティブ次第だ。
                    </div>
                </div>
            </div>

            <button className="ch4-btn ch4-btn--primary" onClick={startGameplay}>
                ECビジネスを始める
            </button>
        </>
    );
}
