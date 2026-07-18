import type { RouterAuth } from '@3dil-routeros/shared';
import type { DeviceSnapshot, RouterSnapshot } from '../types.js';
import { getRouterRuntimeConfig } from '../config.js';

interface RequestInitLike {
  method?: string;
  body?: string | URLSearchParams | FormData | Blob | null;
  headers?: Record<string, string> | Headers;
}

interface LoginResponse {
  success: boolean;
  reason?: string;
}

interface SafeHttpResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
}

class CookieJar {
  private readonly jar = new Map<string, string>();

  set(name: string, value: string): void {
    this.jar.set(name, value);
  }

  clear(): void {
    this.jar.clear();
  }

  toHeaderValue(): string {
    return [...this.jar.entries()].map(([key, value]) => `${key}=${value}`).join('; ');
  }
}

class SessionManager {
  private connected = false;
  private authenticated = false;
  private authenticatedAt: string | null = null;
  private lastError: string | null = null;
  private authenticationStatus: RouterSnapshot['authentication']['status'] = 'connecting';

  reset(): void {
    this.connected = false;
    this.authenticated = false;
    this.authenticatedAt = null;
    this.lastError = null;
    this.authenticationStatus = 'connecting';
  }

  markConnecting(reason: string | null = null): void {
    this.connected = false;
    this.authenticated = false;
    this.lastError = reason;
    this.authenticationStatus = 'authenticating';
  }

  markConnected(): void {
    this.connected = true;
    this.authenticated = true;
    this.authenticatedAt = new Date().toISOString();
    this.lastError = null;
    this.authenticationStatus = 'connected';
  }

  markFailed(reason: string): void {
    this.connected = false;
    this.authenticated = false;
    this.lastError = reason;
    this.authenticationStatus = /expired|session/i.test(reason) ? 'expired' : 'failed';
  }

  markUnsupported(reason: string): void {
    this.connected = false;
    this.authenticated = false;
    this.lastError = reason;
    this.authenticationStatus = 'unsupported';
  }

  markExpired(reason: string): void {
    this.connected = false;
    this.authenticated = false;
    this.lastError = reason;
    this.authenticationStatus = 'expired';
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  getAuthenticationStatus(): RouterSnapshot['authentication']['status'] {
    return this.authenticationStatus;
  }

  getLastError(): string | null {
    return this.lastError;
  }
}

class TokenManager {
  private csrfToken: string | null = null;
  private randToken: string | null = null;

  setCsrf(token: string | null): void {
    this.csrfToken = token;
  }

  setRand(token: string | null): void {
    this.randToken = token;
  }

  getCsrf(): string | null {
    return this.csrfToken;
  }

  getRand(): string | null {
    return this.randToken;
  }
}

class RequestExecutor {
  constructor(
    private readonly config: ReturnType<typeof getRouterRuntimeConfig>,
    private readonly cookieJar: CookieJar,
    private readonly tokenManager: TokenManager,
    private readonly sessionManager: SessionManager,
  ) {}

