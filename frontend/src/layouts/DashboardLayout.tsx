import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface SidebarItem {
  to: string;
  label: string;
  icon: string;
}

const sidebarItems: SidebarItem[] = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: '◉' },
  { to: '/devices', label: 'الأجهزة', icon: '◌' },
  { to: '/wifi', label: 'Wi-Fi', icon: '◍' },
  { to: '/wan', label: 'الإنترنت', icon: '◐' },
  { to: '/security', label: 'الأمان', icon: '◑' },
  { to: '/settings', label: 'الإعدادات', icon: '◒' },
  { to: '/logs', label: 'السجل', icon: '≡' },
];

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#040806] text-[#e8f7ed]" dir="rtl">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className={`fixed inset-y-0 right-0 z-30 w-72 border-l border-emerald-900/50 bg-[#050b08] p-5 shadow-[0_0_0_1px_rgba(16,185,129,0.1)] transition-transform duration-300 lg:static lg:flex lg:w-72 lg:flex-col ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-700/30 bg-[#07130d] px-3 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-semibold text-black">3D</div>
            <div>
              <p className="text-[15px] font-semibold text-emerald-300">3DIL RouterOS</p>
              <p className="text-xs text-emerald-700/90">Local Network Console</p>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-2">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition ${isActive ? 'border border-emerald-500/40 bg-emerald-500/13 text-emerald-200' : 'text-[#8fb29d] hover:bg-[#0b1710] hover:text-emerald-100'}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <span className="text-xs text-emerald-500">↗</span>
              </NavLink>
            ))}
          </nav>

          <div className="space-y-3 rounded-2xl border border-emerald-900/60 bg-[#07120d] p-3">
            <div className="rounded-xl border border-emerald-900/60 bg-[#09170f] p-3">
              <p className="text-xs text-emerald-600">حالة الموجه</p>
              <p className="mt-1 text-sm font-semibold text-emerald-200">تُعرض الحالة من صفحة الإعدادات</p>
            </div>
            <button className="w-full rounded-xl border border-emerald-800/60 bg-transparent px-3 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/10">تسجيل الخروج</button>
          </div>
        </aside>

        <div className="flex-1 lg:mr-0">
          <header className="border-b border-emerald-900/40 bg-[#050b08]/90 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button className="rounded-xl border border-emerald-800/60 bg-[#07120d] p-2 text-emerald-200 lg:hidden" onClick={() => setMobileOpen(true)}>
                  ☰
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">v2.0.0-alpha.4</p>
                  <h1 className="text-xl font-semibold text-[#f1fff4]">لوحة التحكم</h1>
                  <p className="text-sm text-[#6e8772]">نظرة مباشرة على حالة الشبكة المنزلية</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-full border border-emerald-800/60 bg-[#07120d] p-2 text-emerald-200">🔔</button>
                <button className="rounded-full border border-emerald-800/60 bg-[#07120d] p-2 text-emerald-200">☾</button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 font-semibold text-black">AD</button>
              </div>
            </div>
          </header>

          <main className="px-4 py-4 sm:px-6 lg:px-8">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};
