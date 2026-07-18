export interface DeviceSnapshot {
  mac: string | null;
  name: string | null;
  ip: string | null;
  hostName: string | null;
  signal: number | null;
  band: string | null;
  online: boolean | null;
  raw: Record<string, unknown>;
}

export interface RouterSnapshot {
  timestamp: string;
  connection: {
    status: 'connected' | 'disconnected' | 'unknown';
    reason: string | null;
    wanIp: string | null;
    dns: string[] | null;
    uplink: string | null;
  };
  deviceInfo: {
    model: string | null;
    firmware: string | null;
    isp: string | null;
    uptimeSeconds: number | null;
    serial: string | null;
  };
  health: {
    cpuUsage: number | null;
    memoryUsage: number | null;
    temperatureC: number | null;
    latencyMs: number | null;
    status: 'ok' | 'degraded' | 'offline' | 'unknown';
    reason: string | null;
  };
  wifi: {
    ssid: string | null;
    band: string | null;
    security: string | null;
    channel: number | null;
    enabled: boolean | null;
    guestEnabled: boolean | null;
  };
  wan: {
    state: string | null;
    uploadMbps: number | null;
    downloadMbps: number | null;
    signalStrength: number | null;
    supported: boolean;
    reason: string | null;
  };
  devices: DeviceSnapshot[];
  authentication: {
    status: 'connecting' | 'authenticating' | 'connected' | 'failed' | 'expired' | 'unsupported';
    reason: string | null;
  };
}
