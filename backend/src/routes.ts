import { Router } from 'express';
import { PollingService } from './polling.js';
import { getRouterRuntimeConfig } from './config.js';

export const createRouterApi = (pollingService: PollingService) => {
  const router = Router();
  const config = getRouterRuntimeConfig();

  router.get('/api/v1/router/connection', (_req, res) => {
    const snapshot = pollingService.getSnapshot();
    if (!snapshot) {
      res.status(503).json({ status: 'disconnected', reason: 'Connecting to local agent.' });
      return;
    }
    res.json({ status: snapshot.connection.status, reason: snapshot.connection.reason });
  });

  router.get('/api/v1/router/device-info', (_req, res) => {
    const snapshot = pollingService.getSnapshot();
    if (!snapshot) {
      res.status(503).json({ supported: false, reason: 'Connecting to local agent.' });
      return;
    }
    res.json(snapshot.deviceInfo);
  });

  router.get('/api/v1/router/health', (_req, res) => {
    const snapshot = pollingService.getSnapshot();
    if (!snapshot) {
      res.status(503).json({ status: 'unknown', reason: 'Connecting to local agent.' });
      return;
    }
    res.json(snapshot.health);
  });

  router.get('/api/v1/router/wan', (_req, res) => {
    const snapshot = pollingService.getSnapshot();
    if (!snapshot) {
      res.status(503).json({ supported: false, reason: 'Connecting to local agent.' });
      return;
    }
    res.json(snapshot.wan);
  });

  router.get('/api/v1/router/wifi', (_req, res) => {
    const snapshot = pollingService.getSnapshot();
    if (!snapshot) {
      res.status(503).json({ supported: false, reason: 'Connecting to local agent.' });
      return;
    }
    res.json(snapshot.wifi);
  });

  router.get('/api/v1/router/devices', (_req, res) => {
    const snapshot = pollingService.getSnapshot();
    if (!snapshot) {
      res.status(503).json({ supported: false, reason: 'Connecting to local agent.' });
      return;
    }
    res.json(snapshot.devices);
  });

  router.get('/api/v1/router/snapshot', (_req, res) => {
    const snapshot = pollingService.getSnapshot();
    if (!snapshot) {
      res.status(503).json({ supported: false, reason: 'Connecting to local agent.' });
      return;
    }
    res.json(snapshot);
  });

  router.post('/api/v1/router/auth', async (req, res) => {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      res.status(400).json({ supported: false, reason: 'Username and password required.' });
      return;
    }

    try {
      await pollingService.start(username, password);
      res.json({ status: 'connected', reason: 'Router authentication succeeded.' });
    } catch (error) {
      res.status(401).json({ status: 'failed', reason: error instanceof Error ? error.message : 'Authentication failed.' });
    }
  });

  router.post('/api/v1/router/logout', (_req, res) => {
    pollingService.stop();
    res.json({ status: 'disconnected', reason: 'Session cleared.' });
  });

  router.get('/api/v1/router/config', (_req, res) => {
    res.json({ baseUrl: config.baseUrl, requestTimeoutMs: config.requestTimeoutMs, pollIntervalMs: config.pollIntervalMs });
  });

  return router;
};