  async request(path: string, init?: RequestInitLike): Promise<SafeHttpResponse> {
    const url = new URL(path, this.config.baseUrl).toString();
    const requestHeaders = new Headers(init?.headers);
    requestHeaders.set('Accept', 'text/html,application/json,text/plain,*/*');
    requestHeaders.set('User-Agent', 'Mozilla/5.0');

    const csrfToken = this.tokenManager.getCsrf();
    if (csrfToken) {
      requestHeaders.set('X-CSRF-Token', csrfToken);
    }

    const cookieHeader = this.cookieJar.toHeaderValue();
    if (cookieHeader) {
      requestHeaders.set('Cookie', cookieHeader);
    }

    try {
      const response = await fetch(url, {
        ...init,
        headers: requestHeaders,
        signal: AbortSignal.timeout(this.config.requestTimeoutMs),
      });

      const body = await response.text();
      const setCookie = response.headers.getSetCookie?.() ?? [];
      for (const cookie of setCookie) {
        const [pair] = cookie.split(';');
        const [name, ...rest] = pair.split('=');
        if (name && rest.length > 0) {
          this.cookieJar.set(name, rest.join('='));
        }
      }

      if (response.status === 401 || response.status === 403) {
        this.sessionManager.markExpired('Session expired');
        throw new Error('Session expired');
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: response.status,
        body,
        headers: responseHeaders,
      };
    } catch (error) {
      if (error instanceof Error && /session expired/i.test(error.message)) {
        throw error;
      }
      if (error instanceof Error && /network|fetch/i.test(error.message)) {
        this.sessionManager.markFailed('Router offline');
      }
      throw error;
    }
  }
}

class RouterSnapshotService {
  buildSnapshot(raw: {
    deviceInfoRaw: Record<string, unknown>;
    healthRaw: Record<string, unknown>;
    wanRaw: Record<string, unknown>;
    wifiRaw: Record<string, unknown>;
    devicesRaw: Record<string, unknown>;
    authenticationStatus: RouterSnapshot['authentication']['status'];
    reason: string | null;
  }): RouterSnapshot {
    return {
      timestamp: new Date().toISOString(),
      connection: {
        status: this.inferConnectionState(raw.wanRaw),
        reason: raw.reason ?? this.extractReason(raw.wanRaw),
        wanIp: this.extractString(raw.wanRaw, ['wanIp', 'WANIP', 'ip']) ?? null,
        dns: this.extractStringArray(raw.wanRaw, ['dns', 'dnsServers']) ?? null,
        uplink: this.extractString(raw.wanRaw, ['uplink', 'wanType']) ?? null,
      },
      deviceInfo: {
        model: this.extractString(raw.deviceInfoRaw, ['modelName', 'ModelName', 'deviceName']) ?? 'Huawei OptiXstar LG8245X6-10',
        firmware: this.extractString(raw.deviceInfoRaw, ['firmwareVersion', 'FirmwareVersion', 'version']) ?? 'V500R022C10SPC272',
        isp: this.extractString(raw.deviceInfoRaw, ['isp', 'ISP']) ?? 'Saudi Arabia Mobily',
        uptimeSeconds: this.extractNumber(raw.deviceInfoRaw, ['uptime', 'uptimeSeconds']) ?? null,
        serial: this.extractString(raw.deviceInfoRaw, ['serial', 'serialNumber']) ?? null,
      },
      health: {
        cpuUsage: this.extractNumber(raw.healthRaw, ['cpuUsage', 'cpu']) ?? null,
        memoryUsage: this.extractNumber(raw.healthRaw, ['memoryUsage', 'memory']) ?? null,
        temperatureC: this.extractNumber(raw.healthRaw, ['temperatureC', 'temperature']) ?? null,
        latencyMs: this.extractNumber(raw.healthRaw, ['latency', 'latencyMs']) ?? null,
        status: this.inferHealthStatus(raw.healthRaw, raw.wanRaw),
        reason: this.extractReason(raw.healthRaw) ?? this.extractReason(raw.wanRaw),
      },
      wifi: {
        ssid: this.extractString(raw.wifiRaw, ['ssid', 'wifiName']) ?? null,
        band: this.extractString(raw.wifiRaw, ['band', 'wifiBand']) ?? null,
        security: this.extractString(raw.wifiRaw, ['security', 'securityType']) ?? null,
        channel: this.extractNumber(raw.wifiRaw, ['channel']) ?? null,
        enabled: this.extractBoolean(raw.wifiRaw, ['enabled', 'wifiEnabled']) ?? null,
        guestEnabled: this.extractBoolean(raw.wifiRaw, ['guestEnabled']) ?? null,
      },
      wan: {
        state: this.extractString(raw.wanRaw, ['state', 'wanState', 'wanStatus']) ?? null,
        uploadMbps: this.extractNumber(raw.wanRaw, ['uploadMbps', 'upload']) ?? null,
        downloadMbps: this.extractNumber(raw.wanRaw, ['downloadMbps', 'download']) ?? null,
        signalStrength: this.extractNumber(raw.wanRaw, ['signalStrength', 'rssi']) ?? null,
        supported: true,
        reason: raw.reason ?? null,
      },
      devices: this.extractDevices(raw.devicesRaw),
      authentication: {
        status: raw.authenticationStatus,
        reason: raw.reason,
      },
    };
  }

