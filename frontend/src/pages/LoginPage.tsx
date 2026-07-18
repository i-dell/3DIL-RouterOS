import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

type LoginStatus = 'idle' | 'loading' | 'success' | 'authentication-failed' | 'router-offline' | 'backend-offline' | 'session-expired';

type StatusTheme = {
  badge: string;
  title: string;
  description: string;
  accent: string;
  ring: string;
};

const statusStyles: Record<LoginStatus, StatusTheme> = {
  idle: {
    badge: 'Router Detected',
    title: 'Connect Securely',
    description: 'Use your router credentials to access the local console.',
    accent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    ring: 'from-emerald-500 to-emerald-700',
  },
  loading: {
    badge: 'Authenticating',
    title: 'Establishing Secure Session',
    description: 'The local agent is validating the router credentials.',
    accent: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    ring: 'from-amber-500 to-amber-700',
  },
  success: {
    badge: 'Connected',
    title: 'Secure Session Ready',
    description: 'The console is opening with live router insights.',
    accent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    ring: 'from-emerald-500 to-emerald-700',
  },
  'authentication-failed': {
    badge: 'Authentication Failed',
    title: 'Credentials Rejected',
    description: 'Verify the router username and password, then try again.',
    accent: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    ring: 'from-rose-500 to-rose-700',
  },
  'router-offline': {
    badge: 'Router Offline',
    title: 'Router Not Reachable',
    description: 'The router is not responding on the local network.',
    accent: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    ring: 'from-amber-500 to-amber-700',
  },
  'backend-offline': {
    badge: 'Backend Offline',
    title: 'Local Agent Unavailable',
    description: 'The local backend is currently unreachable.',
    accent: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
    ring: 'from-sky-500 to-sky-700',
  },
  'session-expired': {
    badge: 'Session Expired',
    title: 'Session Needs Refresh',
    description: 'Please reconnect to continue using the console.',
    accent: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
    ring: 'from-violet-500 to-violet-700',
  },
};

