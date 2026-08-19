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
import useStableCallback from '/js/hooks/useStableCallback';
import { flattenItems, getExpandKeys, mergeKeys } from './utils';
import { combineClassNames, DEFAULT_SLOT } from '/js/utils/semantic';
import React, { memo, use, useEffect, useMemo, useRef, useState } from 'react';

type MenuPropKeys =
  | 'items'
  | 'multiple'
  | 'openKeys'
  | 'onDeselect'
  | 'selectable'
  | 'onOpenChange'
  | 'selectedKeys'
  | 'defaultSelectedKeys';

type ClassNames = GetProp<MenuProps, 'classNames'>;

export interface RouteMenuProps extends Omit<MenuProps, MenuPropKeys> {
  items: MenuItem[];
  renderItem?: RenderItem;
  icon?: string | React.ReactElement;
  onOpenChange?: (openKeys: string[], cachedOpenKeys: string[]) => void;
}

export default memo(function RouteMenu(props: RouteMenuProps) {
  const { items, classNames, inlineCollapsed } = props;

  const scope = useStyles();
  const matches = useMatches() as IRoute[];
  const { siderCollapsed } = use(SiderContext);
  const flatItems = useMemo(() => flattenItems(items), [items]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => []);
  const cachedOpenKeysRef = useRef<string[]>(props.defaultOpenKeys ?? []);
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

  const resolvedClassNames = useMemo<ClassNames>(() => {
    return combineClassNames<ClassNames>(
      {
        popup: {
          [DEFAULT_SLOT]: 'root'
        }
      },
      {
        root: clsx(scope, prefixCls, {
          [`${prefixCls}-collapsed`]: collapsed
        }),
        item: `${prefixCls}-item`,
        itemIcon: `${prefixCls}-item-icon`,
        subMenu: {
          item: `${prefixCls}-item`,
          itemIcon: `${prefixCls}-item-icon`
        },
        popup: `${prefixCls}-popup`
      },
      classNames
    );
  }, [scope, collapsed, classNames]);

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
      classNames={resolvedClassNames}
      onOpenChange={onOpenChangeHander}
      items={useItems(items, selectedKeys, props.renderItem)}
    />
  );
});
