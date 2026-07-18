import { EventEmitter } from 'node:events';
import type { RouterSnapshot } from './types.js';
import { HuaweiDriver } from './drivers/huawei.js';
import { getRouterRuntimeConfig } from './config.js';

export class PollingService extends EventEmitter {
 private driver:HuaweiDriver; private config=getRouterRuntimeConfig(); private timer:ReturnType<typeof setTimeout>|null=null; private snapshot:RouterSnapshot|null=null; private polling=false; private running=false; private backoff=this.config.pollIntervalMs; private previous=new Set<string>(); private signature=''; private lastError:string|null=null;
 constructor(driver=new HuaweiDriver()){super();this.driver=driver}
 async start(username:string,password:string){if(this.running)this.stop();this.running=true;await this.driver.connect({username,password});await this.refresh();this.schedule(this.config.pollIntervalMs)}
 stop(){this.running=false;if(this.timer)clearTimeout(this.timer);this.timer=null;void this.driver.disconnect()}
 getSnapshot(){return this.snapshot}
 getDiagnostics(){const d=this.driver.getDiagnostics();return{backendState:this.running?'running':'idle',routerReachable:d.httpStatus!==null,authenticationVerified:d.authenticated,lastSuccessfulEndpoint:d.authenticated?d.endpoint:null,failedEndpoint:d.reason?d.endpoint:null,httpStatus:d.httpStatus,parserName:d.parserName,safeReason:d.reason??this.lastError,lastPollTime:d.lastPollTime,snapshotAge:this.snapshot?Date.now()-Date.parse(this.snapshot.timestamp):null}}
 getCapabilities(){const s=this.snapshot;return s?{deviceInfo:s.deviceInfo,health:s.health,wan:s.wan,wifi:{supported:s.wifi.supported,reason:s.wifi.reason,sourceEndpoint:s.wifi.sourceEndpoint},devices:{supported:s.devices.supported,reason:s.devices.reason,sourceEndpoint:s.devices.sourceEndpoint},security:s.security}: {reason:'No verified snapshot available'}}
 async refresh(){if(this.polling)return this.snapshot;this.polling=true;try{const next=await this.driver.getSnapshot();const nextSig=JSON.stringify({...next,timestamp:undefined});this.snapshot=next;this.lastError=null;this.backoff=this.config.pollIntervalMs;this.detectDevices(next);if(nextSig!==this.signature){this.signature=nextSig;this.emit('snapshot',next)}return next}catch(e){this.lastError=e instanceof Error?e.message:'Polling failed';if(this.snapshot)this.snapshot={...this.snapshot,stale:true};this.backoff=Math.min(this.backoff*2,60000);this.emit('error',e instanceof Error?e:new Error(this.lastError));throw e}finally{this.polling=false}}
 private schedule(ms:number){if(!this.running)return;this.timer=setTimeout(async()=>{try{await this.refresh()}catch{this.backoff=Math.max(this.backoff,this.config.pollIntervalMs)}this.schedule(this.backoff)},ms)}
 private detectDevices(s:RouterSnapshot){const ids=new Set(s.devices.items.map(d=>d.mac?.toUpperCase().replace(/[^0-9A-F]/g,'')).filter((x):x is string=>!!x));for(const x of ids)if(!this.previous.has(x))this.emit('deviceConnected',s,x);for(const x of this.previous)if(!ids.has(x))this.emit('deviceDisconnected',s,x);this.previous=ids}
}
