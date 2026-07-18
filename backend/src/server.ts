import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { pino } from 'pino';
import type { RouterHealth, RouterVersionInfo } from '@3dil-routeros/shared';
import { defaultRouterVersion } from '@3dil-routeros/shared';
import { createDatabase } from './storage.js';
import { getRouterRuntimeConfig } from './config.js';
import { createRouterApi } from './routes.js';
import { PollingService } from './polling.js';
import { attachWebsocket } from './websocket.js';

const app = express();
const httpServer = createServer(app);
const logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });
const config = getRouterRuntimeConfig();

app.use(express.json());
app.use((req, _res, next) => {
  logger.info({ method: req.method, path: req.path }, 'request');
  next();
});

app.get('/api/health', (_req, res) => {
  const response: RouterHealth = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    device: 'Huawei OptiXstar LG8245X6-10',
  };
  res.json(response);
});
app.get('/health', (_req, res) => res.json({ status: 'ok', version: 'v2.0.0-alpha.4', routerAgent: 'running' }));

app.get('/api/version', (_req, res) => {
  const response: RouterVersionInfo = defaultRouterVersion;
  res.json(response);
});

const pollingService = new PollingService();
app.use(createRouterApi(pollingService));

const db = createDatabase();
void db.init();

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
attachWebsocket(wss, pollingService);

const port = config.backendPort;
httpServer.listen(port, () => {
  logger.info(`server listening on ${port}`);
});
