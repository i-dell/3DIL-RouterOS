export interface DashboardMetric {
  id: string;
  label: string;
  value: string | null;
  status: string | null;
  progress?: number | null;
}

export interface DeviceEntry {
  id: string;
  name: string | null;
  ip: string | null;
  mac: string | null;
  band: string | null;
  signal: string | null;
  status: string | null;
  actionLabel: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  when: string;
}

export interface DashboardSnapshot {
  hero: {
    model: string | null;
    firmware: string | null;
    isp: string | null;
    status: string | null;
    connection: string | null;
    download: string | null;
    upload: string | null;
  };
  metrics: DashboardMetric[];
  devices: DeviceEntry[];
  activities: ActivityItem[];
  quickActions: Array<{ id: string; title: string; description: string }>;
}

export const emptyDashboardData: DashboardSnapshot = {
  hero: {
    model: null,
    firmware: null,
    isp: null,
    status: null,
    connection: null,
    download: null,
    upload: null,
  },
  metrics: [],
  devices: [],
  activities: [],
  quickActions: [
    { id: 'restart', title: 'إعادة تشغيل الموجه', description: 'متاح عند التحقق من الاتصال' },
    { id: 'devices', title: 'عرض الأجهزة', description: 'سيظهر هنا عند توفر البيانات' },
    { id: 'wifi', title: 'إعدادات الواي فاي', description: 'سيتم عرضها عند توفرها' },
    { id: 'login', title: 'تسجيل الدخول', description: 'فتح واجهة الإدارة المحلية' },
  ],
};
