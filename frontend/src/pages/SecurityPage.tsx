import {Card,Page,State,useApi} from './shared.js';
type S={supported:boolean;reason:string|null;firewall:boolean|null;macFilter:boolean|null;dmz:boolean|null;upnp:boolean|null};
export const SecurityPage=()=>{const q=useApi<S>('/api/v1/router/security');const data=q.data;return <Page title="الأمان"><State loading={q.loading} error={q.error}/>{data&&<div className="grid gap-4 md:grid-cols-2">{(['firewall','macFilter','dmz','upnp'] as const).map(k=><Card key={k} title={k} value={data[k]==null?'غير مدعوم':data[k]?'مفعّل':'متوقف'} reason={data[k]==null?data.reason:null}/>)}</div>}</Page>};
