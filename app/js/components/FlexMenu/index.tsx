/**
 * @module index
 */

import clsx from 'clsx';
import React, { memo, useRef } from 'react';
import useStyles, { prefixCls } from './style';
import useStableCallback from '/js/hooks/useStableCallback';
import RouteMenu, { RouteMenuProps } from '/js/components/RouteMenu';
import { Drawer, DrawerProps, GetProp, Layout, MenuTheme, SiderProps } from 'antd';

const { Sider } = Layout;

export interface RenderHeaderProps {
  readonly width: number;
  readonly theme: MenuTheme;
  readonly isMobile: boolean;
  readonly collapsed: boolean;
  readonly collapsedWidth: number;
}

type SiderPropKeys = 'trigger' | 'onCollapse';

export interface RenderHeader {
  (props: RenderHeaderProps): React.ReactNode;
}

const DRAWER_STYLES: GetProp<DrawerProps, 'styles'> = {
  body: {
    padding: 0,
    overflow: 'hidden'
  }
};

export type OnOpenChange = GetProp<FlexMenuProps, 'onOpenChange'>;

type RouteMenuPropKeys = 'mode' | 'styles' | 'classNames' | 'inlineCollapsed';

export interface FlexMenuProps extends Pick<SiderProps, SiderPropKeys>, Omit<RouteMenuProps, RouteMenuPropKeys> {
  width?: number;
  isMobile?: boolean;
  collapsed?: boolean;
  collapsedWidth?: number;
  renderHeader?: RenderHeader;
  styles?: {
    root?: React.CSSProperties;
    menu?: GetProp<RouteMenuProps, 'styles'>;
  };
  classNames?: {
    root?: string;
    menu?: GetProp<RouteMenuProps, 'classNames'>;
  };
}

export default memo(function FlexMenu(props: FlexMenuProps) {
  const {
    style,
    styles,
    className,
    classNames,
    onCollapse,
    width = 256,
    renderHeader,
    rootClassName,
    trigger = null,
    theme = 'light',
    isMobile = false,
    collapsed = false,
    collapsedWidth = 64,
    defaultOpenKeys = [],
    ...restProps
  } = props;

  const scope = useStyles();
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys);

  const onClose = useStableCallback((): void => {
    onCollapse?.(true, 'clickTrigger');
  });

  const onOpenChange = useStableCallback<OnOpenChange>((openKeys, cachedOpenKeys) => {
    if (!collapsed) {
      cachedOpenKeysRef.current = cachedOpenKeys;
    }

    restProps.onOpenChange?.(openKeys, cachedOpenKeys);
  });

  const resolvedStyle = {
    ...style,
    ...styles?.root
  };

  const resolvedClassName = clsx(
    // classNames
    scope,
    className,
    prefixCls,
    rootClassName,
    classNames?.root,
    `${prefixCls}-${theme}`,
    {
      [`${prefixCls}-mobile`]: isMobile
    }
  );

  const header = renderHeader?.({
    theme,
    width,
    isMobile,
    collapsed,
    collapsedWidth
  });

  const menu = (
    <>
      {header && <div className={`${prefixCls}-header`}>{header}</div>}
      <RouteMenu
        {...restProps}
        mode="inline"
        styles={styles?.menu}
        onOpenChange={onOpenChange}
        classNames={classNames?.menu}
        className={`${prefixCls}-body`}
        defaultOpenKeys={cachedOpenKeysRef.current}
      />
    </>
  );

  return isMobile ? (
    <Drawer
      size={width}
      closable={false}
      placement="left"
      onClose={onClose}
      open={!collapsed}
      style={resolvedStyle}
      styles={DRAWER_STYLES}
      className={resolvedClassName}
    >
      {menu}
    </Drawer>
  ) : (
    <Sider
      collapsible
      theme={theme}
      width={width}
      trigger={trigger}
      collapsed={collapsed}
      style={resolvedStyle}
      onCollapse={onCollapse}
      className={resolvedClassName}
      collapsedWidth={collapsedWidth}
    >
      {menu}
    </Sider>
  );
});
