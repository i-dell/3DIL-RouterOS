import type {RouterSnapshot} from '../types.js';
export const unsupported='Not supported by current firmware';
export interface NetworkModule<T>{module:string;supported:boolean;writeSupported:false;reason:string|null;sourceEndpoint:string|null;lastUpdated:string|null;data:T}
export const moduleResult=<T>(module:string,snapshot:RouterSnapshot|null,data:T,supported:boolean,sourceEndpoint:string|null):NetworkModule<T>=>({module,supported,writeSupported:false,reason:supported?null:unsupported,sourceEndpoint,lastUpdated:snapshot?.timestamp??null,data});
