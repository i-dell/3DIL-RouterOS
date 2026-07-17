import { useEffect, useState } from 'react';
import axios from 'axios';
import type { RouterHealth, RouterVersionInfo, RouterStatus } from '@3dil-routeros/shared';

const App = () => {
  const [health, setHealth] = useState<RouterHealth | null>(null);
  const [version, setVersion] = useState<RouterVersionInfo | null>(null);
  const [status, setStatus] = useState<RouterStatus | null>(null);

  useEffect(() => {
    const load = async () => {
      const [healthResponse, versionResponse, statusResponse] = await Promise.all([
        axios.get<RouterHealth>('/api/health'),
        axios.get<RouterVersionInfo>('/api/version'),
        axios.get<RouterStatus>('/api/status'),
      ]);
      setHealth(healthResponse.data);
      setVersion(versionResponse.data);
      setStatus(statusResponse.data);
    };

    void load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">3DIL RouterOS</p>
            <h1 className="mt-2 text-3xl font-semibold">Huawei OptiXstar LG8245X6-10</h1>
          </div>
          <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            v2.0.0-alpha.1
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">Health</p>
            <p className="mt-2 text-xl font-semibold">{health?.status ?? 'loading'}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">Signal</p>
            <p className="mt-2 text-xl font-semibold">{status?.signal ?? 0}%</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">Uptime</p>
            <p className="mt-2 text-xl font-semibold">{status?.uptimeSeconds ?? 0}s</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/60 p-6">
          <h2 className="text-lg font-semibold">Device Overview</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-400">Model</dt>
              <dd className="mt-1 text-lg">{version?.model ?? 'LG8245X6'}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">Firmware</dt>
              <dd className="mt-1 text-lg">{version?.version ?? 'v2.0.0-alpha.1'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default App;
