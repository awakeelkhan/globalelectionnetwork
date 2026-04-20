'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { OBSERVERS, POLLING_STATIONS, CANDIDATES, RESULT_ENTRIES } from '@/lib/mockData';
import { getPartyById, formatNumber, timeAgo } from '@/lib/utils';

export default function ObserverPage() {
  const { user, logout } = useApp();
  const router = useRouter();

  const observer = user?.observerId ? OBSERVERS.find(o => o.id === user.observerId) : OBSERVERS[0];
  const station = observer ? POLLING_STATIONS.find(s => s.id === observer.pollingStationId) : null;
  const myCandidates = CANDIDATES.filter(c => station && c.constituencyId === station.constituencyId);
  const mySubmissions = RESULT_ENTRIES.filter(r => station && r.pollingStationId === station.id);

  const [tab, setTab] = useState<'dashboard' | 'submit'>('dashboard');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    districtName: '',
    pollingStationName: '',
    pollingStationNumber: '',
    totalCastVotes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user || user.role !== 'observer') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(150deg, #052e16 0%, #064e3b 60%, #0a6640 100%)' }}>
        <div className="text-center bg-white rounded-3xl shadow-hover p-10 max-w-sm w-full">
          <div className="text-5xl mb-4">👁️</div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Observer Access Required</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in with your observer credentials to access this portal.</p>
          <Link href="/login" className="btn-primary w-full justify-center">Sign In as Observer →</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mandatory fields
    const newErrors: Record<string, string> = {};
    
    if (!formData.districtName.trim()) {
      newErrors.districtName = 'District/Constituency Name is required';
    }
    if (!formData.pollingStationName.trim()) {
      newErrors.pollingStationName = 'Polling Station Name is required';
    }
    if (!formData.pollingStationNumber.trim()) {
      newErrors.pollingStationNumber = 'Polling Station Number is required';
    }
    if (!formData.totalCastVotes.trim()) {
      newErrors.totalCastVotes = 'Total Cast Votes is required';
    }
    
    // Check if at least one candidate has votes
    const hasVotes = Object.values(votes).some(v => v && parseInt(v) > 0);
    if (!hasVotes) {
      newErrors.votes = 'At least one candidate must have votes';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setVotes({});
    setFormData({
      districtName: '',
      pollingStationName: '',
      pollingStationNumber: '',
      totalCastVotes: ''
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{ background: 'linear-gradient(135deg, #052e16, #064e3b)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <span className="text-white font-black text-sm">👁️</span>
            </div>
            <div>
              <div className="text-white font-extrabold text-sm">Observer Portal</div>
              <div className="text-amber-300/70 text-[10px] font-semibold">Global Election Network · GB &amp; AJK</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors font-semibold">← Public View</Link>
            <button onClick={() => { logout(); router.push('/login'); }}
              className="text-xs text-red-300/70 hover:text-red-300 font-semibold transition-colors">Sign Out</button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Observer profile card */}
        <div className="card p-5 mb-5" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shrink-0"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              {observer?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-slate-900">{observer?.name}</h1>
              <p className="text-slate-400 text-sm">{observer?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="badge badge-amber">ID: {observer?.id}</span>
                <span className={`badge ${observer?.status === 'active' ? 'badge-emerald' : 'badge-slate'}`}>{observer?.status}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-black num" style={{ color: '#f59e0b' }}>{observer?.resultsSubmitted}</div>
              <div className="text-slate-400 text-xs font-semibold mt-0.5">Results Submitted</div>
            </div>
          </div>
        </div>

        {/* Station info */}
        {station && (
          <div className="card p-5 mb-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Polling Station</p>
            <div className="flex flex-wrap gap-4 justify-between">
              <div>
                <p className="font-extrabold text-slate-900 text-base">{station.name}</p>
                <p className="text-slate-400 text-sm mt-0.5">{station.address}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Registered Voters</p>
                <p className="text-xl font-black text-slate-900 num">{formatNumber(station.registeredVoters)}</p>
                {station.reported && <p className="text-xs font-bold text-brand-600 mt-1">✓ Reported</p>}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-200">
          {(['dashboard', 'submit'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-bold capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? 'text-amber-600 border-amber-500' : 'text-slate-400 border-transparent hover:text-slate-700'
              }`}>
              {t === 'dashboard' ? '📊 My Dashboard' : '📝 Submit Results'}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Submitted', value: observer?.resultsSubmitted ?? 0, cls: 'text-brand-700', bg: 'bg-green-50 border-green-200' },
                { label: 'Verified',  value: mySubmissions.filter(r => r.verified).length, cls: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
                { label: 'Flagged',   value: mySubmissions.filter(r => r.flagged).length,  cls: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
              ].map(s => (
                <div key={s.label} className={`card border p-4 text-center ${s.bg}`}>
                  <div className={`text-2xl font-black num ${s.cls}`}>{s.value}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="section-title text-base">Candidates in Constituency</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {[...myCandidates].sort((a, b) => b.votes - a.votes).map((c, i) => {
                  const party = getPartyById(c.partyId);
                  const total = myCandidates.reduce((s, x) => s + x.votes, 0);
                  const pct = total ? ((c.votes / total) * 100).toFixed(1) : '0';
                  return (
                    <div key={c.id} className={`px-5 py-3.5 flex items-center gap-3.5 ${i === 0 ? 'bg-green-50/60' : 'hover:bg-slate-50'} transition-colors`}>
                      <span className="text-slate-400 text-xs font-black w-4 shrink-0">{i + 1}</span>
                      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: party?.color }}>{c.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm truncate">{c.name}</span>
                          {i === 0 && <span className="badge badge-emerald">Leading</span>}
                        </div>
                        <span className="text-xs font-bold" style={{ color: party?.color }}>{party?.shortName}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-slate-900 text-sm num">{formatNumber(c.votes)}</div>
                        <div className="text-xs font-semibold" style={{ color: party?.color }}>{pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {mySubmissions.length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="section-title text-base">My Submissions</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {mySubmissions.map(r => (
                    <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{r.candidateName}</p>
                        <p className="text-slate-400 text-xs">{timeAgo(r.submittedAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 num">{r.votes}</span>
                        {r.flagged ? <span className="badge badge-amber">⚠ Flagged</span>
                          : r.verified ? <span className="badge badge-emerald">✓ Verified</span>
                          : <span className="badge badge-slate">Pending</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SUBMIT ── */}
        {tab === 'submit' && (
          <div>
            {submitted && (
              <div className="mb-5 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 font-semibold text-sm flex items-center gap-2">
                ✓ Results submitted successfully! They are pending verification.
              </div>
            )}
            {errors.votes && (
              <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 font-semibold text-sm flex items-center gap-2">
                ⚠ {errors.votes}
              </div>
            )}
            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
              <div className="mb-2">
                <h2 className="section-title">Submit Poll Results</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Station: <span className="font-bold text-slate-700">{station?.name ?? 'Unknown'}</span>
                </p>
              </div>

              {/* Mandatory Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    District/Constituency Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.districtName}
                    onChange={e => setFormData(f => ({ ...f, districtName: e.target.value }))}
                    placeholder="Enter district/constituency name"
                    className={`w-full input-field ${errors.districtName ? 'border-red-300' : ''}`}
                  />
                  {errors.districtName && <p className="text-xs text-red-500 mt-1">{errors.districtName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    Polling Station Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pollingStationName}
                    onChange={e => setFormData(f => ({ ...f, pollingStationName: e.target.value }))}
                    placeholder="Enter polling station name"
                    className={`w-full input-field ${errors.pollingStationName ? 'border-red-300' : ''}`}
                  />
                  {errors.pollingStationName && <p className="text-xs text-red-500 mt-1">{errors.pollingStationName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    Polling Station Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pollingStationNumber}
                    onChange={e => setFormData(f => ({ ...f, pollingStationNumber: e.target.value }))}
                    placeholder="Enter station number"
                    className={`w-full input-field ${errors.pollingStationNumber ? 'border-red-300' : ''}`}
                  />
                  {errors.pollingStationNumber && <p className="text-xs text-red-500 mt-1">{errors.pollingStationNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    Total Cast Votes <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalCastVotes}
                    onChange={e => setFormData(f => ({ ...f, totalCastVotes: e.target.value }))}
                    placeholder="Enter total cast votes"
                    className={`w-full input-field ${errors.totalCastVotes ? 'border-red-300' : ''}`}
                  />
                  {errors.totalCastVotes && <p className="text-xs text-red-500 mt-1">{errors.totalCastVotes}</p>}
                </div>
              </div>

              {/* Candidate Votes */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3">
                  Candidate Votes <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {myCandidates.slice(0, 8).map(c => {
                    const party = getPartyById(c.partyId);
                    return (
                      <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: party?.color }}>{c.initials}</div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                          <p className="text-xs font-bold" style={{ color: party?.color }}>{party?.shortName}</p>
                        </div>
                        <input
                          type="number" min="0"
                          value={votes[c.id] ?? ''}
                          onChange={e => setVotes(v => ({ ...v, [c.id]: e.target.value }))}
                          placeholder="Votes"
                          className="w-28 input-field text-right"
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-2">Enter votes for each candidate. At least one candidate must have votes.</p>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-400 mb-4">By submitting, you confirm these results are accurate and from your assigned polling station.</p>
                <button type="submit" disabled={submitting}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all disabled:opacity-60 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : '📤 Submit Results'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
