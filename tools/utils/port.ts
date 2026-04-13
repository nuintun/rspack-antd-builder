/**
 * @module port
 */

import type { AppConfig } from '../index.ts';
import { findFreePorts } from 'find-free-ports';

/**
 * @function resolvePort
 * @description 获取空闲端口
 * @param ports 端口范围
 */
export async function resolvePort(ports: AppConfig['ports'] = [8000, 9000]) {
  if (!Array.isArray(ports)) {
    ports = [ports, ports + 1];
  }

  const [startPort, endPort = startPort + 1] = ports;
  const [port] = await findFreePorts(1, { startPort, endPort });

  return port;
}
