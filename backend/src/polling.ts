import { EventEmitter } from 'events';
import type { RouterSnapshot } from './types.js';
import { HuaweiDriver } from './drivers/huawei.js';
import { getRouterRuntimeConfig } from './config.js';

export interface PollingServiceEvents {
  snapshot: [RouterSnapshot];
  deviceConnected: [RouterSnapshot, string];
  deviceDisconnected: [RouterSnapshot, string];
  error: [Error];
}

export class PollingService extends EventEmitter {
  private readonly driver: HuaweiDriver;
  private readonly config = getRouterRuntimeConfig();
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentSnapshot: RouterSnapshot | null = null;
  private previousDeviceIds = new Set<string>();
  private running = false;
  private backoffMs = 1000;

  constructor(driver?: HuaweiDriver) {
    super();
    this.driver = driver ?? new HuaweiDriver();
  }

  async start(username: string, password: string): Promise<void> {
    if (this.running) return;
    this.running = true;
    await this.driver.connect({ username, password });
    await this.pollOnce();
    this.timer = setInterval(() => {
      void this.pollOnce();
    }, this.config.pollIntervalMs);
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    void this.driver.disconnect();
  }

  getSnapshot(): RouterSnapshot | null {
    return this.currentSnapshot;
  }

  private async pollOnce(): Promise<void> {
    try {
      const snapshot = await this.driver.getSnapshot();
      this.currentSnapshot = snapshot;
      this.emit('snapshot', snapshot);
      const currentIds = new Set(snapshot.devices.map((device) => device.mac ?? device.ip ?? device.name ?? '').filter(Boolean));
      for (const id of currentIds) {
        if (!this.previousDeviceIds.has(id)) {
          this.emit('deviceConnected', snapshot, id);
        }
      }
      for (const id of this.previousDeviceIds) {
        if (!currentIds.has(id)) {
          this.emit('deviceDisconnected', snapshot, id);
        }
      }
      this.previousDeviceIds = currentIds;
      this.backoffMs = 1000;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Router polling failed');
      this.emit('error', err);
      this.backoffMs = Math.min(this.backoffMs * 2, 15000);
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
          void this.pollOnce();
        }, this.backoffMs);
      }
    }
  }
}
