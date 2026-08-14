/**
 * @module index
 */

import clsx from 'clsx';
import useStyles, { prefixCls } from './style';
import React, { memo, useMemo, useRef } from 'react';
import useStableCallback from '/js/hooks/useStableCallback';
import RouteMenu, { RouteMenuProps } from '/js/components/RouteMenu';
import { Drawer, GetProp, Layout, MenuTheme, SiderProps } from 'antd';

const { Sider } = Layout;

export interface RenderHeaderProps {
  readonly width: number;
  readonly theme: MenuTheme;
  readonly isMobile: boolean;
  readonly collapsed: boolean;
  readonly collapsedWidth: number;
}

export interface RenderHeader {
  (props: RenderHeaderProps): React.ReactNode;
}

export type OnOpenChange = GetProp<FlexMenuProps, 'onOpenChange'>;

export interface FlexMenuProps
  extends
    Pick<SiderProps, 'trigger' | 'onCollapse'>,
    Omit<RouteMenuProps, 'mode' | 'styles' | 'classNames' | 'inlineCollapsed' | 'rootClassName'> {
  width?: number;
  isMobile?: boolean;
  collapsed?: boolean;
  collapsedWidth?: number;
  renderHeader?: RenderHeader;
  routeMenuStyles?: GetProp<RouteMenuProps, 'styles'>;
  routeMenuClassNames?: GetProp<RouteMenuProps, 'classNames'>;
}

export default memo(function FlexMenu(props: FlexMenuProps) {
  const {
    style,
    className,
    onCollapse,
    width = 256,
    onOpenChange,
    renderHeader,
    trigger = null,
    routeMenuStyles,
    theme = 'light',
    isMobile = false,
    collapsed = false,
    collapsedWidth = 64,
    routeMenuClassNames,
    defaultOpenKeys = [],
    ...restProps
  } = props;

  const scope = useStyles();
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys);

  const drawerStyles = useMemo(() => {
    return { body: { padding: 0, overflow: 'hidden' } };
  }, []);

  const onClose = useStableCallback((): void => {
    onCollapse?.(true, 'clickTrigger');
  });

  const onOpenChangeHander = useStableCallback<OnOpenChange>((openKeys, cachedOpenKeys) => {
    if (!collapsed) {
      cachedOpenKeysRef.current = cachedOpenKeys;
    }

    onOpenChange?.(openKeys, cachedOpenKeys);
  });

  const rootClassName = clsx(scope, prefixCls, className, `${prefixCls}-${theme}`, {
    [`${prefixCls}-mobile`]: isMobile
  });

  const header = renderHeader?.({ theme, width, isMobile, collapsed, collapsedWidth });

  const menu = (
    <>
      {header && <div className={`${prefixCls}-header`}>{header}</div>}
      <RouteMenu
        {...restProps}
        mode="inline"
        styles={routeMenuStyles}
        className={`${prefixCls}-body`}
        classNames={routeMenuClassNames}
        onOpenChange={onOpenChangeHander}
        defaultOpenKeys={cachedOpenKeysRef.current}
      />
    </>
  );

  return isMobile ? (
    <Drawer
      size={width}
      style={style}
      closable={false}
      placement="left"
      onClose={onClose}
      open={!collapsed}
      styles={drawerStyles}
      className={rootClassName}
    >
      {menu}
    </Drawer>
  ) : (
    <Sider
      collapsible
      style={style}
      theme={theme}
      width={width}
      trigger={trigger}
      collapsed={collapsed}
      onCollapse={onCollapse}
      className={rootClassName}
      collapsedWidth={collapsedWidth}
    >
      {menu}
    </Sider>
  );
});
