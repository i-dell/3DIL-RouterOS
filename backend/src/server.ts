import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { pino } from 'pino';
import type { RouterHealth, RouterStatus, RouterVersionInfo } from '@3dil-routeros/shared';
import { defaultRouterVersion } from '@3dil-routeros/shared';
import { createDatabase } from './storage.js';
import { HuaweiDriverFactory } from './drivers/huawei.js';

const app = express();
const httpServer = createServer(app);
const logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });

app.use(express.json());

app.get('/api/health', (_req, res) => {
  const response: RouterHealth = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    device: 'Huawei OptiXstar LG8245X6-10',
  };
  res.json(response);
});

app.get('/api/version', (_req, res) => {
  const response: RouterVersionInfo = defaultRouterVersion;
  res.json(response);
});

app.get('/api/status', async (_req, res) => {
  const status: RouterStatus = {
    online: true,
    signal: 87,
    temperatureC: 42,
    uptimeSeconds: 25689,
  };
  res.json(status);
});

app.post('/api/auth', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  const driverFactory = new HuaweiDriverFactory();
  const driver = driverFactory.create();
  await driver.connect({ username, password });
  await driver.disconnect();
  res.json({ ok: true });
});

const db = createDatabase();
void db.init();

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (socket) => {
  logger.info('websocket connected');
  socket.send(JSON.stringify({ event: 'connected', message: 'Socket ready' }));
});

const port = Number(process.env.PORT ?? 3000);
httpServer.listen(port, () => {
  logger.info(`server listening on ${port}`);
});
