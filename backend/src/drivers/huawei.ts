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
  private authenticated = false;
  private lastError: string | null = null;
  private authenticationStatus: RouterSnapshot['authentication']['status'] = 'connecting';

  reset(): void {
    this.authenticated = false;
    this.lastError = null;
    this.authenticationStatus = 'connecting';
  }

  markConnecting(): void {
    this.authenticated = false;
    this.lastError = 'Connecting to router';
    this.authenticationStatus = 'authenticating';
  }

  markConnected(): void {
    this.authenticated = true;
    this.lastError = null;
    this.authenticationStatus = 'connected';
  }

  markFailed(reason: string): void {
    this.authenticated = false;
    this.lastError = reason;
    this.authenticationStatus = /expired|session/i.test(reason) ? 'expired' : 'failed';
  }

  markExpired(reason: string): void {
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
    const requestHeaders = new Headers(init?.headers ?? {});
    requestHeaders.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8');
    requestHeaders.set('Accept-Language', 'en-US,en;q=0.9');
    requestHeaders.set('User-Agent', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');

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
        method: init?.method ?? 'GET',
        body: init?.body ?? undefined,
        headers: requestHeaders,
        redirect: 'manual',
        signal: AbortSignal.timeout(this.config.requestTimeoutMs),
      });

      const body = await response.text();
      this.storeCookies(response.headers);

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

      return { status: response.status, body, headers: responseHeaders };
    } catch (error) {
      if (error instanceof Error && /session expired/i.test(error.message)) {
        throw error;
      }
      if (error instanceof Error && /network|fetch|timeout|aborted/i.test(error.message)) {
        this.sessionManager.markFailed('Router offline');
      }
      throw error;
    }
  }

  private storeCookies(headers: Headers): void {
    const rawCookieHeader = headers.get('set-cookie');
    if (!rawCookieHeader) {
      return;
    }

    for (const cookieChunk of rawCookieHeader.split(',')) {
      const [pair] = cookieChunk.split(';');
      if (!pair || !pair.includes('=')) {
        continue;
      }
      const [name, ...rest] = pair.split('=');
      if (name) {
        this.cookieJar.set(name.trim(), rest.join('=').trim());
      }
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
    const wanSupported = this.hasAnyValue(raw.wanRaw);
    const wifiSupported = this.hasAnyValue(raw.wifiRaw);
    const deviceInfoSupported = this.hasAnyValue(raw.deviceInfoRaw);
    const healthSupported = this.hasAnyValue(raw.healthRaw);

    return {
      timestamp: new Date().toISOString(),
      connection: {
        status: this.inferConnectionState(raw.wanRaw),
        reason: raw.reason ?? this.extractReason(raw.wanRaw),
        wanIp: this.extractString(raw.wanRaw, ['wanIp', 'wanIP', 'ip', 'ipAddress']) ?? null,
        dns: this.extractStringArray(raw.wanRaw, ['dns', 'dnsServers']) ?? null,
        uplink: this.extractString(raw.wanRaw, ['uplink', 'wanType', 'connectionType']) ?? null,
      },
      deviceInfo: {
        model: this.extractString(raw.deviceInfoRaw, ['model', 'modelName', 'productName', 'deviceName']) ?? null,
        firmware: this.extractString(raw.deviceInfoRaw, ['firmware', 'firmwareVersion', 'softwareVersion', 'version']) ?? null,
        isp: this.extractString(raw.deviceInfoRaw, ['isp', 'provider', 'wanProvider']) ?? null,
        uptimeSeconds: this.extractNumber(raw.deviceInfoRaw, ['uptime', 'uptimeSeconds', 'uptimeSecondsValue']) ?? null,
        serial: this.extractString(raw.deviceInfoRaw, ['serial', 'serialNumber']) ?? null,
      },
      health: {
        cpuUsage: this.extractNumber(raw.healthRaw, ['cpuUsage', 'cpu', 'cpuPercent']) ?? null,
        memoryUsage: this.extractNumber(raw.healthRaw, ['memoryUsage', 'memory', 'ramUsage']) ?? null,
        temperatureC: this.extractNumber(raw.healthRaw, ['temperatureC', 'temperature']) ?? null,
        latencyMs: this.extractNumber(raw.healthRaw, ['latency', 'latencyMs', 'ping']) ?? null,
        status: this.inferHealthStatus(raw.healthRaw, raw.wanRaw),
        reason: this.extractReason(raw.healthRaw) ?? this.extractReason(raw.wanRaw),
      },
      wifi: {
        ssid: this.extractString(raw.wifiRaw, ['ssid', 'wifiName', 'wirelessName']) ?? null,
        band: this.extractString(raw.wifiRaw, ['band', 'wifiBand']) ?? null,
        security: this.extractString(raw.wifiRaw, ['security', 'securityType']) ?? null,
        channel: this.extractNumber(raw.wifiRaw, ['channel']) ?? null,
        enabled: this.extractBoolean(raw.wifiRaw, ['enabled', 'wifiEnabled']) ?? null,
        guestEnabled: this.extractBoolean(raw.wifiRaw, ['guestEnabled']) ?? null,
      },
      wan: {
        state: this.extractString(raw.wanRaw, ['state', 'wanState', 'wanStatus']) ?? null,
        uploadMbps: this.extractNumber(raw.wanRaw, ['uploadMbps', 'upload', 'uploadSpeed']) ?? null,
        downloadMbps: this.extractNumber(raw.wanRaw, ['downloadMbps', 'download', 'downloadSpeed']) ?? null,
        signalStrength: this.extractNumber(raw.wanRaw, ['signalStrength', 'rssi', 'signal']) ?? null,
        supported: wanSupported || wifiSupported || deviceInfoSupported || healthSupported,
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
        status: 'unknown',
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
    const state = this.extractString(source, ['state', 'wanState', 'wanStatus']);
    if (state && /connected|up|online/i.test(state)) {
      return 'connected';
    }
    if (state && /disconnected|down|offline/i.test(state)) {
      return 'disconnected';
    }
    return 'unknown';
  }

  private inferHealthStatus(healthSource: Record<string, unknown>, wanSource: Record<string, unknown>): 'ok' | 'degraded' | 'offline' | 'unknown' {
    const wanState = this.extractString(wanSource, ['state', 'wanState', 'wanStatus']);
    if (wanState && /disconnected|down|offline/i.test(wanState)) {
      return 'offline';
    }
    const cpu = this.extractNumber(healthSource, ['cpuUsage', 'cpu', 'cpuPercent']);
    const memory = this.extractNumber(healthSource, ['memoryUsage', 'memory', 'ramUsage']);
    if (cpu !== null && cpu > 85) {
      return 'degraded';
    }
    if (memory !== null && memory > 85) {
      return 'degraded';
    }
    return 'ok';
  }

  private extractString(source: Record<string, unknown>, keys: string[]): string | null {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
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
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return null;
  }

  private extractBoolean(source: Record<string, unknown>, keys: string[]): boolean | null {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        if (normalized === 'true') {
          return true;
        }
        if (normalized === 'false') {
          return false;
        }
      }
    }
    return null;
  }

  private extractDevices(source: Record<string, unknown>): DeviceSnapshot[] {
    const values = Array.isArray(source.devices) ? source.devices : Array.isArray(source.data) ? source.data : [];
    const devices = values.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null);

    return devices.map((entry) => ({
      mac: this.extractString(entry, ['mac', 'macAddress', 'MacAddr']) ?? null,
      name: this.extractString(entry, ['name', 'hostName', 'deviceName', 'UserDevAlias', 'HostName']) ?? null,
      ip: this.extractString(entry, ['ip', 'ipAddress', 'IpAddr']) ?? null,
      hostName: this.extractString(entry, ['hostName', 'hostname', 'HostName']) ?? null,
      signal: this.extractNumber(entry, ['signal', 'rssi']) ?? null,
      band: this.extractString(entry, ['band', 'wifiBand', 'PortType']) ?? null,
      online: this.extractBoolean(entry, ['online', 'connected', 'isOnline']) ?? null,
      raw: entry,
    }));
  }

  private extractReason(source: Record<string, unknown>): string | null {
    return this.extractString(source, ['reason', 'message', 'status']) ?? null;
  }

  private hasAnyValue(source: Record<string, unknown>): boolean {
    return Object.values(source).some((value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      if (typeof value === 'number') {
        return Number.isFinite(value);
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (value && typeof value === 'object') {
        return Object.keys(value as Record<string, unknown>).length > 0;
      }
      return false;
    });
  }
}

