/**
 * @module useLazyState
 */

import useStableCallback from './useStableCallback';
import React, { useEffect, useRef, useState } from 'react';

type State<S> = S | (() => S);

interface Dispatch<S> {
  (value: React.SetStateAction<S>, delay?: number): void;
}

type UseLazyState<S> = [state: S, setLazyState: Dispatch<S>];

/**
 * @function clearTimerRef
 * @description 清理延时器
 * @param timerRef 延时器引用
 */
function clearTimerRef(timerRef: React.RefObject<Timeout | null>): void {
  const { current: timer } = timerRef;

  if (timer != null) {
    clearTimeout(timer);

    timerRef.current = null;
  }
}

/**
 * @function useLazyState
 * @description [hook] 使用延时状态，在延迟时间后更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S>(initialState: State<S>, delay?: number): UseLazyState<S>;
/**
 * @function useLazyState
 * @description [hook] 使用延时状态，在延迟时间后更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S = undefined>(initialState?: State<S>, delay?: number): UseLazyState<S | undefined>;
/**
 * @function useLazyState
 * @description [hook] 使用延时状态，在延迟时间后更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S = undefined>(initialState?: State<S>, delay: number = 200): UseLazyState<S | undefined> {
  const timerRef = useRef<Timeout | null>(null);
  const [state, setState] = useState(initialState);

  const setLazyState = useStableCallback<Dispatch<S | undefined>>((value, timeout = delay) => {
    clearTimerRef(timerRef);

    if (timeout <= 0) {
      setState(value);
    } else {
      timerRef.current = setTimeout(() => {
        if (timerRef.current != null) {
          setState(value);

          timerRef.current = null;
        }
      }, timeout);
    }
  });

  useEffect(() => {
    return () => {
      clearTimerRef(timerRef);
    };
  }, []);

  return [state, setLazyState];
}
