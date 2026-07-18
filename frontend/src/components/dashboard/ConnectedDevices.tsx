import type { DeviceEntry } from '../../data/dashboardData.js';

interface ConnectedDevicesProps {
  devices: DeviceEntry[];
}

export const ConnectedDevices = ({ devices }: ConnectedDevicesProps) => {
  return (
    <section className="rounded-[28px] border border-emerald-800/40 bg-[linear-gradient(180deg,_rgba(7,18,13,0.95),_rgba(4,12,9,0.95))] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-emerald-600">الأجهزة المتصلة</p>
          <h3 className="text-lg font-semibold text-[#f1fff4]">قائمة الأجهزة</h3>
        </div>
        <button className="rounded-full border border-emerald-800/50 px-3 py-1 text-sm text-emerald-300 transition hover:border-emerald-500/40">تحديث</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-900/60">
        <div className="grid grid-cols-[1.2fr_0.9fr_1.1fr_0.7fr_0.7fr_0.6fr] gap-3 bg-[#0b1811] px-3 py-3 text-xs text-emerald-700">
          <span>اسم الجهاز</span>
          <span>IPv4</span>
          <span>MAC</span>
          <span>النطاق</span>
          <span>الإشارة</span>
          <span>الحالة</span>
        </div>
        <div className="divide-y divide-emerald-900/40">
          {devices.map((device) => (
            <div key={device.id} className="grid grid-cols-[1.2fr_0.9fr_1.1fr_0.7fr_0.7fr_0.6fr] items-center gap-3 px-3 py-3 text-sm text-[#dcefe0]">
              <div>
                <p className="font-medium">{device.name ?? 'غير معروف'}</p>
                <p className="text-xs text-[#6e8772]">{device.status ?? 'غير متوفر'}</p>
              </div>
              <div className="text-xs text-[#8fb29d]">{device.ip ?? 'غير متوفر'}</div>
              <div className="text-xs font-mono text-[#8fb29d]">{device.mac ?? 'غير متوفر'}</div>
              <div className="text-xs text-[#8fb29d]">{device.band ?? 'غير متوفر'}</div>
              <div className="text-xs text-[#8fb29d]">{device.signal ?? 'غير متوفر'}</div>
              <button className="rounded-full border border-emerald-800/40 px-2 py-1 text-[11px] text-emerald-300 transition hover:border-emerald-500/40">{device.actionLabel}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
