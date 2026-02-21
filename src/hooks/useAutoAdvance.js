/**
 * 自動進行フック — autoMode が true のとき、delay ms 後に callback を実行
 * イベント画面では使わない → Result画面とDashboard確認時のみ使用
 */
import { useEffect, useRef } from 'react';

export function useAutoAdvance(autoMode, callback, delay = 800) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        if (!autoMode) return;
        const timer = setTimeout(() => callbackRef.current(), delay);
        return () => clearTimeout(timer);
    }, [autoMode, delay]);
}
