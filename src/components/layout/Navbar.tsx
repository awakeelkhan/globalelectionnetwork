'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

const NAV_LINKS = [
  { label: 'Dashboard',    href: '/' },
  { label: 'Candidates',   href: '/candidates' },
  { label: 'Live Results', href: '/results' },
  { label: 'About Us',     href: '/about' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout, isLive, activeElection } = useApp();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'linear-gradient(135deg, #052e16 0%, #064e3b 60%, #065f46 100%)' }}>
      {/* subtle dot texture */}
      <div className="absolute inset-0 bg-dot-pattern pointer-events-none opacity-40" />

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <span className="text-white font-black text-[11px] tracking-tighter">GEN</span>
            </div>
            <div className="leading-none hidden sm:block">
              <div className="text-white font-extrabold text-sm tracking-tight group-hover:text-green-200 transition-colors">
                Global Election Network
              </div>
              <div className="text-green-300/70 text-[10px] font-semibold uppercase tracking-widest mt-0.5">
                {activeElection.flagEmoji} {activeElection.region} · {activeElection.electionType}
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {isLive && (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-red-500/20 border border-red-400/40 px-3 py-1.5 rounded-full mr-3 backdrop-blur-sm">
                <span className="live-dot" style={{ width: 6, height: 6 }} />
                LIVE
              </span>
            )}
            {NAV_LINKS.map(l => {
              const isActive = pathname === l.href;
              return (
                <Link key={l.href} href={l.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-inner border border-white/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-300 to-emerald-500 flex items-center justify-center shadow-sm">
                    <span className="text-white text-[10px] font-black">{user.name[0]}</span>
                  </div>
                  <div className="leading-none">
                    <div className="text-white text-xs font-bold">{user.name}</div>
                    <div className="text-green-300/70 text-[10px] capitalize">{user.role}</div>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <Link href="/admin"
                    className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-violet-500/25 border border-violet-400/40 px-3 py-2 rounded-lg hover:bg-violet-500/35 transition-colors">
                    ⚙ Admin
                  </Link>
                )}
                {user.role === 'observer' && (
                  <Link href="/observer"
                    className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500/20 border border-amber-400/40 px-3 py-2 rounded-lg hover:bg-amber-500/30 transition-colors">
                    📋 Portal
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="text-white/50 hover:text-red-300 text-xs font-semibold transition-colors px-2 py-2">
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login"
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-white/15 border border-white/25 px-4 py-2 rounded-xl hover:bg-white/25 transition-all backdrop-blur-sm">
                Sign In →
              </Link>
            )}

            {/* Mobile burger */}
            <button onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-1"
              aria-label="Menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {open && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-0.5 animate-slide-up pb-4">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === l.href
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}>
                {l.label}
              </Link>
            ))}
            <div className="pt-1 border-t border-white/10 mt-2">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link href="/admin" onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-violet-300 hover:bg-white/10 rounded-xl">⚙ Admin Panel</Link>
                  )}
                  {user.role === 'observer' && (
                    <Link href="/observer" onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-amber-300 hover:bg-white/10 rounded-xl">📋 Observer Portal</Link>
                  )}
                  <button onClick={() => { handleLogout(); setOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-red-300 hover:bg-white/10 rounded-xl">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center px-4 py-3 text-sm font-bold text-green-300 hover:bg-white/10 rounded-xl">
                  Sign In →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Election context bar — hidden on mobile to avoid cramping */}
      <div className="relative border-t border-white/10 bg-black/20 hidden sm:block">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="text-white/70 font-black text-[11px] whitespace-nowrap shrink-0">
            {activeElection.flagEmoji} {activeElection.name}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
          <div className="flex items-center gap-3 text-[10px] text-white/40 font-semibold uppercase tracking-wider whitespace-nowrap flex-1">
            <span className="shrink-0">🌍 {activeElection.country}</span>
            <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
            <span className="shrink-0">📍 {activeElection.province}</span>
            <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
            <span className="shrink-0">🗓️ {activeElection.date}</span>
            <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
            <span className="shrink-0">🏛️ {activeElection.totalSeats} Seats</span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-wider shrink-0 px-2.5 py-1 rounded-full leading-none ${
            activeElection.status === 'live'     ? 'text-red-300 bg-red-500/20' :
            activeElection.status === 'upcoming' ? 'text-amber-300 bg-amber-500/20' :
            'text-slate-400 bg-slate-500/20'
          }`}>
            {activeElection.status === 'live' && <span className="live-dot mr-1" style={{ width: 5, height: 5, display: 'inline-block' }} />}
            {activeElection.status}
          </span>
        </div>
      </div>
      {/* Mobile election badge — single compact line */}
      <div className="sm:hidden border-t border-white/10 bg-black/20 px-4 py-1.5 flex items-center justify-between gap-2">
        <span className="text-white/60 text-[11px] font-bold truncate">
          {activeElection.flagEmoji} {activeElection.name}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-wider shrink-0 px-2 py-0.5 rounded-full leading-none ${
          activeElection.status === 'live'     ? 'text-red-300 bg-red-500/20' :
          activeElection.status === 'upcoming' ? 'text-amber-300 bg-amber-500/20' :
          'text-slate-400 bg-slate-500/20'
        }`}>{activeElection.status}</span>
      </div>
    </nav>
  );
}
