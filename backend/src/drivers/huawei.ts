import type { RouterAuth, RouterDriver, RouterStatus, RouterVersionInfo } from '@3dil-routeros/shared';
import { defaultRouterVersion } from '@3dil-routeros/shared';

export class HuaweiDriver implements RouterDriver {
  private connected = false;

  async connect(auth: RouterAuth): Promise<void> {
    if (!auth.username || !auth.password) {
      throw new Error('Authentication required');
    }
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async getStatus(): Promise<RouterStatus> {
    return {
      online: this.connected,
      signal: 87,
      temperatureC: 41,
      uptimeSeconds: 30000,
    };
  }

  async getVersion(): Promise<RouterVersionInfo> {
    return defaultRouterVersion;
  }
}

export class HuaweiDriverFactory {
  create(): RouterDriver {
    return new HuaweiDriver();
  }
}
