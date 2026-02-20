/**
 * チャネル＋初期広告設定画面 (Turn 3-4統合)
 */
import React, { useState } from 'react';
import { useECStore } from '../../store/ecEngine';
import { SALES_CHANNELS, AD_PLATFORMS } from '../../data/ch4Constants';

export default function ChannelAdSetup() {
    const setupChannelsAndAds = useECStore(s => s.setupChannelsAndAds);
    const money = useECStore(s => s.money);

    const [channels, setChannels] = useState(['own_ec']);
    const [adBudgets, setAdBudgets] = useState({});

    const toggleChannel = (key) => {
        if (key === 'own_ec') return;
        setChannels(prev =>
            prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
        );
    };

    const updateBudget = (platform, value) => {
        const p = AD_PLATFORMS[platform];
        // If below min, snap to 0 (user dragged it down)
        const finalVal = (value > 0 && value < p.minBudget) ? p.minBudget : value;
        setAdBudgets(prev => ({ ...prev, [platform]: finalVal }));
    };

    const totalAdBudget = Object.values(adBudgets).reduce((s, v) => s + (v || 0), 0);
    const channelSetupCost = channels.reduce((s, c) => s + (SALES_CHANNELS[c]?.setupCost || 0), 0);

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">販売チャネル＆初期広告</div>
                <div className="ch4-header__phase">資金: ¥{money.toLocaleString()}</div>
            </div>

            <div className="ch4-card">
                <div className="ch4-card__title">販売チャネル</div>
                {Object.entries(SALES_CHANNELS).map(([key, ch]) => (
                    <div key={key} className="ch4-toggle-row">
                        <div className="ch4-toggle-row__info">
                            <div className="ch4-toggle-row__name">
                                {ch.name}
                                {ch.required && <span className="ch4-badge ch4-badge--success">必須</span>}
                            </div>
                            <div className="ch4-toggle-row__desc">
                                手数料{Math.round(ch.commissionRate * 100)}% ｜ 月額¥{ch.monthlyCost.toLocaleString()}
                                {ch.setupCost > 0 && ` ｜ 構築¥${ch.setupCost.toLocaleString()}`}
                            </div>
                        </div>
                        {!ch.required ? (
                            <button
                                className={`ch4-toggle ${channels.includes(key) ? 'ch4-toggle--on' : ''}`}
                                onClick={() => toggleChannel(key)}
                            />
                        ) : (
                            <button className="ch4-toggle ch4-toggle--on" disabled />
                        )}
                    </div>
                ))}
            </div>

            <div className="ch4-card">
                <div className="ch4-card__title">初期広告設定</div>
                <p style={{ fontSize: '0.68rem', color: 'var(--ch4-text-sub)', marginBottom: '0.5rem' }}>
                    広告費は毎週消費されます。最低1つの媒体を選択してください。
                </p>
                {Object.entries(AD_PLATFORMS).map(([key, p]) => (
                    <div key={key} className="ch4-slider">
                        <div className="ch4-slider__header">
                            <span className="ch4-slider__label">{p.name}</span>
                            <span className="ch4-slider__value">
                                ¥{(adBudgets[key] || 0).toLocaleString()}/週
                            </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={200000}
                            step={10000}
                            value={adBudgets[key] || 0}
                            onChange={e => updateBudget(key, Number(e.target.value))}
                        />
                        <div style={{ fontSize: '0.58rem', color: 'var(--ch4-text-sub)' }}>
                            最低¥{p.minBudget.toLocaleString()} ｜ 初期CPA目安 ¥{p.baseCPA.toLocaleString()} ｜ {p.desc}
                        </div>
                    </div>
                ))}

                <div className="ch4-row ch4-row--total" style={{ marginTop: '0.5rem' }}>
                    <span className="ch4-row__label">週間広告費合計</span>
                    <span className="ch4-row__value">¥{totalAdBudget.toLocaleString()}</span>
                </div>
                {channelSetupCost > 0 && (
                    <div className="ch4-row">
                        <span className="ch4-row__label">チャネル構築費（初期のみ）</span>
                        <span className="ch4-row__value">¥{channelSetupCost.toLocaleString()}</span>
                    </div>
                )}
            </div>

            {totalAdBudget > 0 && (
                <button
                    className="ch4-btn ch4-btn--primary"
                    onClick={() => setupChannelsAndAds(channels, adBudgets)}
                >
                    開業する
                </button>
            )}
        </>
    );
}
