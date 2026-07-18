import type { DashboardSnapshot } from '../../data/dashboardData.js';

interface RouterHeroProps {
  data: DashboardSnapshot['hero'];
}

export const RouterHero = ({ data }: RouterHeroProps) => {
  return (
    <section className="rounded-[30px] border border-emerald-800/40 bg-[linear-gradient(135deg,_rgba(8,25,17,0.95),_rgba(5,15,11,0.92))] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">{data.status ?? 'غير متاح'}</span>
            <span className="rounded-full border border-emerald-800/60 px-3 py-1 text-xs text-emerald-600">{data.connection ?? 'في الانتظار'}</span>
          </div>
          <div>
            <p className="text-sm text-emerald-600">الموجه الرئيسي</p>
            <h2 className="text-xl font-semibold text-[#f7fff8]">{data.model ?? 'Huawei OptiXstar LG8245X6-10'}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-900/60 bg-[#07120d]/80 p-3">
              <p className="text-xs text-emerald-700">البرمجية</p>
              <p className="mt-1 text-sm font-semibold text-emerald-100">{data.firmware ?? 'غير متوفر'}</p>
            </div>
            <div className="rounded-2xl border border-emerald-900/60 bg-[#07120d]/80 p-3">
              <p className="text-xs text-emerald-700">مزود الخدمة</p>
              <p className="mt-1 text-sm font-semibold text-emerald-100">{data.isp ?? 'غير متوفر'}</p>
            </div>
            <div className="rounded-2xl border border-emerald-900/60 bg-[#07120d]/80 p-3">
              <p className="text-xs text-emerald-700">الحالة</p>
              <p className="mt-1 text-sm font-semibold text-emerald-100">{data.connection ?? 'غير متوفر'}</p>
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
              <p className="mt-1 text-xl font-semibold text-emerald-100">{data.download ?? 'غير متوفر'}</p>
            </div>
            <div className="rounded-xl border border-emerald-900/60 bg-[#09170f] p-3">
              <p className="text-xs text-emerald-700">رفع</p>
              <p className="mt-1 text-xl font-semibold text-emerald-100">{data.upload ?? 'غير متوفر'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