export class HuaweiClient {
  private readonly config = getRouterRuntimeConfig();
  private readonly cookieJar = new CookieJar();
  private readonly sessionManager = new SessionManager();
  private readonly tokenManager = new TokenManager();
  private readonly executor: RequestExecutor;
  private readonly snapshotService = new RouterSnapshotService();
  private lastAuth: RouterAuth | null = null;

  constructor() {
    this.executor = new RequestExecutor(this.config, this.cookieJar, this.tokenManager, this.sessionManager);
  }

  async connect(auth: RouterAuth): Promise<void> {
    this.lastAuth = auth;
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
    this.lastAuth = null;
  }

  async getSnapshot(): Promise<RouterSnapshot> {
    if (!this.sessionManager.isAuthenticated()) {
      if (this.lastAuth) {
        try {
          await this.connect(this.lastAuth);
        } catch {
          return this.snapshotService.createFallbackSnapshot(this.sessionManager.getAuthenticationStatus(), this.sessionManager.getLastError());
        }
      } else {
        return this.snapshotService.createFallbackSnapshot(this.sessionManager.getAuthenticationStatus(), this.sessionManager.getLastError());
      }
    }

    try {
      const [deviceInfo, healthAttr, wanAttr, wifiAttr, devicesAttr] = await Promise.all([
        this.safeRead('/html/bbsp/common/deviceinfo.asp'),
        this.safeRead('/html/bbsp/common/getWanDynamicData.asp'),
        this.safeRead('/html/bbsp/common/wanStateMonitor.asp'),
        this.safeRead('/html/bbsp/common/WlanBasic.asp'),
        this.safeRead('/html/bbsp/common/GetLanUserDevInfo.asp'),
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
    this.sessionManager.markConnecting();

    try {
      await this.safeRequest('/');
      await this.safeRequest('/asp/GetRandCount.asp', { method: 'GET' });
      const randToken = await this.fetchRandToken();

      const loginBody = new URLSearchParams({
        UserName: auth.username,
        PassWord: auth.password,
        Language: 'english',
      });

      if (randToken) {
        loginBody.set('x.X_HW_Token', randToken);
      }

      const response = await this.request('/login.cgi', {
        method: 'POST',
        body: loginBody.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const normalized = response.body.toLowerCase();
      const failure = /login failed|incorrect|invalid|error|unauthorized|fail/i.test(normalized);
      if (failure) {
        return { success: false, reason: 'Authentication failed' };
      }

      this.tokenManager.setCsrf(this.extractToken(response.body));
      return { success: true };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Authentication failed';
      this.sessionManager.markFailed(reason);
      return { success: false, reason };
    }
  }

  private async fetchRandToken(): Promise<string | null> {
    try {
      const response = await this.request('/html/ssmp/common/GetRandToken.asp', { method: 'GET' });
      const body = response.body;
      const match = body.match(/[A-Za-z0-9._-]{16,}/);
      const token = match?.[0] ?? null;
      this.tokenManager.setRand(token);
      return token;
    } catch {
      return null;
    }
  }

  private async safeRequest(path: string, init?: RequestInitLike): Promise<SafeHttpResponse> {
    try {
      return await this.request(path, init);
    } catch (error) {
      if (error instanceof Error && /timeout|tempor|network|aborted/i.test(error.message)) {
        return { status: 504, body: '', headers: {} };
      }
      throw error;
    }
  }

  private async safeRead(path: string): Promise<SafeHttpResponse> {
    return this.safeRequest(path, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
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
      const entries = new URLSearchParams(body.replace(/\r?\n/g, '&'));
      const parsed: Record<string, unknown> = {};
      entries.forEach((value, key) => {
        parsed[key] = value;
      });
      return parsed;
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
