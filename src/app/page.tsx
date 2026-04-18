'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PartyBarChart from '@/components/charts/PartyBarChart';
import VotePieChart from '@/components/charts/VotePieChart';
import TurnoutAreaChart from '@/components/charts/TurnoutAreaChart';
import { useApp } from '@/context/AppContext';
import { formatNumber, formatPercent, timeAgo, getPartyById } from '@/lib/utils';
import type { Candidate } from '@/types';

/* ── Hero Stat Card ─────────────────────────────────────── */
function HeroStat({ value, label, icon, accent }: { value: string; label: string; icon: string; accent?: string }) {
  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 min-w-[130px] backdrop-blur-sm hover:bg-white/15 transition-all">
      <div className="text-2xl mb-0.5">{icon}</div>
      <div className={`text-2xl sm:text-3xl font-black num tracking-tight leading-none ${accent ?? 'text-white'}`}>{value}</div>
      <div className="text-white/55 text-[11px] font-semibold uppercase tracking-wider mt-1.5">{label}</div>
    </div>
  );
}

/* ── Candidate Card (inline, premium) ───────────────────── */
function TopCandidateCard({ candidate, rank, totalVotes }: { candidate: Candidate; rank: number; totalVotes: number }) {
  const party = getPartyById(candidate.partyId);
  const pct   = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100) : 0;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className="card card-hover p-4 flex gap-3.5 group">
      {/* Rank badge */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        {medal ? (
          <span className="text-2xl leading-none">{medal}</span>
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border"
            style={{ background: party?.color + '18', color: party?.color, borderColor: party?.color + '40' }}>
            {rank}
          </div>
        )}
      </div>
      {/* Avatar */}
      {candidate.photoUrl ? (
        <img src={candidate.photoUrl} alt={candidate.name}
          className="w-11 h-11 rounded-xl object-cover shrink-0 border-2 border-white shadow-sm" />
      ) : (
        <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-sm shadow-sm"
          style={{ background: `linear-gradient(135deg, ${party?.color}, ${party?.color}cc)` }}>
          {candidate.initials}
        </div>
      )}
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <p className="font-extrabold text-slate-900 text-sm leading-tight truncate">{candidate.name}</p>
          {rank === 1 && <span className="badge badge-gold shrink-0">Leading</span>}
        </div>
        <p className="text-xs font-bold mt-0.5" style={{ color: party?.color }}>{party?.shortName}</p>
        <p className="text-[11px] text-slate-400">{candidate.profession}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-black text-slate-900 num">{formatNumber(candidate.votes)}</span>
          <span className="text-xs font-semibold text-slate-400">{pct.toFixed(1)}%</span>
        </div>
        <div className="progress-bar mt-1">
          <div className="progress-fill" style={{ width: `${Math.min(pct * 4, 100)}%`, background: party?.color }} />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { candidates, totalVotesCast, seatsDeclared, nationalTurnout, liveUpdates, activeElection, isLive } = useApp();
  const [parties, setParties] = React.useState<any[]>([]);
  const [constituencies, setConstituencies] = React.useState<any[]>([]);
  const [observers, setObservers] = React.useState<any[]>([]);
  const [regionalSummaries, setRegionalSummaries] = React.useState<any[]>([]);
  const [news, setNews] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (activeElection.id) {
      // Fetch parties
      fetch(`/api/parties?electionId=${activeElection.id}`)
        .then(r => r.json())
        .then(data => setParties(data.parties || []))
        .catch(() => {});

      // Fetch constituencies
      fetch(`/api/constituencies?electionId=${activeElection.id}`)
        .then(r => r.json())
        .then(data => setConstituencies(data.constituencies || []))
        .catch(() => {});

      // Fetch observers
      fetch(`/api/observers?electionId=${activeElection.id}`)
        .then(r => r.json())
        .then(data => setObservers(data.observers || []))
        .catch(() => {});
    }
    // Fetch latest news (not election-specific)
    fetch('/api/posts?status=published&limit=3')
      .then(r => r.json())
      .then(data => setNews(data.posts || []))
      .catch(() => {});
  }, [activeElection.id]);

  const topCandidates    = [...candidates].sort((a, b) => b.votes - a.votes).slice(0, 6);
  const totalPartiesVotes = candidates.reduce((s, c) => s + c.votes, 0);
  const reportedPct = constituencies.length > 0 
    ? ((constituencies.reduce((s: number, c: any) => s + (c.reported_stations || 0), 0) /
      constituencies.reduce((s: number, c: any) => s + (c.total_stations || 0), 0)) * 100).toFixed(1)
    : '0.0';
  const leadingParty = parties.sort((a, b) => b.seats - a.seats)[0];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #052e16 0%, #064e3b 45%, #0a6640 70%, #1a7a4a 100%)' }}>
        {/* Texture layers */}
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(5,46,22,0.4), transparent)' }} />
        {/* Glowing orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #4ade80, transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-12 sm:pt-14 sm:pb-16">
          {/* Live badge + meta */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border ${
              activeElection.status === 'live'
                ? 'bg-red-500/20 border-red-400/40'
                : activeElection.status === 'upcoming'
                ? 'bg-amber-500/20 border-amber-400/40'
                : 'bg-white/10 border-white/20'
            }`}>
              {activeElection.status === 'live' && <span className="live-dot" style={{ width: 7, height: 7 }} />}
              <span className="text-white text-[11px] font-black uppercase tracking-widest">
                {activeElection.status === 'live' ? 'Live Coverage' : activeElection.status === 'upcoming' ? 'Upcoming' : 'Completed'}
              </span>
            </div>
            <span className="text-white/40 text-xs hidden sm:block">{activeElection.date}</span>
            <span className="text-white/30 text-xs hidden sm:block">
              {activeElection.flagEmoji} {activeElection.country} · {activeElection.electionType} Election
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-title text-white mb-3 max-w-3xl">
            {activeElection.name}
          </h1>
          <p className="text-white/60 text-sm sm:text-base mb-8 max-w-xl leading-relaxed">
            {activeElection.description ||  'Real-time results and live monitoring across all constituencies.'}
            {activeElection.totalRegisteredVoters > 0 && (
              <> · <span className="text-green-300 font-semibold">{formatNumber(activeElection.totalRegisteredVoters)}</span> registered voters</>
            )}
          </p>

          {/* Stat cards — scrollable on mobile */}
          {isLive ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              <HeroStat icon="🗳️" value={formatNumber(totalVotesCast)} label="Votes Cast" accent="text-green-300" />
              <HeroStat icon="🏆" value={`${seatsDeclared}/${activeElection.totalSeats}`} label="Seats Declared" />
              <HeroStat icon="📈" value={`${nationalTurnout.toFixed(1)}%`} label="Voter Turnout" accent="text-yellow-300" />
              <HeroStat icon="📡" value={`${reportedPct}%`} label="Stations Rep." />
              <HeroStat icon="👁️" value={`${observers.length}`} label="Observers" />
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              <HeroStat icon="📅" value={activeElection.date} label="Election Date" accent="text-amber-300" />
              <HeroStat icon="👥" value={formatNumber(activeElection.totalRegisteredVoters)} label="Registered Voters" accent="text-blue-300" />
              <HeroStat icon="🏛️" value={`${activeElection.totalSeats}`} label="Total Seats" accent="text-purple-300" />
              <HeroStat icon="👁️" value={`${observers.length}`} label="Observers" />
            </div>
          )}

          {/* Leading party strip */}
          {leadingParty && (
            <div className="mt-6 inline-flex items-center gap-3 bg-white/8 border border-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: leadingParty.color }} />
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">Currently Leading</span>
              <span className="text-white font-black text-sm">{leadingParty.name}</span>
              <span className="badge badge-gold">{leadingParty.seats} seats</span>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ FEATURED NEWS ══════════════════ */}
      {news.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">Latest Updates</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">News & Announcements</h2>
            </div>
            <Link href="/news" className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors hidden sm:block flex items-center gap-1">View all →</Link>
          </div>
          
          {/* Featured news card (first item) */}
          {news[0] && (
            <Link href={`/news/${news[0].slug}`} className="group block mb-6">
              <div className="relative rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300">
                {news[0].featured_image_url && (
                  <div className="h-64 sm:h-80 overflow-hidden bg-slate-100">
                    <img src={news[0].featured_image_url} alt={news[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  {news[0].category && (
                    <span className="inline-block px-3 py-1 bg-green-500 text-white text-[11px] font-black uppercase tracking-widest rounded-full mb-3">{news[0].category}</span>
                  )}
                  <h3 className="text-white font-black text-xl sm:text-2xl leading-tight mb-2 group-hover:text-green-300 transition-colors line-clamp-2">{news[0].title}</h3>
                  {news[0].excerpt && (
                    <p className="text-white/80 text-sm leading-relaxed line-clamp-2 max-w-2xl mb-3">{news[0].excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-white/60 text-xs">
                    {news[0].author && <span className="font-semibold text-white/80">{news[0].author}</span>}
                    <span>·</span>
                    <span>{new Date(news[0].created_at).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Secondary news cards (grid) */}
          {news.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {news.slice(1).map((post: any) => (
                <Link key={post.id} href={`/news/${post.slug}`}
                  className="card card-hover overflow-hidden group flex flex-col">
                  {post.featured_image_url && (
                    <div className="h-40 overflow-hidden bg-slate-100 relative">
                      <img src={post.featured_image_url} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                      {post.category && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg">{post.category}</span>
                      )}
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-black text-slate-900 text-sm leading-snug mb-2 group-hover:text-green-700 transition-colors line-clamp-2">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-3">
                      {post.author && <span className="font-semibold">{post.author} · </span>}
                      {new Date(post.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-6 sm:hidden">
            <Link href="/news" className="text-sm font-semibold text-green-700">View all news →</Link>
          </div>
        </section>
      )}

      {/* ══════════════════ SEAT TRACKER ══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 -mt-4 relative z-10">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">🏛️ Seat Tracker</h2>
              <p className="text-xs text-slate-400 mt-0.5">{seatsDeclared} of {activeElection.totalSeats} declared</p>
            </div>
            <Link href="/results" className="btn-ghost text-xs">Full results →</Link>
          </div>
          {/* Stacked bar */}
          <div className="flex h-10 rounded-2xl overflow-hidden gap-[2px] shadow-inner bg-slate-100 mb-4">
            {parties.filter((p: any) => p.seats > 0).sort((a: any, b: any) => b.seats - a.seats).map((p: any) => {
              const w = (p.seats / activeElection.totalSeats) * 100;
              return (
                <div key={p.id} className="h-full flex items-center justify-center text-white text-[10px] font-black transition-all duration-700 first:rounded-l-2xl last:rounded-r-2xl"
                  style={{ width: `${w}%`, background: p.color }}
                  title={`${p.short_name}: ${p.seats}`}>
                  {w > 6 && p.seats}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {parties.filter((p: any) => p.seats > 0).sort((a: any, b: any) => b.seats - a.seats).map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded" style={{ background: p.color }} />
                <span className="font-bold text-slate-700">{p.short_name}</span>
                <span className="font-black text-slate-900 num">{p.seats}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TOP CANDIDATES ══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">🏅 Leading Candidates</h2>
            <p className="text-xs text-slate-400 mt-0.5">Top performers across all constituencies</p>
          </div>
          <Link href="/candidates"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
            View all <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          {topCandidates.map((c, i) => (
            <TopCandidateCard key={c.id} candidate={c} rank={i + 1} totalVotes={totalPartiesVotes} />
          ))}
        </div>
      </section>

      {/* ══════════════════ CHARTS ══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          <div className="lg:col-span-3 card p-5">
            <div className="mb-3">
              <h2 className="section-title text-base">📈 Voter Turnout Trend</h2>
              <p className="text-xs text-slate-400">Votes cast throughout election day</p>
            </div>
            <TurnoutAreaChart height={200} />
          </div>
          <div className="lg:col-span-2 card p-5">
            <div className="mb-2">
              <h2 className="section-title text-base">🗳️ Vote Share</h2>
              <p className="text-xs text-slate-400">Distribution by party</p>
            </div>
            <VotePieChart height={210} />
          </div>
        </div>
        <div className="card p-5">
          <h2 className="section-title text-base mb-4">📊 Seats Won by Party</h2>
          <PartyBarChart height={180} />
        </div>
      </section>

      {/* ══════════════════ REGIONAL + LIVE ══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Regional Breakdown */}
          <div className="card p-5">
            <h2 className="section-title mb-4">🗺️ Regional Breakdown</h2>
            <div className="space-y-5">
              {regionalSummaries.length > 0 ? regionalSummaries.map((r: any) => (
                <div key={r.provinceId}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{r.provinceName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{r.seatsDeclared}/{r.seatsTotal} seats · {formatNumber(r.totalVotes)} votes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black" style={{ color: r.leadingPartyColor }}>{r.leadingParty}</p>
                      <p className="text-xs text-slate-400">{formatPercent(r.turnout || 0)} turnout</p>
                    </div>
                  </div>
                  <div className="progress-bar h-2">
                    <div className="progress-fill" style={{ width: `${(r.seatsDeclared / r.seatsTotal) * 100}%`, background: r.leadingPartyColor }} />
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400">No regional data available</p>
              )}
            </div>
          </div>

          {/* Live Feed */}
          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <h2 className="section-title">Live Feed</h2>
              <span className="live-dot" />
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {liveUpdates.slice(0, 12).map(u => {
                const cfg: Record<string, { cls: string; icon: string }> = {
                  result:    { cls: 'border-blue-400 bg-blue-50',    icon: '📊' },
                  milestone: { cls: 'border-brand-500 bg-green-50',  icon: '🎯' },
                  alert:     { cls: 'border-red-400 bg-red-50',      icon: '⚠️' },
                  update:    { cls: 'border-slate-300 bg-slate-50',  icon: '🔄' },
                };
                const { cls, icon } = cfg[u.type] ?? cfg.update;
                return (
                  <div key={u.id} className={`flex gap-2.5 p-3 rounded-xl border-l-4 ${cls}`}>
                    <span className="text-base shrink-0 mt-0.5">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-800 font-medium leading-snug">{u.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">{timeAgo(u.timestamp)}</span>
                        {u.constituencyCode && (
                          <span className="font-mono text-[10px] bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{u.constituencyCode}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Organogram / Leadership Team ── */}
      <section className="py-14 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">Our Team</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-2">Leadership & Organogram</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">The dedicated team behind transparent and credible election monitoring across Pakistan.</p>
          </div>

          {/* Top — Naveed Ahmed */}
          <div className="flex justify-center mb-2">
            <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 w-64 text-center shadow-lg shadow-blue-200">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-black text-xl mx-auto mb-3">NA</div>
              <p className="text-white font-black">Naveed Ahmed</p>
              <p className="text-blue-200 text-xs font-semibold mt-0.5">Executive Director</p>
              <p className="text-blue-300/70 text-[10px] mt-0.5">Field Operations & Strategy</p>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-200"/>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center mb-1">
            <div className="relative" style={{width:'640px', maxWidth:'100%'}}>
              <div className="h-0.5 bg-slate-200 w-2/3 mx-auto"/>
              <div className="absolute left-1/6 -top-0 w-0.5 h-5 bg-slate-200"/>
              <div className="absolute left-1/2 -top-0 w-0.5 h-5 bg-slate-200 -translate-x-1/2"/>
              <div className="absolute right-1/6 -top-0 w-0.5 h-5 bg-slate-200"/>
            </div>
          </div>

          {/* Directors row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-3">
            {[
              { initials: 'AW', name: 'Abdul Wakeel',     role: 'Director Digital Transformation', color: 'from-green-500 to-emerald-700',  bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700' },
              { initials: 'AQ', name: 'Aliya Qaiser',     role: 'Director of Communications',      color: 'from-purple-500 to-purple-700',  bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
              { initials: 'NB', name: 'Naeem Ahmed Bajwa', role: 'Director of Research',            color: 'from-amber-500 to-amber-700',    bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700' },
            ].map(m => (
              <div key={m.name} className={`${m.bg} border ${m.border} rounded-2xl p-4 text-center hover:shadow-md transition-shadow`}>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-black text-sm mx-auto mb-2.5 shadow-sm`}>
                  {m.initials}
                </div>
                <p className="font-black text-slate-900 text-sm">{m.name}</p>
                <p className={`text-[11px] font-semibold mt-0.5 ${m.text}`}>{m.role}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
              Learn more about our team →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
