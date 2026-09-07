import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function CloudProviders(){
  const [data,setData]=useState(null); const [error,setError]=useState('');
  useEffect(()=>{api.get('/cloud/providers').then(r=>setData(r.data.providers)).catch(e=>setError(e.response?.data?.message||e.message));},[]);
  return <div className="space-y-6"><div><div className="nexora-kicker">Cloud & Hybrid</div><h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Provider coverage</h1><p className="mt-1 text-sm text-slate-500">Unified connector capability map for cloud, Kubernetes and on-prem resources.</p></div>{error&&<div className="nexora-card p-4 text-sm text-red-500">{error}</div>}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(data||[]).map(p=><div key={p.id} className="nexora-card p-5"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900 dark:text-white">{p.name}</h2><span className="nexora-badge">{p.status}</span></div><div className="mt-4 flex flex-wrap gap-2">{p.services.map(s=><span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-white/[.05] dark:text-slate-300">{s}</span>)}</div></div>)}</div></div>;
}
