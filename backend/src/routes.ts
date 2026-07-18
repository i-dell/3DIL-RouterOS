import { Router } from 'express';
import { PollingService } from './polling.js';
import { getRouterRuntimeConfig } from './config.js';
import type { Response } from 'express';

export const createRouterApi=(service:PollingService)=>{const router=Router(),config=getRouterRuntimeConfig(); const snapshot=(_req:unknown,res:Response)=>{const s=service.getSnapshot();if(!s)return res.status(503).json({supported:false,reason:'No verified router snapshot available'});res.json(s)};
 router.get('/api/v1/router/snapshot',snapshot);router.get('/api/router/snapshot',snapshot);
 for(const [path,key] of [['device-info','deviceInfo'],['health','health'],['wan','wan'],['wifi','wifi'],['devices','devices'],['security','security']] as const)router.get(`/api/v1/router/${path}`,(_q,res)=>{const s=service.getSnapshot();if(!s)return res.status(503).json({supported:false,reason:'No verified router snapshot available'});res.json(s[key])});
 router.post('/api/v1/router/auth',async(req,res)=>{const {username,password}=req.body as {username?:string,password?:string};if(!username||!password)return res.status(400).json({status:'failed',reason:'Username and password required'});try{await service.start(username,password);res.json({status:'connected',reason:null})}catch(e){const m=e instanceof Error?e.message:'Authentication failed';res.status(/protocol/i.test(m)?409:401).json({status:/protocol/i.test(m)?'protocol-mismatch':'failed',reason:m})}});
 router.post('/api/v1/router/refresh',async(_q,res)=>{try{res.json(await service.refresh())}catch(e){res.status(503).json({reason:e instanceof Error?e.message:'Refresh failed'})}});
 router.post('/api/v1/router/logout',(_q,res)=>{service.stop();res.json({status:'disconnected'})});
 router.get('/api/v1/router/diagnostics',(_q,res)=>res.json(service.getDiagnostics()));router.get('/api/v1/router/capabilities',(_q,res)=>res.json(service.getCapabilities()));
 router.get('/api/v1/router/config',(_q,res)=>res.json({routerAddress:config.baseUrl,pollingInterval:config.pollIntervalMs,backendVersion:'v2.0.0',sessionStatus:service.getDiagnostics().authenticationVerified?'verified':'not verified'}));
 router.get('/api/v1/router/logs',(_q,res)=>res.json([{timestamp:new Date().toISOString(),level:'info',message:'Safe event log active'}]));return router};
