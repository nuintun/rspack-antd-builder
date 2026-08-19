/**
 * @module index
 */

import React, { memo, useCallback } from 'react';
import { Button, ButtonProps, GetProp } from 'antd';
import { RequestOptions } from '/js/hooks/useRequest';
import useAction, { Options as ActionProps } from '/js/hooks/useAction';

type ButtonPropKeys =
  | 'id'
  | 'icon'
  | 'size'
  | 'type'
  | 'block'
  | 'color'
  | 'ghost'
  | 'shape'
  | 'style'
  | 'title'
  | 'danger'
  | 'styles'
  | 'variant'
  | 'children'
  | 'tabIndex'
  | 'autoFocus'
  | 'className'
  | 'classNames'
  | 'iconPlacement'
  | 'autoInsertSpace';

type RequestPropKeys = 'query' | 'method' | 'notify';

export interface ActionButtonProps<R>
  extends ActionProps<null, R>, Pick<ButtonProps, ButtonPropKeys>, Pick<RequestOptions<R>, RequestPropKeys> {
  action: string;
  bubbles?: boolean;
}

function ActionButton<R>({
  id,
  icon,
  size,
  type,
  block,
  color,
  ghost,
  shape,
  style,
  title,
  action,
  danger,
  styles,
  bubbles,
  variant,
  children,
  tabIndex,
  autoFocus,
  className,
  classNames,
  iconPlacement,
  autoInsertSpace,
  ...restProps
}: ActionButtonProps<R>): React.ReactElement {
  const [loading, onAction, render] = useAction(action, restProps);

  const onClick = useCallback<GetProp<ButtonProps, 'onClick'>>(
    event => {
      if (bubbles === false) {
        event.stopPropagation();
      }

      onAction(null);
    },
    [bubbles]
  );

  return render(
    <Button
      id={id}
      icon={icon}
      size={size}
      type={type}
      block={block}
      color={color}
      ghost={ghost}
      shape={shape}
      style={style}
      title={title}
      danger={danger}
      styles={styles}
      loading={loading}
      onClick={onClick}
      variant={variant}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
      className={className}
      classNames={classNames}
      disabled={restProps.disabled}
      iconPlacement={iconPlacement}
      autoInsertSpace={autoInsertSpace}
    >
      {children}
    </Button>
  );
}

export default memo(ActionButton) as typeof ActionButton;