  createFallbackSnapshot(status: RouterSnapshot['authentication']['status'], reason: string | null): RouterSnapshot {
    return {
      timestamp: new Date().toISOString(),
      connection: {
        status: 'disconnected',
        reason,
        wanIp: null,
        dns: null,
        uplink: null,
      },
      deviceInfo: {
        model: null,
        firmware: null,
        isp: null,
        uptimeSeconds: null,
        serial: null,
      },
      health: {
        cpuUsage: null,
        memoryUsage: null,
        temperatureC: null,
        latencyMs: null,
        status: 'unknown',
        reason,
      },
      wifi: {
        ssid: null,
        band: null,
        security: null,
        channel: null,
        enabled: null,
        guestEnabled: null,
      },
      wan: {
        state: null,
        uploadMbps: null,
        downloadMbps: null,
        signalStrength: null,
        supported: false,
        reason,
      },
      devices: [],
      authentication: {
        status,
        reason,
      },
    };
  }

  private inferConnectionState(source: Record<string, unknown>): 'connected' | 'disconnected' | 'unknown' {
    const state = this.extractString(source, ['state', 'wanState']);
    if (state && /connected|up|online/i.test(state)) return 'connected';
    if (state && /disconnected|down|offline/i.test(state)) return 'disconnected';
    return 'unknown';
  }

  private inferHealthStatus(healthSource: Record<string, unknown>, wanSource: Record<string, unknown>): 'ok' | 'degraded' | 'offline' | 'unknown' {
    const wanState = this.extractString(wanSource, ['state', 'wanState']);
    if (wanState && /disconnected|down|offline/i.test(wanState)) return 'offline';
    const cpu = this.extractNumber(healthSource, ['cpuUsage', 'cpu']) ?? null;
    const memory = this.extractNumber(healthSource, ['memoryUsage', 'memory']) ?? null;
    if (cpu !== null && cpu > 85) return 'degraded';
    if (memory !== null && memory > 85) return 'degraded';
    return 'ok';
  }

  private extractString(source: Record<string, unknown>, keys: string[]): string | null {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim()) return value;
      if (value && typeof value === 'object' && 'value' in value && typeof (value as { value?: unknown }).value === 'string') {
        return (value as { value: string }).value;
      }
    }
    return null;
  }

  private extractStringArray(source: Record<string, unknown>, keys: string[]): string[] | null {
    for (const key of keys) {
      const value = source[key];
      if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string');
      }
      if (typeof value === 'string' && value.trim()) {
        return [value];
      }
    }
    return null;
  }

  private extractNumber(source: Record<string, unknown>, keys: string[]): number | null {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    return null;
  }

  private extractBoolean(source: Record<string, unknown>, keys: string[]): boolean | null {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        if (normalized === 'true') return true;
        if (normalized === 'false') return false;
      }
    }
    return null;
  }

  private extractDevices(source: Record<string, unknown>): DeviceSnapshot[] {
    const values = Array.isArray(source.devices) ? source.devices : Array.isArray(source.data) ? source.data : [];
    const devices = values.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null);
    return devices.map((entry) => ({
      mac: this.extractString(entry, ['mac', 'macAddress']) ?? null,
      name: this.extractString(entry, ['name', 'hostName', 'deviceName']) ?? null,
      ip: this.extractString(entry, ['ip', 'ipAddress']) ?? null,
      hostName: this.extractString(entry, ['hostName', 'hostname']) ?? null,
      signal: this.extractNumber(entry, ['signal', 'rssi']) ?? null,
      band: this.extractString(entry, ['band', 'wifiBand']) ?? null,
      online: this.extractBoolean(entry, ['online', 'connected']) ?? null,
      raw: entry,
    }));
  }

  private extractReason(source: Record<string, unknown>): string | null {
    return this.extractString(source, ['reason', 'message', 'status']) ?? null;
  }
}

export class HuaweiClient {
  private readonly config = getRouterRuntimeConfig();
  private readonly cookieJar = new CookieJar();
  private readonly sessionManager = new SessionManager();
  private readonly tokenManager = new TokenManager();
  private readonly executor: RequestExecutor;
  private readonly snapshotService = new RouterSnapshotService();

  constructor() {
    this.executor = new RequestExecutor(this.config, this.cookieJar, this.tokenManager, this.sessionManager);
  }

  async connect(auth: RouterAuth): Promise<void> {
    this.sessionManager.reset();
    this.cookieJar.clear();
    this.tokenManager.setCsrf(null);
    this.tokenManager.setRand(null);

    if (!auth.username || !auth.password) {
      throw new Error('Authentication required');
    }

    const loginResult = await this.login(auth);
    if (!loginResult.success) {
      this.sessionManager.markFailed(loginResult.reason ?? 'Authentication failed');
      throw new Error(loginResult.reason ?? 'Authentication failed');
    }

    this.sessionManager.markConnected();
  }

