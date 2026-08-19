/**
 * @module Loading
 */

import React, { memo } from 'react';
import { GetProp, Spin, SpinProps } from 'antd';

type WidthValue = GetProp<React.CSSProperties, 'width'>;
type HeightValue = GetProp<React.CSSProperties, 'height'>;

export interface LoadingProps extends SpinProps {
  delay?: number;
  width?: WidthValue;
  height?: HeightValue;
  fullscreen?: boolean;
  description?: string;
}

export default memo(function Loading(props: LoadingProps) {
  const { width, fullscreen, delay = 200, height = 360 } = props;

  return (
    <Spin {...props} delay={delay} fullscreen={fullscreen}>
      {!fullscreen && <div style={{ width, height }} />}
    </Spin>
  );
});
