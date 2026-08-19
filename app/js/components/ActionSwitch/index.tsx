/**
 * @module index
 */

import React, { memo, useCallback } from 'react';
import { GetProp, Switch, SwitchProps } from 'antd';
import { RequestOptions } from '/js/hooks/useRequest';
import useAction, { Options as ActionProps } from '/js/hooks/useAction';

type SwitchPropKeys =
  | 'id'
  | 'size'
  | 'style'
  | 'styles'
  | 'checked'
  | 'onChange'
  | 'tabIndex'
  | 'autoFocus'
  | 'className'
  | 'classNames'
  | 'checkedChildren'
  | 'unCheckedChildren';

export interface ActionSwitchProps<R>
  extends
    Pick<SwitchProps, SwitchPropKeys>,
    ActionProps<Record<string, boolean> | null, R>,
    Pick<RequestOptions<R>, 'query' | 'method' | 'notify'> {
  name?: string;
  action: string;
  bubbles?: boolean;
}

function ActionSwitch<R>({
  id,
  name,
  size,
  style,
  action,
  styles,
  bubbles,
  checked,
  onChange,
  tabIndex,
  autoFocus,
  className,
  classNames,
  checkedChildren,
  unCheckedChildren,
  ...restProps
}: ActionSwitchProps<R>): React.ReactElement {
  const [loading, onAction, render] = useAction(action, restProps);

  const onClick = useCallback<GetProp<SwitchProps, 'onClick'>>(
    (_checked, event) => {
      if (bubbles === false) {
        event.stopPropagation();
      }
    },
    [bubbles]
  );

  const onSwitchChange = useCallback<GetProp<SwitchProps, 'onChange'>>(
    (checked, event) => {
      if (name) {
        onAction({ [name]: checked });
      } else {
        onAction(null);
      }

      onChange?.(checked, event);
    },
    [name]
  );

  return render(
    <Switch
      id={id}
      size={size}
      style={style}
      styles={styles}
      checked={checked}
      onClick={onClick}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
      className={className}
      classNames={classNames}
      onChange={onSwitchChange}
      disabled={restProps.disabled}
      checkedChildren={checkedChildren}
      unCheckedChildren={unCheckedChildren}
      loading={restProps.confirm ? false : loading}
    />
  );
}

export default memo(ActionSwitch) as typeof ActionSwitch;