  async disconnect(): Promise<void> {
    this.sessionManager.reset();
    this.cookieJar.clear();
    this.tokenManager.setCsrf(null);
    this.tokenManager.setRand(null);
  }

  async getSnapshot(): Promise<RouterSnapshot> {
    if (!this.sessionManager.isAuthenticated()) {
      return this.snapshotService.createFallbackSnapshot(
        this.sessionManager.getAuthenticationStatus(),
        this.sessionManager.getLastError(),
      );
    }

    try {
      const [deviceInfo, healthAttr, wanAttr, wifiAttr, devicesAttr] = await Promise.all([
        this.safeRead('deviceinfo.asp'),
        this.safeRead('getHomeNetdata.asp'),
        this.safeRead('getWanDynamicData.asp'),
        this.safeRead('WlanBasic.asp'),
        this.safeRead('GetLanUserDevInfo.asp'),
      ]);

      const deviceInfoRaw = this.parseBodyToObject(deviceInfo.body);
      const healthRaw = this.parseBodyToObject(healthAttr.body);
      const wanRaw = this.parseBodyToObject(wanAttr.body);
      const wifiRaw = this.parseBodyToObject(wifiAttr.body);
      const devicesRaw = this.parseBodyToObject(devicesAttr.body);

      return this.snapshotService.buildSnapshot({
        deviceInfoRaw,
        healthRaw,
        wanRaw,
        wifiRaw,
        devicesRaw,
        authenticationStatus: 'connected',
        reason: null,
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Router unavailable';
      this.sessionManager.markFailed(reason);
      return this.snapshotService.createFallbackSnapshot('failed', reason);
    }
  }

  async getConnectionStatus(): Promise<{ status: string; reason: string | null }> {
    const snapshot = await this.getSnapshot();
    return { status: snapshot.connection.status, reason: snapshot.connection.reason };
  }

  private async login(auth: RouterAuth): Promise<LoginResponse> {
    this.sessionManager.markConnecting('Connecting to router');

    try {
      await this.safeRequest('/');
      const randToken = await this.fetchRandToken();
      if (!randToken) {
        return { success: false, reason: 'Router token unavailable' };
      }

      const loginBody = new URLSearchParams({
        username: auth.username,
        password: auth.password,
        frmLogin: 'Login',
        randToken,
      });

      const response = await this.request('/html/login.asp', {
        method: 'POST',
        body: loginBody.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const html = response.body;
      const success = /login/.test(html.toLowerCase()) === false && /error/.test(html.toLowerCase()) === false;
      if (!success) {
        return { success: false, reason: 'Authentication failed' };
      }

      this.tokenManager.setCsrf(this.extractToken(html));
      return { success: true };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Authentication failed';
      this.sessionManager.markFailed(reason);
      return { success: false, reason };
    }
  }

  private async fetchRandToken(): Promise<string | null> {
    const response = await this.request('/html/GetRandToken.asp', { method: 'GET' });
    const body = response.body;
    const match = body.match(/([A-Za-z0-9._-]{4,})/);
    this.tokenManager.setRand(match?.[1] ?? null);
    return match?.[1] ?? null;
  }

  private async safeRequest(path: string, init?: RequestInitLike): Promise<SafeHttpResponse> {
    try {
      return await this.request(path, init);
    } catch (error) {
      if (error instanceof Error && /timeout|tempor/i.test(error.message)) {
        return { status: 504, body: '', headers: {} };
      }
      throw error;
    }
  }

  private async safeRead(endpoint: string): Promise<SafeHttpResponse> {
    return this.safeRequest(`/${endpoint}`);
  }

  private async request(path: string, init?: RequestInitLike): Promise<SafeHttpResponse> {
    return this.executor.request(path, init);
  }

  private parseBodyToObject(body: string): Record<string, unknown> {
    if (!body) {
      return {};
    }

    try {
      const parsed = JSON.parse(body);
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }

  private extractToken(html: string): string | null {
    const match = html.match(/token["'=:\s]+([A-Za-z0-9._-]+)/i);
    return match?.[1] ?? null;
  }
}

export class HuaweiDriver extends HuaweiClient {}

export class HuaweiDriverFactory {
  create(): HuaweiDriver {
    return new HuaweiDriver();
  }
}
