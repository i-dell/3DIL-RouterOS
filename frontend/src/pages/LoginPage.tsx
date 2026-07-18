import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

type LoginStatus = 'idle' | 'loading' | 'success' | 'authentication-failed' | 'router-offline' | 'backend-offline' | 'session-expired';

const statusStyles: Record<LoginStatus, { badge: string; title: string; description: string }> = {
  idle: {
    badge: 'Router Detected',
    title: 'Connect Securely',
    description: 'Use your router credentials to access the local console.',
  },
  loading: {
    badge: 'Connecting',
    title: 'Establishing Session',
    description: 'The local agent is validating the router connection.',
  },
  success: {
    badge: 'Connected',
    title: 'Secure Session Ready',
    description: 'The console is opening with live router insights.',
  },
  'authentication-failed': {
    badge: 'Authentication Failed',
    title: 'Login Credentials Invalid',
    description: 'Verify the router username and password, then try again.',
  },
  'router-offline': {
    badge: 'Router Offline',
    title: 'Router Not Reachable',
    description: 'The router is not responding on the local network.',
  },
  'backend-offline': {
    badge: 'Backend Offline',
    title: 'Local Agent Unavailable',
    description: 'The local backend is currently unreachable.',
  },
  'session-expired': {
    badge: 'Session Expired',
    title: 'Session Needs Refresh',
    description: 'Please reconnect to continue using the console.',
  },
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

    if (!username.trim() || !password.trim()) {
      setStatus('authentication-failed');
      setMessage('Router Username and Router Password are required.');
      return;
    }

    setStatus('loading');
    setMessage('Connecting to the local agent…');

    try {
      const response = await axios.post('/api/v1/router/auth', { username, password });
      if (response.status === 200 || response.data?.status === 'connected') {
        setStatus('success');
        setMessage('Connection established. Opening the dashboard…');
        window.setTimeout(() => navigate('/dashboard'), 700);
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
          setMessage('Authentication failed. Please verify the router credentials.');
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
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                {currentState.badge}
              </div>

              <div className="space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 text-2xl font-semibold text-black shadow-lg shadow-emerald-900/40">
                  3D
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-[#f7fff8] sm:text-4xl">3DIL RouterOS</h1>
                  <p className="mt-2 text-lg text-emerald-300">Local Network Console</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-emerald-900/70 bg-[#07130d]/70 p-5">
                <div className="flex items-center justify-between text-sm text-[#93ad98]">
                  <span>Router Detected</span>
                  <span className="text-emerald-300">Huawei OptiXstar LG8245X6-10</span>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-900/60 bg-[#08150e] px-4 py-3 text-sm">
                  <span className="text-[#93ad98]">Router Address</span>
                  <span className="font-semibold text-[#f5fff7]">192.168.1.1</span>
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
                <label className="block">
                  <span className="mb-2 block text-sm text-[#8ca78f]">Router Username</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-2xl border border-emerald-800/50 bg-[#07120d] px-4 py-3 text-sm text-[#f7fff8] outline-none ring-0 transition focus:border-emerald-500"
                    autoComplete="username"
                    placeholder="admin"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[#8ca78f]">Router Password</span>
                  <div className="flex items-center rounded-2xl border border-emerald-800/50 bg-[#07120d] px-4 py-3">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-transparent text-sm text-[#f7fff8] outline-none"
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="ml-3 text-sm text-emerald-300">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>

                <label className="flex items-center gap-2 text-sm text-[#8ca78f]">
                  <input type="checkbox" checked={rememberUsername} onChange={() => setRememberUsername((value) => !value)} className="rounded border-emerald-700 bg-transparent" />
                  Remember Username
                </label>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-4 py-3 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'loading' ? 'Connecting…' : 'Connect Securely'}
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 rounded-2xl border border-emerald-900/60 bg-[#08140d] px-4 py-3 text-sm text-[#97aa95]"
                >
                  {message}
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 border-t border-emerald-900/70 pt-4 text-center text-xs text-[#7d9580]">
                <div className="flex items-center justify-center gap-4">
                  <span>Huawei Driver</span>
                  <span>LG8245X6</span>
                  <span>Version</span>
                  <span>v2.0.0-alpha.2</span>
                </div>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
