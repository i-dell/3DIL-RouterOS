import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useApi } from '../pages/shared.js';
import type { Diagnostics } from '../pages/routerTypes.js';

interface SidebarItem {
  to: string;
  label: string;
  english: string;
  group: string;
}

const sidebarItems: SidebarItem[] = [
  {to:'/overview',label:'نظرة عامة',english:'Overview',group:'عام'},{to:'/dashboard',label:'لوحة التحكم',english:'Dashboard',group:'عام'},{to:'/quick-setup',label:'الإعدادات السريعة',english:'Quick Setup',group:'عام'},
  {to:'/network-status',label:'حالة الشبكة',english:'Network Status',group:'الشبكة'},{to:'/wifi',label:'الشبكة اللاسلكية',english:'Wi-Fi Settings',group:'الشبكة'},{to:'/guest-wifi',label:'شبكة الضيوف',english:'Guest Network',group:'الشبكة'},{to:'/devices',label:'الأجهزة المتصلة',english:'Connected Devices',group:'الشبكة'},{to:'/lan',label:'الشبكة المحلية',english:'LAN',group:'الشبكة'},{to:'/wan',label:'الإنترنت',english:'WAN / Internet',group:'الشبكة'},{to:'/dhcp',label:'خادم DHCP',english:'DHCP',group:'الشبكة'},{to:'/dns',label:'نظام الأسماء',english:'DNS',group:'الشبكة'},{to:'/nat',label:'ترجمة العناوين',english:'NAT',group:'الشبكة'},{to:'/port-forwarding',label:'تحويل المنافذ',english:'Port Forwarding',group:'الشبكة'},
  {to:'/security',label:'مركز الأمان',english:'Security Center',group:'الأمان'},{to:'/firewall',label:'الجدار الناري',english:'Firewall',group:'الأمان'},{to:'/mac-filter',label:'تصفية MAC',english:'MAC Filtering',group:'الأمان'},{to:'/dmz',label:'المنطقة المعزولة',english:'DMZ',group:'الأمان'},{to:'/upnp',label:'UPnP',english:'UPnP',group:'الأمان'},
  {to:'/monitoring',label:'المراقبة المباشرة',english:'Live Monitoring',group:'المراقبة'},{to:'/diagnostics',label:'التشخيص',english:'Diagnostics',group:'المراقبة'},{to:'/logs',label:'السجلات',english:'Logs',group:'المراقبة'},
  {to:'/backup',label:'النسخ والاستعادة',english:'Backup & Restore',group:'النظام'},{to:'/firmware',label:'البرنامج الثابت',english:'Firmware',group:'النظام'},{to:'/system',label:'النظام',english:'System',group:'النظام'},{to:'/settings',label:'الإعدادات',english:'Settings',group:'النظام'},{to:'/about',label:'حول',english:'About',group:'النظام'}
];
const NavIcon=()=> <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12h8M12 8v8"/></svg>;

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const diagnostics = useApi<Diagnostics>('/api/v1/router/diagnostics');
  const location = useLocation();
  const navigate = useNavigate();
  const current = sidebarItems.find((item) => item.to === location.pathname);
  const logout = async () => { await axios.post('/api/v1/router/logout'); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#040806] text-[#e8f7ed]" dir="rtl">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className={`fixed inset-y-0 right-0 z-30 w-72 border-l border-emerald-900/50 bg-[#050b08] p-5 shadow-[0_0_0_1px_rgba(16,185,129,0.1)] transition-transform duration-300 lg:static lg:flex lg:w-72 lg:flex-col ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-700/30 bg-[#07130d] px-3 py-3">
            <img src="/branding/logo-white.png" alt="Adil" className="h-11 w-24 object-contain" />
            <div>
              <p className="text-[15px] font-semibold text-emerald-300">Adil RouterOS</p>
              <p className="text-xs text-emerald-700/90">Local Network Console</p>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition ${isActive ? 'border border-emerald-500/40 bg-emerald-500/13 text-emerald-200' : 'text-[#8fb29d] hover:bg-[#0b1710] hover:text-emerald-100'}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <NavIcon/>
                  <span><span className="block">{item.label}</span><span className="block text-[10px] text-emerald-700">{item.english}</span></span>
                </span>
                <span className="text-xs text-emerald-500">↗</span>
              </NavLink>
            ))}
          </nav>

          <div className="space-y-3 rounded-2xl border border-emerald-900/60 bg-[#07120d] p-3">
            <div className="rounded-xl border border-emerald-900/60 bg-[#09170f] p-3">
              <p className="text-xs text-emerald-600">حالة الموجه</p>
              <p className="mt-1 text-sm font-semibold text-emerald-200">{diagnostics.loading?'Loading…':diagnostics.data?.authenticationVerified?'Authenticated':diagnostics.data?.safeReason??'Not authenticated'}</p>
            </div>
            <button onClick={()=>void logout()} className="w-full rounded-xl border border-emerald-800/60 bg-transparent px-3 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/10">تسجيل الخروج</button>
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
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">v4.0.0 · Version 4</p>
                  <h1 className="text-xl font-semibold text-[#f1fff4]">{current?.label??'Adil RouterOS'}</h1>
                  <p className="text-sm text-[#6e8772]">{diagnostics.data?.lastSuccessfulEndpoint??'Live local router console'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <img src="/branding/browser.png" alt="Adil" className="h-8 w-8 rounded-lg" />
                <span className={`h-3 w-3 rounded-full ${diagnostics.data?.authenticationVerified?'bg-emerald-400':'bg-amber-400'}`} aria-label={diagnostics.data?.authenticationVerified?'Authenticated':'Not authenticated'} />
              </div>
            </div>
          </header>

          <main className="px-4 py-4 sm:px-6 lg:px-8">
            {children ?? <Outlet />}
          </main>
          <footer className="border-t border-emerald-900/40 px-6 py-4 text-center text-xs text-emerald-700">Adil RouterOS v4.0.0 · Version 4</footer>
        </div>
      </div>
    </div>
  );
};
