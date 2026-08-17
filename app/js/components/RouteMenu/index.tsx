/**
 * @module index
 */

import clsx from 'clsx';
import { IRoute } from '/js/utils/router';
import { MenuItem } from '/js/utils/menus';
import useStyles, { prefixCls } from './style';
import { useMatches } from 'react-nest-router';
import { GetProp, Menu, MenuProps } from 'antd';
import useItems, { RenderItem } from './useItems';
import { SiderContext } from 'antd/es/layout/Sider';
import { isFunction, isString } from '/js/utils/typeof';
import useStableCallback from '/js/hooks/useStableCallback';
import { flattenItems, getExpandKeys, mergeKeys } from './utils';
import React, { memo, use, useEffect, useMemo, useRef, useState } from 'react';

type OmitProps =
  | 'items'
  | 'multiple'
  | 'openKeys'
  | 'onDeselect'
  | 'selectable'
  | 'onOpenChange'
  | 'selectedKeys'
  | 'defaultSelectedKeys';

type ClassNames = GetProp<MenuProps, 'classNames'>;

export interface RouteMenuProps extends Omit<MenuProps, OmitProps> {
  items: MenuItem[];
  renderItem?: RenderItem;
  icon?: string | React.ReactElement;
  onOpenChange?: (openKeys: string[], cachedOpenKeys: string[]) => void;
}

function resolveClassNames(scope: string, classNames?: ClassNames, collapsed?: boolean): ClassNames {
  return (...args) => {
    const resolved = (isFunction(classNames) ? classNames(...args) : classNames) ?? {};
    const subMenu = resolved.subMenu ?? {};
    const popup = resolved.popup ?? {};

    return {
      ...resolved,
      root: clsx(scope, prefixCls, resolved.root, {
        [`${prefixCls}-collapsed`]: collapsed
      }),
      item: clsx(`${prefixCls}-item`, resolved.item),
      itemIcon: clsx(`${prefixCls}-item-icon`, resolved.itemIcon),
      itemContent: clsx(`${prefixCls}-item-content`, resolved.itemContent),
      subMenu: {
        ...subMenu,
        item: clsx(`${prefixCls}-item`, subMenu.item),
        itemIcon: clsx(`${prefixCls}-item-icon`, subMenu.itemIcon),
        itemContent: clsx(`${prefixCls}-item-content`, subMenu.itemContent)
      },
      popup: isString(popup)
        ? clsx(`${prefixCls}-popup`, popup)
        : {
            ...popup,
            root: clsx(`${prefixCls}-popup`, popup.root)
          }
    };
  };
}

export default memo(function RouteMenu(props: RouteMenuProps) {
  const { items, classNames, renderItem, defaultOpenKeys, inlineCollapsed } = props;

  const scope = useStyles();
  const matches = useMatches() as IRoute[];
  const { siderCollapsed } = use(SiderContext);
  const flatItems = useMemo(() => flattenItems(items), [items]);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys ?? []);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => []);
  const expandKeys = useMemo(() => getExpandKeys(matches, flatItems), [matches, flatItems]);
  const collapsed = useMemo(() => siderCollapsed ?? inlineCollapsed, [inlineCollapsed, siderCollapsed]);
  const [openKeys, setOpenKeys] = useState<string[]>(() => (collapsed ? [] : cachedOpenKeysRef.current));

  const onOpenChange = useStableCallback((openKeys: string[], cachedOpenKeys: string[]): void => {
    props.onOpenChange?.(openKeys, cachedOpenKeys);
  });

  const onOpenChangeHander = useStableCallback((openKeys: string[]): void => {
    setOpenKeys(openKeys);

    if (!collapsed) {
      cachedOpenKeysRef.current = openKeys;
    }

    onOpenChange(openKeys, cachedOpenKeysRef.current);
  });

  useEffect(() => {
    const { openKeys, selectedKeys } = expandKeys;
    const cachedOpenKeys = cachedOpenKeysRef.current;

    if (!collapsed) {
      const nextOpenKeys = mergeKeys(cachedOpenKeys, openKeys);

      setOpenKeys(nextOpenKeys);

      cachedOpenKeysRef.current = nextOpenKeys;

      onOpenChange(nextOpenKeys, nextOpenKeys);
    } else if (openKeys.length > 0) {
      const nextOpenKeys: string[] = [];

      setOpenKeys(nextOpenKeys);

      onOpenChange(nextOpenKeys, cachedOpenKeys);
    }

    setSelectedKeys(selectedKeys);
  }, [expandKeys, collapsed]);

  return (
    <Menu
      {...props}
      multiple={false}
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onOpenChange={onOpenChangeHander}
      items={useItems(items, selectedKeys, renderItem)}
      classNames={resolveClassNames(scope, classNames, collapsed)}
    />
  );
});
