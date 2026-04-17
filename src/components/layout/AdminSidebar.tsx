'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

const LINKS = [
  { label: 'Dashboard',      href: '/admin',                 icon: '📊', exact: true },
  { label: 'Elections',      href: '/admin/elections',       icon: '🗳️' },
  { label: 'Candidates',     href: '/admin/candidates',      icon: '👤' },
  { label: 'Parties',        href: '/admin/parties',         icon: '🏛️' },
  { label: 'Constituencies', href: '/admin/constituencies',  icon: '🗺️' },
  { label: 'Observers',      href: '/admin/observers',       icon: '👁️' },
  { label: 'Results',        href: '/admin/results',         icon: '📋' },
  { label: 'Audit Logs',     href: '/admin/logs',            icon: '🔐' },
];

const CMS_LINKS = [
  { label: 'Posts / News', href: '/admin/posts',    icon: '✍️' },
  { label: 'Pages',        href: '/admin/pages',    icon: '📄' },
  { label: 'Settings',     href: '/admin/settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router  = useRouter();
  const { user, logout, activeElection } = useApp();

  const handleLogout = () => { logout(); router.push('/login'); };
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-56 shrink-0 flex flex-col min-h-screen"
      style={{ background: 'linear-gradient(180deg, #052e16 0%, #064e3b 60%, #065f46 100%)' }}>

      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            <span className="text-white font-black text-[10px]">GEN</span>
          </div>
          <div className="leading-none min-w-0">
            <div className="text-white font-extrabold text-sm group-hover:text-green-200 transition-colors">Admin Panel</div>
            <div className="text-green-400/60 text-[10px] font-semibold">Global Election Network</div>
          </div>
        </Link>
        {/* Active election chip */}
        <Link href="/admin/elections"
          className="flex items-center gap-2 bg-white/8 border border-white/12 rounded-xl px-2.5 py-2.5 hover:bg-white/15 transition-all">
          <span className="text-base leading-none shrink-0">{activeElection.flagEmoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-white/90 text-[10px] font-bold truncate leading-snug">{activeElection.name}</p>
            <p className="text-green-400/50 text-[9px] font-semibold truncate leading-snug mt-0.5">{activeElection.electionType} · {activeElection.status}</p>
          </div>
          <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${activeElection.status === 'live' ? 'bg-red-400 live-pulse' : activeElection.status === 'upcoming' ? 'bg-amber-400' : 'bg-slate-400'}`} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-green-400/50 uppercase tracking-widest px-2 mb-2">Management</p>
        {LINKS.map(l => {
          const active = isActive(l.href, l.exact);
          return (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              <span className="text-base leading-none">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}

        <p className="text-[10px] font-bold text-green-400/50 uppercase tracking-widest px-2 mt-5 mb-2">Content</p>
        {CMS_LINKS.map(l => {
          const active = isActive(l.href);
          return (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              <span className="text-base leading-none">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}

        <p className="text-[10px] font-bold text-green-400/50 uppercase tracking-widest px-2 mt-5 mb-2">Public View</p>
        <Link href="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <span>🌐</span> Dashboard
        </Link>
        <Link href="/results"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <span>📈</span> Live Results
        </Link>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 mb-2">
          <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-black text-xs text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4ade80, #16a34a)' }}>
            {user?.name?.[0] ?? 'A'}
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-bold truncate">{user?.name ?? 'Admin'}</div>
            <div className="text-green-400/50 text-[10px] truncate">{user?.email ?? 'admin@gen.pk'}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full text-xs font-semibold text-red-300/70 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-xl text-left transition-all">
          Sign Out →
        </button>
      </div>
    </aside>
  );
}
