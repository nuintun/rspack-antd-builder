/**
 * @module useStableCallback
 */

import { useInsertionEffect, useRef } from 'react';

export interface Callback {
  (this: unknown, ...args: any[]): unknown;
}

interface StableCallback<T extends Callback> {
  trampoline: T;
  next: T | null;
  update: () => void;
  callback: T | null;
}

function assertNotCalled() {
  if (__DEV__) {
    throw new Error('cannot call stable callback during render');
  }
}

function createStableCallback<C extends Callback>(): StableCallback<C> {
  const stable: StableCallback<C> = {
    next: null,
    callback: assertNotCalled as C,
    update: () => {
      stable.callback = stable.next;
    },
    trampoline: function (this, ...args) {
      return stable.callback?.apply(this, args);
    } as C
  };

  return stable;
}

/**
 * @function useStableCallback
 * @description [hook] 创建引用稳定且调用最新已提交回调的函数
 * @param callback 回调函数
 */
export default function useStableCallback<C extends Callback>(callback: C): C {
  const stableRef = useRef<StableCallback<C> | null>(null);

  if (stableRef.current === null) {
    stableRef.current = createStableCallback<C>();
  }

  const stable = stableRef.current;

  stable.next = callback;

  // 在 commit 阶段同步最新值，避免渲染期写 ref 在并发模式下持有未提交值
  useInsertionEffect(stable.update);

  return stable.trampoline;
}
