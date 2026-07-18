import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useApi } from '../pages/shared.js';
import type { Diagnostics } from '../pages/routerTypes.js';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav.js';

interface SidebarItem {
  to: string;
  label: string;
  english: string;
  group: string;
}

const sidebarItems: SidebarItem[] = [
  {to:'/dashboard',label:'لوحة التحكم',english:'Dashboard',group:'primary'},
  {to:'/devices',label:'الأجهزة المتصلة',english:'Connected Devices',group:'primary'},
  {to:'/wifi',label:'الشبكة اللاسلكية',english:'Wi-Fi Settings',group:'primary'},
  {to:'/advanced',label:'الإعدادات المتقدمة',english:'Advanced Settings',group:'primary'},
  {to:'/security',label:'الأمان',english:'Security',group:'primary'},
  {to:'/parental-control',label:'الرقابة الأبوية',english:'Parental Control',group:'primary'},
  {to:'/qos',label:'جودة الخدمة',english:'QoS',group:'primary'},
  {to:'/reboot',label:'إعادة تشغيل الراوتر',english:'Reboot Router',group:'primary'},
  {to:'/diagnostics',label:'تشخيص الشبكة',english:'Network Diagnostics',group:'primary'},
  {to:'/logs',label:'سجلات النظام',english:'System Logs',group:'primary'},
  {to:'/backup',label:'نسخ احتياطي / استعادة',english:'Backup / Restore',group:'primary'},
  {to:'/quick-setup',label:'الإعدادات السريعة',english:'Quick Setup',group:'primary'},
  {to:'/about-device',label:'حول الجهاز',english:'About Device',group:'primary'}
];
const NavIcon=()=> <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12h8M12 8v8"/></svg>;

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,setCollapsed]=useState(()=>localStorage.getItem('adil.sidebar.collapsed')==='true');
  const [theme,setTheme]=useState(()=>localStorage.getItem('adil.theme')??'dark');
  useEffect(()=>{localStorage.setItem('adil.sidebar.collapsed',String(collapsed))},[collapsed]);
  useEffect(()=>{localStorage.setItem('adil.theme',theme);document.documentElement.dataset.theme=theme},[theme]);
  useEffect(()=>{document.body.style.overflow=mobileOpen?'hidden':'';const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setMobileOpen(false)};addEventListener('keydown',close);return()=>{document.body.style.overflow='';removeEventListener('keydown',close)}},[mobileOpen]);
  const diagnostics = useApi<Diagnostics>('/api/v1/router/diagnostics');
  const location = useLocation();
  const navigate = useNavigate();
  const current = sidebarItems.find((item) => item.to === location.pathname);
  const logout = async () => { await axios.post('/api/v1/router/logout'); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#040806] text-[#e8f7ed]" dir="rtl">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {mobileOpen&&<button aria-label="إغلاق القائمة" onClick={()=>setMobileOpen(false)} className="fixed inset-0 z-20 bg-black/60 lg:hidden"/>}
        <aside className={`fixed inset-y-0 right-0 z-30 border-l border-emerald-900/50 bg-[#050b08] p-3 shadow-[0_0_0_1px_rgba(16,185,129,0.1)] transition-all duration-300 lg:static lg:flex lg:flex-col ${collapsed?'lg:w-20':'lg:w-72'} ${mobileOpen ? 'w-72 translate-x-0' : 'w-72 translate-x-full lg:translate-x-0'}`}>
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-700/30 bg-[#07130d] px-3 py-3">
            <img src="/branding/logo-white.png" alt="Adil" className="h-11 w-24 object-contain" />
            <div className={collapsed?'lg:hidden':''}>
              <p className="text-[15px] font-semibold text-emerald-300">Adil RouterOS</p>
              <p className="text-xs text-emerald-700/90">Local Network Console</p>
            </div>
          </div>

          <button onClick={()=>setCollapsed(value=>!value)} aria-label={collapsed?'توسيع القائمة':'طي القائمة'} aria-expanded={!collapsed} className="mt-3 hidden w-full rounded-xl border border-emerald-900 p-2 text-emerald-300 lg:block">{collapsed?'←':'→ طي القائمة'}</button>
          <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed?`${item.label} · ${item.english}`:undefined}
                className={({ isActive }) => `flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition ${collapsed?'lg:justify-center':''} ${isActive ? 'border border-emerald-500/40 bg-emerald-500/13 text-emerald-200' : 'text-[#8fb29d] hover:bg-[#0b1710] hover:text-emerald-100'}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <NavIcon/>
                  <span className={collapsed?'lg:hidden':''}><span className="block">{item.label}</span><span className="block text-[10px] text-emerald-700">{item.english}</span></span>
                </span>
                <span className={`text-xs text-emerald-500 ${collapsed?'lg:hidden':''}`}>↗</span>
              </NavLink>
            ))}
          </nav>

          <div className={`space-y-3 rounded-2xl border border-emerald-900/60 bg-[#07120d] p-3 ${collapsed?'lg:hidden':''}`}>
            <button onClick={()=>setTheme(value=>value==='dark'?'light':'dark')} aria-label="تبديل المظهر" className="flex min-h-11 w-full items-center justify-between rounded-xl border border-emerald-900/60 px-3 text-sm"><span>الوضع {theme==='dark'?'الداكن':'الفاتح'}</span><span className={`h-5 w-9 rounded-full p-0.5 ${theme==='dark'?'bg-emerald-500':'bg-slate-500'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${theme==='dark'?'translate-x-0':'-translate-x-4'}`}/></span></button>
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
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">v4.0.0</p>
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

          <main className="px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-4">
            {children ?? <Outlet />}
          </main>
          <footer className="border-t border-emerald-900/40 px-6 py-4 text-center text-xs text-emerald-700">Adil RouterOS v4.0.0</footer>
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
};
