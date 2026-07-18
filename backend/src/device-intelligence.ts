import {createHash} from 'node:crypto';
import type {DeviceSnapshot} from './types.js';

export const firmwareUnavailable='Not exposed by current firmware';
type OUIRecord={vendor:string;manufacturer:string};
export const ouiDatabase:Record<string,OUIRecord>={
 '0017F2':{vendor:'Apple',manufacturer:'Apple, Inc.'},'3C5A37':{vendor:'Samsung',manufacturer:'Samsung Electronics'},'485A3F':{vendor:'Huawei',manufacturer:'Huawei Technologies'},'F4F5D8':{vendor:'Google',manufacturer:'Google, Inc.'},'B827EB':{vendor:'Raspberry Pi',manufacturer:'Raspberry Pi Foundation'},'F0D5BF':{vendor:'Intel',manufacturer:'Intel Corporate'},'001E4F':{vendor:'Dell',manufacturer:'Dell Inc.'},'3C52A1':{vendor:'HP',manufacturer:'HP Inc.'},'98FA9B':{vendor:'Lenovo',manufacturer:'Lenovo Mobile'},'001A11':{vendor:'Google',manufacturer:'Google, Inc.'},'001D0F':{vendor:'TP-Link',manufacturer:'TP-Link Technologies'},'001B54':{vendor:'Cisco',manufacturer:'Cisco Systems'},'000C42':{vendor:'MikroTik',manufacturer:'MikroTik'},'FCFBFB':{vendor:'Cisco Meraki',manufacturer:'Cisco Meraki'},'24A43C':{vendor:'Ubiquiti',manufacturer:'Ubiquiti Inc.'},'286C07':{vendor:'Xiaomi',manufacturer:'Xiaomi Communications'},'F0272D':{vendor:'Amazon',manufacturer:'Amazon Technologies'},'0014A5':{vendor:'Gemtek',manufacturer:'Gemtek Technology'}
};
const normalizeMac=(value:string|null)=>value?.toUpperCase().replace(/[^0-9A-F]/g,'')??null;
export const lookupOui=(mac:string|null)=>{const normalized=normalizeMac(mac);if(!normalized||normalized.length<6)return null;const oui=normalized.slice(0,6);return{oui,record:ouiDatabase[oui]??null}};
const has=(text:string,terms:string[])=>terms.some(term=>text.includes(term));
export const classifyDevice=(device:DeviceSnapshot)=>{const text=`${device.hostname??''} ${device.alias??''}`.toLowerCase();const oui=lookupOui(device.mac);let type='Unknown',os:string|null=null,vendor=oui?.record?.vendor??null,manufacturer=oui?.record?.manufacturer??null,model:string|null=null,evidence:string[]=[];
 if(oui?.record)evidence.push(`OUI ${oui.oui}`);
 if(has(text,['iphone'])){type='iPhone';os='iOS';vendor='Apple';manufacturer='Apple, Inc.';evidence.push('DHCP hostname')}
 else if(has(text,['ipad'])){type='iPad';os='iPadOS';vendor='Apple';manufacturer='Apple, Inc.';evidence.push('DHCP hostname')}
 else if(has(text,['macbook','imac','mac-mini'])){type='Mac';os='macOS';vendor='Apple';manufacturer='Apple, Inc.';evidence.push('DHCP hostname')}
 else if(has(text,['android','galaxy','pixel'])){type='Android';os='Android';evidence.push('DHCP hostname')}
 else if(has(text,['windows','desktop-','laptop-','pc-'])){type='Windows PC';os='Windows';evidence.push('DHCP hostname')}
 else if(has(text,['ubuntu','linux','debian'])){type='Linux';os='Linux';evidence.push('DHCP hostname')}
 else if(has(text,['playstation','ps4','ps5'])){type='PlayStation';vendor='Sony';manufacturer='Sony Interactive Entertainment';evidence.push('DHCP hostname')}
 else if(has(text,['xbox'])){type='Xbox';vendor='Microsoft';manufacturer='Microsoft Corporation';evidence.push('DHCP hostname')}
 else if(has(text,['nintendo','switch'])){type='Nintendo';vendor='Nintendo';manufacturer='Nintendo Co., Ltd.';evidence.push('DHCP hostname')}
 else if(has(text,['printer','canon','brother'])){type='Printer';evidence.push('DHCP hostname')}
 else if(has(text,['camera','ipc','nvr'])){type='IP Camera';evidence.push('DHCP hostname')}
 else if(has(text,['nas','synology','qnap'])){type='NAS';evidence.push('DHCP hostname')}
 else if(has(text,['tv','bravia','chromecast'])){type='Smart TV';evidence.push('DHCP hostname')}
 else if(has(text,['echo','homepod','speaker'])){type='Smart Speaker';evidence.push('DHCP hostname')}
 else if(has(text,['router','repeater','extender'])){type=has(text,['repeater','extender'])?'Repeater':'Router';evidence.push('DHCP hostname')}
 else if(vendor==='Apple'){type='Apple device'} else if(/wifi|ssid/i.test(device.connectionType??'')){type='IoT'}
 const candidate=(device.alias||device.hostname||'').trim();if(candidate&&/\b(?:iphone|ipad|galaxy|pixel|playstation|xbox)\b/i.test(candidate))model=candidate;
 return{vendor,manufacturer,oui:oui?.oui??null,model,type,operatingSystem:os,evidence,confidence:evidence.length?'evidence-based':'unknown'};
};
export interface DeviceMetadata{friendlyName:string|null;owner:string|null;location:string|null;notes:string|null;tags:string[];favorite:boolean;blocked:boolean;whitelisted:boolean}
export const enrichDevice=(device:DeviceSnapshot,metadata:DeviceMetadata,history:{firstSeen:string;lastSeen:string;onlineCount:number;offlineCount:number;longestSession:number|null;averageSession:number|null})=>{const identity=classifyDevice(device);const mac=normalizeMac(device.mac);return{uniqueId:createHash('sha256').update(mac??device.ipv4??`${device.hostname}:${history.firstSeen}`).digest('hex').slice(0,20),...device,...identity,...metadata,wireless:/wifi|ssid/i.test(device.connectionType??'')||device.wifiBand!=null,wired:!/wifi|ssid/i.test(device.connectionType??'')&&device.wifiBand==null,band:device.wifiBand,...history,rssi:device.signal,noise:null,snr:null,linkSpeed:null,txRate:null,rxRate:null,channel:null,bandwidth:null,connectedSince:device.connectionDuration==null?null:new Date(Date.now()-device.connectionDuration*1000).toISOString(),sessionDuration:device.connectionDuration,upload:null,download:null,totalUsage:null,packets:null,dhcpLease:null,staticIp:null,gateway:null,dns:null,authenticationState:null,geo:null,unsupportedReason:firmwareUnavailable};};
