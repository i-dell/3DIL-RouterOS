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

export class HuaweiDriver {
  private readonly config = getRouterRuntimeConfig();
  private readonly cookieJar: Map<string, string> = new Map();
  private csrfToken: string | null = null;
  private connected = false;
  private authenticated = false;
  private lastError: string | null = null;

  async connect(auth: RouterAuth): Promise<void> {
    this.connected = false;
    this.authenticated = false;
    this.lastError = null;
    this.cookieJar.clear();
    this.csrfToken = null;

    if (!auth.username || !auth.password) {
      throw new Error('Authentication required');
    }

    const loginResult = await this.login(auth);
    if (!loginResult.success) {
      throw new Error(loginResult.reason ?? 'Authentication failed');
    }

    this.connected = true;
    this.authenticated = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.authenticated = false;
    this.csrfToken = null;
    this.cookieJar.clear();
  }

  async getSnapshot(): Promise<RouterSnapshot> {
    if (!this.authenticated) {
      throw new Error('Not authenticated');
    }

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

    return {
      timestamp: new Date().toISOString(),
      connection: {
        status: this.inferConnectionState(wanRaw),
        reason: this.extractReason(wanRaw),
        wanIp: this.extractString(wanRaw, ['wanIp', 'WANIP', 'ip']) ?? null,
        dns: this.extractStringArray(wanRaw, ['dns', 'dnsServers']) ?? null,
        uplink: this.extractString(wanRaw, ['uplink', 'wanType']) ?? null,
      },
      deviceInfo: {
        model: this.extractString(deviceInfoRaw, ['modelName', 'ModelName', 'deviceName']) ?? 'OptiXstar LG8245X6-10',
        firmware: this.extractString(deviceInfoRaw, ['firmwareVersion', 'FirmwareVersion', 'version']) ?? 'V500R022C10SPC272',
        isp: this.extractString(deviceInfoRaw, ['isp', 'ISP']) ?? 'Saudi Arabia Mobily',
        uptimeSeconds: this.extractNumber(deviceInfoRaw, ['uptime', 'uptimeSeconds']) ?? null,
        serial: this.extractString(deviceInfoRaw, ['serial', 'serialNumber']) ?? null,
      },
      health: {
        cpuUsage: this.extractNumber(healthRaw, ['cpuUsage', 'cpu']) ?? null,
        memoryUsage: this.extractNumber(healthRaw, ['memoryUsage', 'memory']) ?? null,
        temperatureC: this.extractNumber(healthRaw, ['temperatureC', 'temperature']) ?? null,
        latencyMs: this.extractNumber(healthRaw, ['latency', 'latencyMs']) ?? null,
        status: this.inferHealthStatus(healthRaw, wanRaw),
        reason: this.extractReason(healthRaw) ?? this.extractReason(wanRaw),
      },
      wifi: {
        ssid: this.extractString(wifiRaw, ['ssid', 'wifiName']) ?? null,
        band: this.extractString(wifiRaw, ['band', 'wifiBand']) ?? null,
        security: this.extractString(wifiRaw, ['security', 'securityType']) ?? null,
        channel: this.extractNumber(wifiRaw, ['channel']) ?? null,
        enabled: this.extractBoolean(wifiRaw, ['enabled', 'wifiEnabled']) ?? null,
        guestEnabled: this.extractBoolean(wifiRaw, ['guestEnabled']) ?? null,
      },
      wan: {
        state: this.extractString(wanRaw, ['state', 'wanState', 'wanStatus']) ?? null,
        uploadMbps: this.extractNumber(wanRaw, ['uploadMbps', 'upload']) ?? null,
        downloadMbps: this.extractNumber(wanRaw, ['downloadMbps', 'download']) ?? null,
        signalStrength: this.extractNumber(wanRaw, ['signalStrength', 'rssi']) ?? null,
        supported: true,
        reason: null,
      },
      devices: this.extractDevices(devicesRaw),
      authentication: {
        status: 'connected',
        reason: null,
      },
    };
  }

  async getConnectionStatus(): Promise<{ status: string; reason: string | null }> {
    try {
      const snapshot = await this.getSnapshot();
      return { status: snapshot.connection.status, reason: snapshot.connection.reason };
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'unknown error';
      return { status: 'disconnected', reason: this.lastError };
    }
  }

  private async login(auth: RouterAuth): Promise<LoginResponse> {
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

      const response = await this.request('/html/login.asp', { method: 'POST', body: loginBody.toString(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      const html = response.body;
      const success = /login/.test(html.toLowerCase()) === false && /error/.test(html.toLowerCase()) === false;
      if (!success) {
        return { success: false, reason: 'Authentication failed' };
      }

      this.csrfToken = this.extractToken(html);
      return { success: true };
    } catch (error) {
      return { success: false, reason: error instanceof Error ? error.message : 'Authentication failed' };
    }
  }

  private async fetchRandToken(): Promise<string | null> {
    const response = await this.request('/html/GetRandToken.asp', { method: 'GET' });
    const body = response.body;
    const match = body.match(/([A-Za-z0-9._-]{4,})/);
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
    const url = new URL(path, this.config.baseUrl).toString();
    const requestHeaders = new Headers(init?.headers);
    requestHeaders.set('Accept', 'text/html,application/json,text/plain,*/*');
    requestHeaders.set('User-Agent', 'Mozilla/5.0');
    if (this.csrfToken) {
      requestHeaders.set('X-CSRF-Token', this.csrfToken);
    }

    const cookieHeader = [...this.cookieJar.entries()].map(([key, value]) => `${key}=${value}`).join('; ');
    if (cookieHeader) {
      requestHeaders.set('Cookie', cookieHeader);
    }

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

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return { status: response.status, body, headers: responseHeaders };
  }

  private parseBodyToObject(body: string): Record<string, unknown> {
    if (!body) {
      return {};
    }

    try {
      const parsed = JSON.parse(body);
      return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }

  private extractToken(html: string): string | null {
    const match = html.match(/token["'=:\s]+([A-Za-z0-9._-]+)/i);
    return match?.[1] ?? null;
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

  private extractReason(source: Record<string, unknown>): string | null {
    return this.extractString(source, ['reason', 'message', 'status']) ?? null;
  }
}

export class HuaweiDriverFactory {
  create(): HuaweiDriver {
    return new HuaweiDriver();
  }
}
