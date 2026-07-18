import type {RouterSnapshot} from '../types.js';import {moduleResult} from './types.js';
export const readDns=(s:RouterSnapshot|null)=>moduleResult('dns',s,{primary:s?.wan.dns?.[0]??null,secondary:s?.wan.dns?.[1]??null,ipv6Dns:null,localResolver:null,cache:null,responseTime:null,health:null},Array.isArray(s?.wan.dns)&&s!.wan.dns!.length>0,s?.wan.sourceEndpoint??null);
