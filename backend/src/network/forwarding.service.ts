import type {RouterSnapshot} from '../types.js';import {moduleResult} from './types.js';
export const readForwarding=(s:RouterSnapshot|null)=>moduleResult('port-forwarding',s,{rules:null},false,null);
