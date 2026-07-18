import {NavLink,Outlet,useLocation,useNavigate} from 'react-router-dom';
import {useEffect,useState} from 'react';
import type {ReactNode} from 'react';
import axios from 'axios';
import {useApi} from '../pages/shared.js';
import type {Diagnostics} from '../pages/routerTypes.js';
import {MobileBottomNav} from '../components/navigation/MobileBottomNav.js';
import {iconPaths} from '../config/icons.js';
import type {IconName} from '../config/icons.js';
import {useLanguage} from '../i18n.js';

type NavItem={to:string;key:string;icon:IconName};
const groups:Array<{key:string;items:NavItem[]}>= [
 {key:'general',items:[{to:'/dashboard',key:'dashboard',icon:'dashboard'},{to:'/overview',key:'overview',icon:'overview'},{to:'/quick-setup',key:'quickSetup',icon:'setup'}]},
 {key:'network',items:[{to:'/devices',key:'devices',icon:'devices'},{to:'/wifi',key:'wifi',icon:'wifi'},{to:'/guest-wifi',key:'guest',icon:'guest'},{to:'/wan',key:'wan',icon:'wan'},{to:'/lan',key:'lan',icon:'lan'},{to:'/dhcp',key:'dhcp',icon:'dhcp'},{to:'/dns',key:'dns',icon:'dns'},{to:'/qos',key:'qos',icon:'monitoring'}]},
 {key:'security',items:[{to:'/security',key:'security',icon:'security'},{to:'/firewall',key:'firewall',icon:'firewall'},{to:'/mac-filtering',key:'filter',icon:'filter'},{to:'/blacklist',key:'blacklist',icon:'filter'},{to:'/parental-control',key:'parental',icon:'security'},{to:'/content-blocking',key:'content',icon:'filter'}]},
 {key:'monitor',items:[{to:'/monitoring',key:'monitoring',icon:'monitoring'},{to:'/traffic',key:'traffic',icon:'monitoring'},{to:'/alerts',key:'alerts',icon:'diagnostics'},{to:'/events',key:'events',icon:'logs'}]},
 {key:'diagnostics',items:[{to:'/diagnostics',key:'diagnostics',icon:'diagnostics'},{to:'/ping',key:'ping',icon:'network'},{to:'/dns-lookup',key:'lookup',icon:'dns'},{to:'/logs',key:'logs',icon:'logs'}]},
 {key:'system',items:[{to:'/advanced',key:'advanced',icon:'settings'},{to:'/backup',key:'backup',icon:'backup'},{to:'/reboot',key:'reboot',icon:'router'},{to:'/settings',key:'appearance',icon:'settings'},{to:'/about-device',key:'aboutDevice',icon:'router'},{to:'/about',key:'about',icon:'about'}]}
];
const allItems=groups.flatMap(group=>group.items);
const Icon=({name}: {name:IconName})=><svg aria-hidden="true" viewBox="0 0 24 24" className="nav-icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]}/></svg>;

export const DashboardLayout=({children}:{children?:ReactNode})=>{const {language,direction,setLanguage,t}=useLanguage();const [mobileOpen,setMobileOpen]=useState(false);const [collapsed,setCollapsed]=useState(()=>localStorage.getItem('adil.sidebar.collapsed')==='true');const [theme,setTheme]=useState(()=>localStorage.getItem('adil.theme')??'dark');const diagnostics=useApi<Diagnostics>('/api/v1/router/diagnostics');const location=useLocation();const navigate=useNavigate();const current=allItems.find(item=>item.to===location.pathname);
 useEffect(()=>localStorage.setItem('adil.sidebar.collapsed',String(collapsed)),[collapsed]);useEffect(()=>{localStorage.setItem('adil.theme',theme);document.documentElement.dataset.theme=theme},[theme]);useEffect(()=>{document.body.classList.toggle('drawer-open',mobileOpen);const close=(event:KeyboardEvent)=>event.key==='Escape'&&setMobileOpen(false);addEventListener('keydown',close);return()=>{document.body.classList.remove('drawer-open');removeEventListener('keydown',close)}},[mobileOpen]);
 const logout=async()=>{await axios.post('/api/v1/router/logout');navigate('/login')};
 return <div className={`app-shell ${collapsed?'is-collapsed':''}`} dir={direction}>
  {mobileOpen&&<button aria-label={t('closeMenu')} onClick={()=>setMobileOpen(false)} className="drawer-backdrop"/>}
  <aside className={`app-sidebar ${mobileOpen?'is-open':''}`} aria-label={language==='ar'?'التنقل الرئيسي':'Primary navigation'}>
   <div className="brand-block"><img src={collapsed?'/branding/browser.png':'/branding/logo-white.png'} alt="Adil RouterOS"/><div className="brand-copy"><strong>Adil RouterOS</strong><span>{t('liveConsole')}</span></div></div>
   <button className="collapse-button" onClick={()=>setCollapsed(v=>!v)} aria-expanded={!collapsed} aria-label={collapsed?t('expand'):t('collapse')}><Icon name={collapsed?'overview':'network'}/><span>{collapsed?t('expand'):t('collapse')}</span></button>
   <nav className="sidebar-scroll">{groups.map(group=><section className="nav-group" key={group.key}><h2>{t(group.key)}</h2>{group.items.map(item=><NavLink key={item.to} to={item.to} title={collapsed?t(item.key):undefined} onClick={()=>setMobileOpen(false)} className={({isActive})=>`nav-item ${isActive?'is-active':''}`}><Icon name={item.icon}/><span className="nav-copy"><b>{t(item.key)}</b><small>{language==='ar'?t(item.key):item.key.replace(/([A-Z])/g,' $1')}</small></span></NavLink>)}</section>)}</nav>
   <div className="sidebar-footer"><div className="session-state"><span className={diagnostics.data?.authenticationVerified?'online':'warning'}/><span>{diagnostics.loading?t('loading'):diagnostics.data?.authenticationVerified?t('authenticated'):t('notAuthenticated')}</span></div><button onClick={()=>void logout()}>{t('logout')}</button></div>
  </aside>
  <section className="app-workspace">
   <header className="app-header"><div className="header-title"><button className="mobile-menu" onClick={()=>setMobileOpen(true)} aria-label={t('openMenu')}><Icon name="network"/></button><div><span className="eyebrow">Adil RouterOS · v4.0.0</span><h1>{current?t(current.key):'Adil RouterOS'}</h1></div></div><div className="header-actions"><button onClick={()=>setLanguage(language==='ar'?'en':'ar')} aria-label={t('language')} className="language-switch">{language==='ar'?'EN':'عربي'}</button><button onClick={()=>setTheme(v=>v==='dark'?'light':'dark')} aria-label={t('appearance')} className="icon-control"><Icon name="settings"/></button><span className={`connection-dot ${diagnostics.data?.authenticationVerified?'online':'warning'}`} title={diagnostics.data?.authenticationVerified?t('authenticated'):t('notAuthenticated')}/></div></header>
   <main className="main-scroll" id="main-content"><div className="page-container">{children??<Outlet/>}</div><footer>Adil RouterOS v4.0.0</footer></main><MobileBottomNav/>
  </section>
 </div>};
