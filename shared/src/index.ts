import { z } from 'zod';

export const RouterAuthSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type RouterAuth = z.infer<typeof RouterAuthSchema>;

export interface RouterVersionInfo {
  name: string;
  version: string;
  model: string;
}

export interface RouterStatus {
  online: boolean;
  signal: number;
  temperatureC: number;
  uptimeSeconds: number;
}

export interface RouterHealth {
  status: 'ok' | 'degraded' | 'offline';
  timestamp: string;
  device: string;
}

export interface RouterDriver {
  connect(auth: RouterAuth): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): Promise<RouterStatus>;
  getVersion(): Promise<RouterVersionInfo>;
}

export interface RouterDriverFactory {
  create(): RouterDriver;
}

export const defaultRouterVersion: RouterVersionInfo = {
  name: 'Huawei OptiXstar LG8245X6-10',
  version: 'v2.0.0-alpha.3',
  model: 'LG8245X6',
};
