export interface SupportMeta { supported: boolean; reason: string | null; sourceEndpoint: string | null; lastUpdated: string | null }
export interface DeviceSnapshot { hostname: string | null; alias: string | null; ipv4: string | null; ipv6: string | null; mac: string | null; connectionType: string | null; wifiBand: string | null; signal: number | null; online: boolean | null; connectionDuration: number | null }
export interface RouterSnapshot {
  timestamp: string; stale: boolean;
  authentication: { status: 'connecting'|'authenticating'|'connected'|'failed'|'expired'|'protocol-mismatch'; reason: string|null; verifiedEndpoint: string|null };
  deviceInfo: SupportMeta & { model:string|null; firmware:string|null; serial:string|null; hardwareVersion:string|null; uptime:number|null };
  health: SupportMeta & { cpuUsage:number|null; memoryUsage:number|null; temperature:number|null };
  wan: SupportMeta & { state:string|null; ip:string|null; gateway:string|null; dns:string[]|null; connectionType:string|null; uptime:number|null; uploadBytes:number|null; downloadBytes:number|null };
  wifi: SupportMeta & { bands:Array<{band:'2.4 GHz'|'5 GHz';ssid:string|null;enabled:boolean|null;channel:number|null;security:string|null;guest:boolean}> };
  devices: SupportMeta & { items:DeviceSnapshot[] };
  security: SupportMeta & { firewall:boolean|null; macFilter:boolean|null; dmz:boolean|null; upnp:boolean|null };
}
export interface SafeDiagnostic { stage:string; endpoint:string|null; httpStatus:number|null; contentType:string|null; responseLength:number|null; authenticated:boolean; reason:string|null; parserName:string|null; lastPollTime:string|null }
export interface AuthDiagnosticStage { stage:string; endpoint:string; method:string; httpStatus:number|null; cookiesReceived:number; cookiesStored:number; redirectTarget:string|null; authenticated:boolean; reason:string|null; timestamp:string }
