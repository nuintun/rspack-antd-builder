/**
 * @module Loading
 */

import { Spin } from 'antd';
import React, { memo } from 'react';

export interface LoadingFallbackProps extends Pick<React.CSSProperties, 'width' | 'height'> {
  delay?: number;
  fullscreen?: boolean;
  description?: string;
}

export default memo(function LoadingFallback({
  width,
  fullscreen,
  description,
  delay = 200,
  height = 360
}: LoadingFallbackProps) {
  return (
    <Spin delay={delay} fullscreen={fullscreen} description={description}>
      {!fullscreen && <div style={{ width, height }} />}
    </Spin>
  );
});
