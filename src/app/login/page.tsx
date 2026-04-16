'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

type Role = 'admin' | 'observer' | 'public';

const ROLE_CONFIG = {
  admin: {
    label: 'Administrator',
    icon: '🛡️',
    desc: 'Full access to manage election data',
    btnClass: 'bg-violet-600 hover:bg-violet-700',
    activeClass: 'border-violet-300 bg-violet-50 text-violet-700',
    hint: 'Contact administrator for credentials',
    redirect: '/admin',
  },
  observer: {
    label: 'Observer',
    icon: '👁️',
    desc: 'Submit results from your polling station',
    btnClass: 'bg-amber-500 hover:bg-amber-600',
    activeClass: 'border-amber-300 bg-amber-50 text-amber-700',
    hint: 'Contact administrator for credentials',
    redirect: '/observer',
  },
  public: {
    label: 'Public',
    icon: '🌐',
    desc: 'View live results and candidates',
    btnClass: 'bg-brand-600 hover:bg-brand-700',
    activeClass: 'border-brand-300 bg-brand-50 text-brand-700',
    hint: 'No credentials required',
    redirect: '/',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [role, setRole] = useState<Role>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const config = ROLE_CONFIG[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'public') {
      router.push('/');
      return;
    }

    if (!email) { setError('Email is required'); return; }

    setLoading(true);
    const ok = await login(email, password, role);
    if (ok) {
      router.push(config.redirect);
    } else {
      setError('Invalid credentials. Check the hint below.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(150deg, #052e16 0%, #064e3b 50%, #0a6640 100%)' }}>
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <span className="text-white font-black text-xs">GEN</span>
            </div>
            <span className="text-white font-extrabold text-lg">Global Election Network</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Transparent.<br />Accountable.<br /><span className="text-green-400">Live.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Real-time election monitoring for Gilgit-Baltistan and Azad Kashmir.
            Powered by verified observers across every constituency.
          </p>
        </div>
        <div className="space-y-3">
          {['🗳️ Live vote counting', '📡 Station-by-station reporting', '🔒 Verified observer network'].map(f => (
            <div key={f} className="flex items-center gap-3 text-white/60 text-sm">
              <span>{f}</span>
            </div>
          ))}
          <p className="text-white/25 text-xs pt-4 border-t border-white/10">
            © {new Date().getFullYear()} Global Election Network · GB &amp; AJK
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg mb-3"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <span className="text-white font-black text-sm">GEN</span>
            </div>
            <h1 className="text-2xl font-black text-white">Global Election Network</h1>
            <p className="text-white/60 text-sm mt-1">GB &amp; AJK Elections</p>
          </div>

          <div className="bg-white rounded-3xl shadow-hover p-7">
            <h3 className="text-xl font-black text-slate-900 mb-1">Sign In</h3>
            <p className="text-slate-400 text-sm mb-6">Choose your role to continue</p>

            {/* Role tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([key, cfg]) => (
                <button key={key} onClick={() => { setRole(key); setError(''); }}
                  className={`flex flex-col items-center justify-center gap-1.5 px-2 pt-3.5 pb-4 rounded-2xl border-2 text-center transition-all ${
                    role === key ? cfg.activeClass : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-slate-50'
                  }`}>
                  <span className="text-2xl leading-none">{cfg.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider leading-snug block w-full">{cfg.label}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 mb-4 text-center font-medium">{config.desc}</p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {role !== 'public' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com" className="input-field" autoComplete="email" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" className="input-field" autoComplete="current-password" />
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <span className="text-4xl">🌐</span>
                  <p className="text-sm text-slate-400 mt-2">No credentials needed</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2.5 rounded-xl">
                  ⚠ {error}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2">
                <span className="text-amber-500 shrink-0 mt-0.5">💡</span>
                <span className="text-xs text-amber-800 font-semibold">{config.hint}</span>
              </div>

              <button type="submit" disabled={loading}
                className={`w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-sm ${config.btnClass} disabled:opacity-60`}>
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  : role === 'public' ? 'Continue as Public Viewer →' : `Sign In as ${config.label} →`}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-white/30 mt-5">Secure · Transparent · Real-time</p>
        </div>
      </div>
    </div>
  );
}
