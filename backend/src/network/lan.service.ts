import type {RouterSnapshot} from '../types.js';import {moduleResult} from './types.js';
export const readLan=(s:RouterSnapshot|null,routerIp:string)=>moduleResult('lan',s,{routerIp,subnet:null,gateway:routerIp,dhcpStatus:null,connectedClients:s?.devices.items.filter(x=>x.online!==false).length??null,reservedIps:null,staticLeases:null,arpTable:null,ipv6Lan:null},s!=null,'/api/v1/router/config');