const statusIcon = (status: LoginStatus) => {
  if (status === 'loading') {
    return (
      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="12 8" />
      </svg>
    );
  }

  if (status === 'success') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 12.5 10.5 17 18 8" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === 'authentication-failed' || status === 'router-offline' || status === 'backend-offline' || status === 'session-expired') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v6m0 6v6m-9-9h6m6 0h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
};

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(false);
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [message, setMessage] = useState('Secure local access to the router console.');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const submittedUsername = String(formData.get('username') ?? '').trim();
    const submittedPassword = String(formData.get('password') ?? '');

    if (submittedUsername !== username) {
      setUsername(submittedUsername);
    }
    if (submittedPassword !== password) {
      setPassword(submittedPassword);
    }

    if (!submittedUsername || !submittedPassword) {
      setStatus('authentication-failed');
      setMessage('Router username and router password are required.');
      return;
    }

    setStatus('loading');
    setMessage('Authenticating with the router…');

    try {
      const response = await axios.post('/api/v1/router/auth', {
        username: submittedUsername,
        password: submittedPassword,
      });
      if (response.status === 200 || response.data?.status === 'connected') {
        setStatus('success');
        setMessage('Connection established. Opening the dashboard…');
        window.setTimeout(() => navigate('/dashboard'), 800);
        return;
      }

      setStatus('authentication-failed');
      setMessage(response.data?.reason ?? 'Authentication failed.');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const reason = error.response?.data?.reason ?? error.message;
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
          setStatus('backend-offline');
          setMessage('The local backend is currently unavailable.');
        } else if (/router|offline|unreachable|timeout/i.test(reason)) {
          setStatus('router-offline');
          setMessage('The router could not be reached on the local network.');
        } else if (/expired|session/i.test(reason)) {
          setStatus('session-expired');
          setMessage('The session has expired. Please reconnect.');
        } else {
          setStatus('authentication-failed');
          setMessage(String(reason));
        }
      } else {
        setStatus('backend-offline');
        setMessage('The local backend is currently unavailable.');
      }
    }
  };

  const currentState = statusStyles[status];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_45%),linear-gradient(135deg,_#030806_0%,_#06120d_100%)] px-4 py-10 text-[#e7f8ed]" dir="rtl">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[32px] border border-emerald-800/50 bg-[#07120d]/80 p-6 shadow-[0_18px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${currentState.accent}`}>
                <span className="h-2.5 w-2.5 rounded-full bg-current" />
                {currentState.badge}
              </div>

              <div className="space-y-3">
                <img src="/branding/logo-color.png" alt="Adil" className="h-24 w-64 object-contain object-left drop-shadow-lg" />
                <div>
                  <h1 className="text-3xl font-semibold text-[#f7fff8] sm:text-4xl">Adil RouterOS</h1>
                  <p className="mt-2 text-lg text-emerald-300">Local Network Console</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-emerald-900/70 bg-[#07130d]/70 p-5">
                <div className="flex items-center justify-between gap-4 text-sm text-[#93ad98]">
                  <span>Router Detected</span>
                  <span className="font-medium text-emerald-300">Huawei OptiXstar LG8245X6-10</span>
                </div>
                <div className="mt-4 grid gap-3 rounded-2xl border border-emerald-900/60 bg-[#08150e] p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#93ad98]">Address</span>
                    <span className="font-semibold text-[#f5fff7]">192.168.1.1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#93ad98]">Firmware</span>
                    <span className="font-semibold text-[#f5fff7]">V500R022C10SPC272</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#93ad98]">Status</span>
                    <span className="font-semibold text-emerald-300">Router Detected</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-[#93ad98]">
                <p>• Secure local gateway authentication</p>
                <p>• Premium enterprise console experience</p>
                <p>• No password storage in the browser</p>
              </div>
            </div>

            <motion.form
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              onSubmit={handleSubmit}
              className="rounded-[28px] border border-emerald-900/70 bg-[#06120d]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6"
            >
              <div className="space-y-1">
                <p className="text-sm text-emerald-500">Router Access</p>
                <h2 className="text-2xl font-semibold text-[#f7fff8]">{currentState.title}</h2>
                <p className="text-sm text-[#93ad98]">{currentState.description}</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="block">
                  <label htmlFor="router-username" className="mb-2 block text-sm text-[#8ca78f]">
                    Router Username
                  </label>
                  <input
                    id="router-username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-2xl border border-emerald-800/50 bg-[#07120d] px-4 py-3 text-sm text-[#f7fff8] outline-none transition focus:border-emerald-500"
                    autoComplete="username"
                    placeholder="Router username"
                    spellCheck={false}
                    autoCapitalize="none"
                    dir="ltr"
                  />
                </div>

                <div className="block">
                  <label htmlFor="router-password" className="mb-2 block text-sm text-[#8ca78f]">
                    Router Password
                  </label>
                  <div className="flex items-center rounded-2xl border border-emerald-800/50 bg-[#07120d] px-4 py-3">
                    <input
                      id="router-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-transparent text-sm text-[#f7fff8] outline-none"
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="ml-3 text-sm text-emerald-300 transition hover:text-emerald-200">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-[#8ca78f]">
                  <input type="checkbox" checked={rememberUsername} onChange={() => setRememberUsername((value) => !value)} className="rounded border-emerald-700 bg-transparent" />
                  Remember Username
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={status === 'loading'}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: status === 'loading' ? 1 : 1.01 }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-4 py-3 font-semibold text-black shadow-lg shadow-emerald-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
                  {statusIcon(status)}
                </span>
                <span>{status === 'loading' ? 'Authenticating…' : 'Connect Securely'}</span>
              </motion.button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${status === 'authentication-failed' || status === 'router-offline' || status === 'backend-offline' || status === 'session-expired' ? 'border-rose-900/50 bg-rose-950/30 text-rose-100' : 'border-emerald-900/60 bg-[#08140d] text-[#97aa95]'}`}
                >
                  {message}
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 border-t border-emerald-900/70 pt-4 text-center text-xs text-[#7d9580]">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span>Huawei Driver</span>
                  <span>LG8245X6</span>
                  <span>Version</span>
                  <span>v2.0.0</span>
                </div>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
