import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { RouterHero } from '../components/dashboard/RouterHero.js';
import { MetricCard } from '../components/dashboard/MetricCard.js';
import { ConnectedDevices } from '../components/dashboard/ConnectedDevices.js';
import { QuickActions } from '../components/dashboard/QuickActions.js';
import { ActivityFeed } from '../components/dashboard/ActivityFeed.js';
import { emptyDashboardData } from '../data/dashboardData.js';

interface LiveSnapshotResponse {
  deviceInfo: {
    model: string | null;
    firmware: string | null;
    isp: string | null;
  };
  health: {
    cpuUsage: number | null;
    memoryUsage: number | null;
    latencyMs: number | null;
    status: string | null;
    reason: string | null;
  };
  connection: {
    status: string | null;
    reason: string | null;
  };
  wan: {
    state: string | null;
    uploadMbps: number | null;
    downloadMbps: number | null;
    supported: boolean;
    reason: string | null;
  };
  wifi: {
    ssid: string | null;
    band: string | null;
    security: string | null;
  };
  devices: Array<{ mac: string | null; name: string | null; ip: string | null; band: string | null; signal: number | null; online: boolean | null }>;
  authentication: {
    status: string | null;
    reason: string | null;
  };
}

const formatStatus = (value: string | null | undefined) => {
  if (!value) return 'Unsupported';
  if (value === 'connected') return 'Connected';
  if (value === 'disconnected') return 'Disconnected';
  if (value === 'authenticating') return 'Authenticating';
  if (value === 'expired') return 'Session Expired';
  if (value === 'failed') return 'Authentication Failed';
  if (value === 'unsupported') return 'Unsupported';
  return value;
};

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState(emptyDashboardData);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get<LiveSnapshotResponse>('/api/v1/router/snapshot');
        const data = response.data;
        const authStatus = data.authentication?.status ?? 'unsupported';
        const isUnavailable = authStatus === 'failed' || authStatus === 'expired' || authStatus === 'unsupported';

        setSnapshot({
          hero: {
            model: data.deviceInfo?.model ?? null,
            firmware: data.deviceInfo?.firmware ?? null,
            isp: data.deviceInfo?.isp ?? null,
            status: formatStatus(data.health?.status ?? authStatus),
            connection: formatStatus(data.connection?.status ?? authStatus),
            download: data.wan?.downloadMbps != null ? `${data.wan.downloadMbps} Mbps` : null,
            upload: data.wan?.uploadMbps != null ? `${data.wan.uploadMbps} Mbps` : null,
          },
          metrics: [
            { id: 'cpu', label: 'استخدام المعالج', value: data.health?.cpuUsage != null ? `${data.health.cpuUsage}%` : null, status: isUnavailable ? formatStatus(authStatus) : formatStatus(data.health?.status ?? 'connected'), progress: data.health?.cpuUsage ?? null },
            { id: 'memory', label: 'استخدام الذاكرة', value: data.health?.memoryUsage != null ? `${data.health.memoryUsage}%` : null, status: isUnavailable ? formatStatus(authStatus) : formatStatus(data.health?.status ?? 'connected'), progress: data.health?.memoryUsage ?? null },
            { id: 'devices', label: 'عدد الأجهزة', value: data.devices?.length != null ? `${data.devices.length}` : null, status: formatStatus(authStatus), progress: undefined },
            { id: 'latency', label: 'الزمن', value: data.health?.latencyMs != null ? `${data.health.latencyMs} ms` : null, status: formatStatus(data.connection?.status ?? authStatus), progress: undefined },
          ],
          devices: data.devices.map((device, index) => ({
            id: device.mac ?? `${index}`,
            name: device.name ?? null,
            ip: device.ip ?? null,
            mac: device.mac ?? null,
            band: device.band ?? null,
            signal: device.signal != null ? `${device.signal} dBm` : null,
            status: device.online ? 'متصل' : 'غير متصل',
            actionLabel: 'حظر',
          })),
          activities: [
            { id: 'connect', title: 'تحديث الحالة', detail: data.connection?.reason ?? data.authentication?.reason ?? 'في انتظار البيانات من الموجه', when: 'الآن' },
            { id: 'wan', title: 'WAN', detail: data.wan?.state ?? 'Unsupported', when: 'الآن' },
            { id: 'wifi', title: 'Wi-Fi', detail: data.wifi?.ssid ?? 'Unsupported', when: 'الآن' },
          ],
          quickActions: [
            { id: 'restart', title: 'إعادة تشغيل الموجه', description: 'متاح عند الاتصال' },
            { id: 'devices', title: 'عرض الأجهزة', description: 'يظهر عند توفر البيانات' },
            { id: 'wifi', title: 'إعدادات الواي فاي', description: 'متوفرة عند توفرها' },
            { id: 'login', title: 'تسجيل الدخول', description: 'واجهة الإدارة المحلية' },
          ],
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Backend unavailable');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return <div className="rounded-[28px] border border-emerald-800/40 bg-[#07120d] p-6 text-emerald-200">جارٍ الاتصال بالوكيل المحلي…</div>;
    }

    if (error) {
      return <div className="rounded-[28px] border border-emerald-800/40 bg-[#07120d] p-6 text-emerald-200">{error}</div>;
    }

    if (snapshot.devices.length === 0 && snapshot.metrics.every((metric) => metric.value == null)) {
      return <div className="rounded-[28px] border border-emerald-800/40 bg-[#07120d] p-6 text-emerald-200">لا توجد بيانات متاحة من الموجه بعد.</div>;
    }

    return (
      <div className="space-y-4">
        <RouterHero data={snapshot.hero} />

        <div className="grid gap-4 xl:grid-cols-4">
          {snapshot.metrics.map((metric: (typeof snapshot.metrics)[number]) => (
            <MetricCard key={metric.id} label={metric.label} value={metric.value ?? 'Unsupported'} status={metric.status ?? 'Unsupported'} progress={metric.progress ?? undefined} />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
          <ConnectedDevices devices={snapshot.devices} />
          <div className="space-y-4">
            <QuickActions actions={snapshot.quickActions} />
            <ActivityFeed items={snapshot.activities} />
          </div>
        </div>
      </div>
    );
  }, [error, loading, snapshot]);

  return content;
};
