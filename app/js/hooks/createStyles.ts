/**
 * @module createStyles
 */

import {
  AbstractCalculator,
  CSSInterpolation,
  genCalc,
  token2CSSVar,
  unit,
  useCSSVarRegister,
  useStyleRegister
} from '@ant-design/cssinjs';
import { useId, useMemo } from 'react';
import { isNumber, isString } from '/js/utils/typeof';
import useToken, { ignore, unitless } from 'antd/es/theme/useToken';
import { AliasToken, GlobalToken, OverrideToken } from 'antd/es/theme/interface';

export interface UseStyles {
  (): string;
}

type Components = keyof OverrideToken;

type Entries<T> = [keyof AliasToken, T][];

export interface CSSUtils {
  unit(value: string | number): string;
  calc(value: number | string): AbstractCalculator;
}

function createKey(id: string): string {
  return `css-var-${id.replace(/[^a-z_\d]/gi, '')}`;
}

export interface Styles<C extends Components = Components> {
  (token: Token<C>, utils: CSSUtils): CSSInterpolation;
}

function prefixToken(component: string, key: string): string {
  return `${component}${key.replace(/^[a-z]/, match => {
    return match.toUpperCase();
  })}`;
}

type ComponentTokens = { [key in keyof AliasToken]: string | number | boolean };

export type Token<C extends Components = Components> = AliasToken & Pick<OverrideToken, C>;

/**
 * @function createStyles
 * @description [hook] 动态样式生成
 * @param path 路径片段数组
 * @param styles 样式生成函数
 * @param shared 共享样式的组件列表
 */
export default function createStyles<C extends Components = never>(path: string[], styles: Styles<C>, shared?: C[]): UseStyles {
  const cssVarUnitless: Record<string, boolean> = {
    ...unitless,
    zIndex: true,
    zIndexPopup: true
  };
  const cssVarUnitlessKeys = Object.keys(cssVarUnitless);

  if (shared) {
    for (const component of shared) {
      for (const key of cssVarUnitlessKeys) {
        cssVarUnitless[prefixToken(component, key)] = cssVarUnitless[key];
      }
    }
  }

  return () => {
    const id = useId();
    const scopeKey = useMemo(() => createKey(id), [id]);
    const [theme, token, hashId, realToken, cssVar = {}] = useToken();

    const key = cssVar.key;
    const prefix = cssVar.prefix || 'ant';

    const utils = useMemo(() => {
      const calcUnitless = new Set<string>();

      if (shared) {
        for (const component of shared) {
          for (const key of cssVarUnitlessKeys) {
            calcUnitless.add(key);
            calcUnitless.add(token2CSSVar(key, prefix));
            calcUnitless.add(token2CSSVar(key, `${prefix}-${component}`));
          }
        }
      }

      return { unit, calc: genCalc('css', calcUnitless) };
    }, [prefix]);

    const [override, globalToken, overrideToken] = useMemo(() => {
      let override = false;

      const { motion, wireframe, focusOutline } = token;
      const overrideToken: Record<string, string | number> = {};
      const globalToken = { ...realToken, motion, wireframe, focusOutline };

      if (shared) {
        for (const component of shared) {
          const shareToken = token[component];
          const componentToken: Partial<ComponentTokens> = {};

          if (shareToken != null) {
            let length = 0;

            const entries = Object.entries(shareToken) as Entries<string | number | boolean>;

            for (const [key, value] of entries) {
              if (value != null && value !== token[key]) {
                length++;

                if (isString(value) || isNumber(value)) {
                  override = true;

                  overrideToken[prefixToken(component, key)] = value;

                  componentToken[key] = `var(${token2CSSVar(key, `${prefix}-${component}`)})`;
                } else {
                  componentToken[key] = value;
                }
              }
            }

            if (length > 0) {
              globalToken[component] = componentToken as GlobalToken[C];
            }
          }
        }
      }

      return [override, globalToken as Token<C>, overrideToken];
    }, [token, realToken, prefix]);

    useCSSVarRegister(
      {
        path,
        token,
        hashId,
        ignore,
        prefix,
        key: scopeKey,
        unitless: cssVarUnitless
      },
      () => overrideToken
    );

    useStyleRegister(
      {
        path,
        token,
        theme,
        hashId
      },
      () => styles(globalToken, utils)
    );

    return useMemo<string>(() => {
      const scope: string[] = [];

      if (hashId) {
        scope.push(hashId);
      }

      if (key) {
        scope.push(key);
      }

      if (override) {
        scope.push(scopeKey);
      }

      return scope.join(' ');
    }, [hashId, key, override, scopeKey]);
  };
}
