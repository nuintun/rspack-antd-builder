/**
 * @module useStorageAccess
 */

import * as dom from '/js/utils/dom';
import useLazyState from './useLazyState';
import useSafeState from './useSafeState';
import { useCallback, useEffect } from 'react';

const isTopWindow = dom.isTopWindow();

const initialState = ((): PermissionState => {
  if (isTopWindow) {
    return 'granted';
  }

  if (!window.isSecureContext) {
    return 'denied';
  }

  if (!document.hasStorageAccess) {
    return 'granted';
  }

  return 'prompt';
})();

async function checkAccess(): Promise<PermissionState> {
  if (initialState !== 'prompt') {
    return initialState;
  }

  try {
    if (await document.hasStorageAccess()) {
      return 'granted';
    }

    const permission = await navigator.permissions.query({
      name: 'storage-access'
    });

    return permission.state;
  } catch {
    return 'prompt';
  }
}

async function requestAccess(): Promise<'denied' | 'granted'> {
  if (initialState !== 'prompt') {
    return initialState;
  }

  if (!document.requestStorageAccess) {
    return 'granted';
  }

  try {
    await document.requestStorageAccess();

    return 'granted';
  } catch {
    return 'denied';
  }
}

/**
 * @function useStorageAccess
 * @description [hook] 使用存储访问权限
 * @param delay 延迟时间
 */
export function useStorageAccess(delay?: number): [
  // 是否正在请求
  requesting: boolean,
  // 当前权限状态
  state: PermissionState,
  // 权限请求函数
  requestStorageAccess: () => Promise<'denied' | 'granted'>
] {
  const [requesting, setRequesting] = useLazyState(false, delay);
  const [state, setState] = useSafeState<PermissionState>(initialState);

  const requestStorageAccess = useCallback(async () => {
    setRequesting(true);

    try {
      const state = await requestAccess();

      setState(state);

      return state;
    } finally {
      setRequesting(false);
    }
  }, []);

  useEffect(() => {
    checkAccess().then(setState);
  }, []);

  return [requesting, state, requestStorageAccess];
}
