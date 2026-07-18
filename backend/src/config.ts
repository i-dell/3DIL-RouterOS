import { config as loadEnv } from 'dotenv';

loadEnv();

export interface RouterRuntimeConfig {
  baseUrl: string;
  username: string;
  password: string;
  requestTimeoutMs: number;
  pollIntervalMs: number;
  backendPort: number;
  frontendOrigin: string;
}

const getNumberEnv = (name: string, fallback: number) => {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getRouterRuntimeConfig = (): RouterRuntimeConfig => ({
  baseUrl: process.env.ROUTER_BASE_URL ?? 'http://192.168.1.1',
  username: process.env.ROUTER_USERNAME ?? '',
  password: process.env.ROUTER_PASSWORD ?? '',
  requestTimeoutMs: getNumberEnv('ROUTER_REQUEST_TIMEOUT_MS', 8000),
  pollIntervalMs: getNumberEnv('ROUTER_POLL_INTERVAL_MS', 5000),
  backendPort: getNumberEnv('BACKEND_PORT', 3001),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
});
