import type { DashboardSnapshot } from '../../data/dashboardData.js';

interface RouterHeroProps {
  data: DashboardSnapshot['hero'];
}

export const RouterHero = ({ data }: RouterHeroProps) => {
  return (
    <section className="rounded-[28px] border border-emerald-800/40 bg-gradient-to-br from-[#0b2418] via-[#0d2b1d] to-[#072314] p-5 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">{data.status}</span>
            <span className="rounded-full border border-emerald-800/60 px-3 py-1 text-xs text-emerald-600">{data.connection}</span>
          </div>
          <div>
            <p className="text-sm text-emerald-600">الموجه</p>
            <h2 className="text-xl font-semibold text-[#e9fff1]">{data.model}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-900/60 bg-[#07130d]/70 p-3">
              <p className="text-xs text-emerald-700">البرمجية</p>
              <p className="mt-1 text-sm font-semibold text-emerald-100">{data.firmware}</p>
            </div>
            <div className="rounded-2xl border border-emerald-900/60 bg-[#07130d]/70 p-3">
              <p className="text-xs text-emerald-700">مزود الخدمة</p>
              <p className="mt-1 text-sm font-semibold text-emerald-100">{data.isp}</p>
            </div>
            <div className="rounded-2xl border border-emerald-900/60 bg-[#07130d]/70 p-3">
              <p className="text-xs text-emerald-700">الحالة</p>
              <p className="mt-1 text-sm font-semibold text-emerald-100">{data.connection}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-emerald-800/50 bg-[#07120d]/70 p-4 sm:min-w-[250px]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-emerald-600">السرعة</p>
            <span className="text-xs text-emerald-400">LIVE</span>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-emerald-900/60 bg-[#09170f] p-3">
              <p className="text-xs text-emerald-700">تنزيل</p>
              <p className="mt-1 text-xl font-semibold text-emerald-100">{data.download}</p>
            </div>
            <div className="rounded-xl border border-emerald-900/60 bg-[#09170f] p-3">
              <p className="text-xs text-emerald-700">رفع</p>
              <p className="mt-1 text-xl font-semibold text-emerald-100">{data.upload}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
