export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  status: string;
  progress?: number;
}

export interface DeviceEntry {
  id: string;
  name: string;
  ip: string;
  mac: string;
  band: string;
  signal: string;
  status: 'متصل' | 'مُعلق' | 'غير متصل';
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
    model: string;
    firmware: string;
    isp: string;
    status: string;
    connection: string;
    download: string;
    upload: string;
  };
  metrics: DashboardMetric[];
  devices: DeviceEntry[];
  activities: ActivityItem[];
  quickActions: Array<{ id: string; title: string; description: string }>;
}

export const fallbackDashboardData: DashboardSnapshot = {
  hero: {
    model: 'OptiXstar LG8245X6-10',
    firmware: 'V500R022C10SPC272',
    isp: 'Saudi Arabia Mobily',
    status: 'سليم',
    connection: 'متصل',
    download: '376 Mbps',
    upload: '74 Mbps',
  },
  metrics: [
    { id: 'cpu', label: 'استخدام المعالج', value: '42%', status: 'مستقر', progress: 42 },
    { id: 'memory', label: 'استخدام الذاكرة', value: '68%', status: 'مقبول', progress: 68 },
    { id: 'devices', label: 'الأجهزة المتصلة', value: '27', status: '5 جديدة اليوم' },
    { id: 'latency', label: 'الزمن المسموح', value: '14 ms', status: 'منخفض جدًا' },
  ],
  devices: [
    { id: '1', name: 'Galaxy S24', ip: '192.168.1.16', mac: 'A4:4E:31:15:2A:70', band: '5 GHz', signal: '-48 dBm', status: 'متصل', actionLabel: 'حظر' },
    { id: '2', name: 'MacBook Pro', ip: '192.168.1.24', mac: 'BC:5F:F4:12:6E:08', band: '2.4 GHz', signal: '-57 dBm', status: 'متصل', actionLabel: 'حظر' },
    { id: '3', name: 'Home Camera', ip: '192.168.1.33', mac: '00:1A:2B:3C:4D:5E', band: '2.4 GHz', signal: '-63 dBm', status: 'مُعلق', actionLabel: 'حظر' },
  ],
  activities: [
    { id: 'a1', title: 'تم تحديث لوحة التحكم', detail: 'تمت مراجعة حالة الشبكة خلال 30 ثانية', when: 'منذ 2 دقيقة' },
    { id: 'a2', title: 'تمت إضافة جهاز جديد', detail: 'تم تسجيل Galaxy S24 عبر الواي فاي 5G', when: 'منذ 8 دقائق' },
    { id: 'a3', title: 'WAN في حالة صحية', detail: 'الإنترنت مستقر مع انخفاض في التأخير', when: 'منذ 12 دقيقة' },
  ],
  quickActions: [
    { id: 'restart', title: 'إعادة تشغيل الموجه', description: 'أعد تشغيل الجهاز بسرعة' },
    { id: 'devices', title: 'عرض الأجهزة', description: 'اعرض قائمة الأجهزة المتصلة' },
    { id: 'wifi', title: 'إعدادات الواي فاي', description: 'إدارة Name/Password' },
    { id: 'login', title: 'تسجيل الدخول', description: 'فتح واجهة الإدارة' },
  ],
};
