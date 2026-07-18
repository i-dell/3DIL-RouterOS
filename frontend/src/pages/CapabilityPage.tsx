import {useMemo} from 'react';
import {Card,Empty,Page,State,useApi} from './shared.js';

export interface Capability {id:string;arabicName:string;englishName:string;category:string;state:string;readSupported:boolean;writeSupported:boolean;supportSource:string;sourceEndpoint:string|null;parserName:string|null;lastVerified:string|null;unsupportedReason:string|null;riskLevel:string;requiresConfirmation:boolean;requiresReauthentication:boolean}
export interface FeatureDefinition {id:string;path:string;arabic:string;english:string;category:'general'|'network'|'security'|'monitoring'|'system';description:string}
export const features:FeatureDefinition[]=[
 {id:'overview',path:'/overview',arabic:'نظرة عامة',english:'Overview',category:'general',description:'ملخص حالة منصة Adil RouterOS'},
 {id:'quick-setup',path:'/quick-setup',arabic:'الإعدادات السريعة',english:'Quick Setup',category:'general',description:'إرشادات آمنة للإعدادات المدعومة'},
 {id:'network-status',path:'/network-status',arabic:'حالة الشبكة',english:'Network Status',category:'network',description:'حالة الاتصال المباشرة'},
 {id:'guest-wifi',path:'/guest-wifi',arabic:'شبكة الضيوف',english:'Guest Network',category:'network',description:'إمكانات شبكة الضيوف'},
 {id:'lan',path:'/lan',arabic:'الشبكة المحلية',english:'LAN',category:'network',description:'عنونة الشبكة المحلية'},
 {id:'dhcp',path:'/dhcp',arabic:'خادم DHCP',english:'DHCP',category:'network',description:'حالة DHCP والحجوزات'},
 {id:'dns',path:'/dns',arabic:'نظام أسماء النطاقات',english:'DNS',category:'network',description:'خوادم DNS وأدوات الاستعلام'},
 {id:'nat',path:'/nat',arabic:'ترجمة العناوين',english:'NAT',category:'network',description:'إمكانات NAT التي يكشفها الراوتر'},
 {id:'port-mappings',path:'/port-forwarding',arabic:'تحويل المنافذ',english:'Port Forwarding',category:'network',description:'قواعد تحويل المنافذ'},
 {id:'firewall',path:'/firewall',arabic:'الجدار الناري',english:'Firewall',category:'security',description:'حالة الجدار الناري'},
 {id:'mac-filter',path:'/mac-filter',arabic:'تصفية MAC',english:'MAC Filtering',category:'security',description:'القائمة السوداء والبيضاء'},
 {id:'dmz',path:'/dmz',arabic:'المنطقة المعزولة',english:'DMZ',category:'security',description:'حالة مضيف DMZ'},
 {id:'upnp',path:'/upnp',arabic:'UPnP',english:'UPnP',category:'security',description:'حالة تعيين المنافذ التلقائي'},
 {id:'monitoring',path:'/monitoring',arabic:'المراقبة المباشرة',english:'Live Monitoring',category:'monitoring',description:'بيانات الراوتر المباشرة بدون قيم مصطنعة'},
 {id:'diagnostics',path:'/diagnostics',arabic:'التشخيص',english:'Diagnostics',category:'monitoring',description:'تشخيص الوكيل المحلي والراوتر'},
 {id:'backup',path:'/backup',arabic:'النسخ الاحتياطي',english:'Backup & Restore',category:'system',description:'إمكانات النسخ والاستعادة'},
 {id:'firmware',path:'/firmware',arabic:'البرنامج الثابت',english:'Firmware',category:'system',description:'معلومات البرنامج الثابت وإمكانات التحديث'},
 {id:'device-info',path:'/system',arabic:'النظام',english:'System',category:'system',description:'معلومات الراوتر والنظام'}
];
export const CapabilityPage=({feature}:{feature:FeatureDefinition})=>{const q=useApi<Capability[]>('/api/v1/router/capabilities');const capability=useMemo(()=>q.data?.find(x=>x.id===feature.id),[feature.id,q.data]);return <Page title={feature.arabic} description={feature.english}><State loading={q.loading} error={q.error}/>{capability?<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Card title="الحالة" value={capability.state}/><Card title="القراءة" value={capability.readSupported?'مدعومة':'Not supported by firmware'}/><Card title="التعديل" value={capability.writeSupported?'مدعوم':'Not supported by firmware'}/><Card title="مصدر التحقق" value={capability.supportSource}/><Card title="Endpoint" value={capability.sourceEndpoint??'Not supported by firmware'}/><Card title="آخر تحقق" value={capability.lastVerified?new Date(capability.lastVerified).toLocaleString('ar-SA'):'Not supported by firmware'}/></div>:!q.loading&&!q.error?<Empty>Not supported by firmware</Empty>:null}<div className="rounded-2xl border border-emerald-900/60 bg-[#07120d] p-5"><h3 className="font-semibold text-emerald-200">{feature.description}</h3><p className="mt-2 text-sm text-[#8fa999]">{capability?.unsupportedReason??'تعرض هذه الصفحة البيانات الحقيقية فقط. لا توجد قيم أو عمليات تجريبية.'}</p>{!capability?.writeSupported&&<button disabled title={capability?.unsupportedReason??'Not supported by firmware'} className="mt-4 rounded-xl border border-emerald-900 px-4 py-2 text-[#6f8275]">الإجراء غير متاح · Not supported by firmware</button>}</div></Page>};
