/**
 * CRM施策パネル
 */
import React from 'react';
import { useECStore } from '../../store/ecEngine';
import { CRM_TOOLS } from '../../data/ch4Constants';

export default function CRMPanel() {
    const state = useECStore();

    return (
        <>
            <div className="ch4-header">
                <div className="ch4-header__chapter">Chapter 4 — EC・D2C</div>
                <div className="ch4-header__title">CRM施策</div>
            </div>

            <div className="ch4-card">
                <div className="ch4-card__title">LTVを上げるための武器</div>
                <p style={{ fontSize: '0.68rem', color: 'var(--ch4-text-sub)', marginBottom: '0.5rem' }}>
                    リピーターこそが利益の源泉。CRM施策でLTVを最大化しよう。
                </p>

                {Object.entries(CRM_TOOLS).map(([key, tool]) => {
                    const isEnabled = state.crmEnabled?.[key];
                    const isLocked = state.turn < tool.unlockTurn;

                    return (
                        <div key={key} className="ch4-toggle-row">
                            <div className="ch4-toggle-row__info">
                                <div className="ch4-toggle-row__name">
                                    {tool.name}
                                    {isLocked && (
                                        <span className="ch4-badge ch4-badge--warning">
                                            Turn {tool.unlockTurn}で解放
                                        </span>
                                    )}
                                </div>
                                <div className="ch4-toggle-row__desc">
                                    {tool.monthlyCost > 0 && `月額¥${tool.monthlyCost.toLocaleString()} ｜ `}
                                    リピート率+{Math.round(tool.repeatBoost * 100)}%
                                    {tool.marginPenalty && ` ｜ 粗利率-${Math.round(tool.marginPenalty * 100)}%`}
                                    {tool.priceDiscount && ` ｜ 定期は-${Math.round(tool.priceDiscount * 100)}%で提供`}
                                </div>
                                <div className="ch4-toggle-row__desc" style={{ color: 'var(--ch4-text)' }}>
                                    {tool.desc}
                                </div>
                            </div>
                            {!isLocked ? (
                                <button
                                    className={`ch4-toggle ${isEnabled ? 'ch4-toggle--on' : ''}`}
                                    onClick={() => isEnabled ? state.disableCRM(key) : state.enableCRM(key)}
                                />
                            ) : (
                                <button className="ch4-toggle" disabled style={{ opacity: 0.3 }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* サブスク状況 */}
            {state.crmEnabled?.subscription && (
                <div className="ch4-card">
                    <div className="ch4-card__title">サブスクリプション状況</div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">会員数</span>
                        <span className="ch4-row__value">{state.subscriberCount || 0}人</span>
                    </div>
                    <div className="ch4-row">
                        <span className="ch4-row__label">月間解約率</span>
                        <span className="ch4-row__value" style={{
                            color: (state.churnRate || 0.05) > 0.05 ? 'var(--ch4-red)' : 'var(--ch4-green)'
                        }}>
                            {Math.round((state.churnRate || 0.05) * 100)}%
                        </span>
                    </div>
                </div>
            )}

            {/* 現在のリピート率 */}
            <div className="ch4-card">
                <div className="ch4-card__title">現在のリピート率</div>
                <div className="ch4-gauge">
                    <div className="ch4-gauge__header">
                        <span>リピート率</span>
                        <span>{Math.round((state.repeatRate || 0) * 100)}%</span>
                    </div>
                    <div className="ch4-gauge__track">
                        <div
                            className="ch4-gauge__fill ch4-gauge__fill--green"
                            style={{ width: `${Math.min(100, Math.round((state.repeatRate || 0) * 100 / 0.8 * 100))}%` }}
                        />
                    </div>
                </div>
            </div>

            <button className="ch4-btn ch4-btn--primary" onClick={state.backToDashboard}>
                ダッシュボードに戻る
            </button>
        </>
    );
}
