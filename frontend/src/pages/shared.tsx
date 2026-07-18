import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
export const useApi=<T,>(path:string)=>{const [data,setData]=useState<T|null>(null),[error,setError]=useState<string|null>(null),[loading,setLoading]=useState(true);const load=useCallback(async()=>{setLoading(true);try{setData((await axios.get<T>(path)).data);setError(null)}catch(e){setError(axios.isAxiosError(e)?e.response?.data?.reason??e.message:'Request failed')}finally{setLoading(false)}},[path]);useEffect(()=>{void load()},[load]);return{data,error,loading,reload:load}}
export const Page=({title,children}:{title:string;children:ReactNode})=><section className="space-y-4"><h2 className="text-2xl font-semibold text-emerald-200">{title}</h2>{children}</section>;
export const Card=({title,value,reason}:{title:string;value:ReactNode;reason?:string|null})=><div className="rounded-2xl border border-emerald-900/60 bg-[#07120d] p-4"><p className="text-xs text-emerald-600">{title}</p><div className="mt-2 text-emerald-100">{value??'غير متاح'}</div>{reason&&<p className="mt-2 text-xs text-amber-300">{reason}</p>}</div>;
export const State=({loading,error}:{loading:boolean;error:string|null})=>loading?<p>جارٍ تحميل البيانات الحية…</p>:error?<p className="text-rose-300">{error}</p>:null;
