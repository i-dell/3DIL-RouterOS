import type {RouterSnapshot} from '../types.js';import {moduleResult} from './types.js';
export const readDhcp=(s:RouterSnapshot|null)=>moduleResult('dhcp',s,{pool:null,leaseTime:null,reservations:null,usedAddresses:null,availableAddresses:null,history:null,conflicts:null},false,null);
