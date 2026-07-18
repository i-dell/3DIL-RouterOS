import { Router } from 'express';
import { PollingService } from './polling.js';
import { getRouterRuntimeConfig } from './config.js';

export const createRouterApi = (pollingService: PollingService) => {
  const router = Router();
  const config = getRouterRuntimeConfig();

  const requireSnapshot = () => {
    const snapshot = pollingService.getSnapshot();
    if (!snapshot) {
      return {
        ok: false as const,
        code: 503,
        payload: { supported: false, reason: 'Connecting to local agent.' },
      };
    }

    return { ok: true as const, snapshot };
  };

  router.get('/api/router/info', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json(current.payload);
      return;
    }
    res.json(current.snapshot.deviceInfo);
  });

  router.get('/api/router/health', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json({ status: 'unknown', reason: current.payload.reason });
      return;
    }
    res.json(current.snapshot.health);
  });

  router.get('/api/router/devices', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json(current.payload);
      return;
    }
    res.json(current.snapshot.devices);
  });

  router.get('/api/router/wan', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json(current.payload);
      return;
    }
    res.json(current.snapshot.wan);
  });

  router.get('/api/router/wifi', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json(current.payload);
      return;
    }
    res.json(current.snapshot.wifi);
  });

  router.get('/api/router/snapshot', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json(current.payload);
      return;
    }
    res.json(current.snapshot);
  });

  router.get('/api/v1/router/connection', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json({ status: 'unknown', reason: current.payload.reason });
      return;
    }
    res.json(current.snapshot.connection);
  });

  router.get('/api/v1/router/device-info', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json(current.payload);
      return;
    }
    res.json(current.snapshot.deviceInfo);
  });

  router.get('/api/v1/router/health', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json({ status: 'unknown', reason: current.payload.reason });
      return;
    }
    res.json(current.snapshot.health);
  });

  router.get('/api/v1/router/wan', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json(current.payload);
      return;
    }
    res.json(current.snapshot.wan);
  });

  router.get('/api/v1/router/wifi', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json(current.payload);
      return;
    }
    res.json(current.snapshot.wifi);
  });

  router.get('/api/v1/router/devices', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json(current.payload);
      return;
    }
    res.json(current.snapshot.devices);
  });

  router.get('/api/v1/router/snapshot', (_req, res) => {
    const current = requireSnapshot();
    if (!current.ok) {
      res.status(current.code).json(current.payload);
      return;
    }
    res.json(current.snapshot);
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
