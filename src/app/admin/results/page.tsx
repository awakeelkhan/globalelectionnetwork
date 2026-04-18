'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Check, AlertCircle, Trash2, ShieldCheck, Flag, Plus, X, Trophy, Medal } from 'lucide-react';

interface Result {
  id: string; candidate_name: string; polling_station_name: string;
  votes: number; submitted_at: string; submitted_by: string;
  verified: boolean; flagged: boolean;
  party_color?: string; party_short?: string;
  is_winner?: boolean; is_runner_up?: boolean; district_name?: string;
}

interface CandidateEntry {
  candidateId: string;
  candidateName: string;
  partyId: string;
  votes: string;
}

const EMPTY_STATION = {
  districtName: '', pollingStationName: '', pollingStationNumber: '',
  totalCastVotes: '',
  date: new Date().toISOString().slice(0,10),
  time: new Date().toTimeString().slice(0,5),
};

export default function AdminResultsPage() {
  const { activeElection } = useApp();
  const electionId = activeElection?.id ?? 'el-gb-2024';

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'all'|'pending'|'verified'|'flagged'>('all');
  const [toast, setToast]     = useState<{msg:string;ok:boolean}|null>(null);
  const [acting, setActing]   = useState<string|null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [station, setStation]     = useState(EMPTY_STATION);
  const [entries, setEntries]     = useState<CandidateEntry[]>([{ candidateId: '', candidateName: '', partyId: '', votes: '' }]);
  const [saving, setSaving]       = useState(false);
  const [candidates, setCandidates] = useState<{id:string;name:string;partyId:string;party_short?:string}[]>([]);

  const showToast = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results?electionId=${electionId}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally { setLoading(false); }
  }, [electionId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (electionId) {
      fetch(`/api/candidates?electionId=${electionId}`).then(r => r.json()).then(d => setCandidates(d.candidates || [])).catch(() => {});
    }
  }, [electionId]);

  const resetForm = () => {
    setStation(EMPTY_STATION);
    setEntries([{ candidateId: '', candidateName: '', partyId: '', votes: '' }]);
  };

  const addEntry   = () => setEntries(p => [...p, { candidateId: '', candidateName: '', partyId: '', votes: '' }]);
  const removeEntry = (i: number) => setEntries(p => p.filter((_, idx) => idx !== i));
  const updateEntry = (i: number, field: keyof CandidateEntry, val: string) =>
    setEntries(p => p.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  const handleCandidateSelect = (i: number, cid: string) => {
    const c = candidates.find(c => c.id === cid);
    setEntries(p => p.map((e, idx) => idx === i
      ? { ...e, candidateId: cid, candidateName: c?.name || '', partyId: c?.partyId || '' }
      : e));
  };

  // Auto-determine winner/runner-up from votes
  const entriesWithRank = entries.map(e => ({ ...e, voteNum: parseInt(e.votes) || 0 }));
  const sorted = [...entriesWithRank].sort((a, b) => b.voteNum - a.voteNum);
  const winnerId   = sorted[0]?.candidateName || '';
  const runnerUpId = sorted[1]?.candidateName || '';

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const validEntries = entries.filter(e => e.candidateName && e.votes);
    if (!validEntries.length) return showToast('Add at least one candidate with votes', false);
    if (!station.pollingStationName) return showToast('Polling Station Name is required', false);
    setSaving(true);
    try {
      const submittedAt = new Date(`${station.date}T${station.time}`).toISOString();
      const stationLabel = `${station.pollingStationNumber ? station.pollingStationNumber + ' - ' : ''}${station.pollingStationName}`;

      // Insert one row per candidate
      await Promise.all(validEntries.map(entry =>
        fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            electionId,
            candidateId:      entry.candidateId || null,
            candidateName:    entry.candidateName,
            partyId:          entry.partyId || null,
            pollingStationName: stationLabel,
            districtName:     station.districtName || null,
            totalCastVotes:   parseInt(station.totalCastVotes) || null,
            votes:            parseInt(entry.votes),
            isWinner:         entry.candidateName === winnerId,
            isRunnerUp:       entry.candidateName === runnerUpId && entry.candidateName !== winnerId,
            submittedAt,
            submittedBy: 'admin',
          }),
        })
      ));

      showToast(`${validEntries.length} candidate result(s) saved!`);
      setShowForm(false);
      resetForm();
      load();
    } catch {
      showToast('Failed to save results — check console', false);
    } finally {
      setSaving(false);
    }
  };

  const filtered = results.filter(r => {
    if (filter === 'pending')  return !r.verified && !r.flagged;
    if (filter === 'verified') return r.verified;
    if (filter === 'flagged')  return r.flagged;
    return true;
  });

  const act = async (id: string, payload: object) => {
    setActing(id);
    await fetch(`/api/results/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await load();
    setActing(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this result entry?')) return;
    setActing(id);
    await fetch(`/api/results/${id}`, { method: 'DELETE' });
    showToast('Result entry removed');
    await load();
    setActing(null);
  };

  const fmt = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff/60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.ok ? <Check size={15}/> : <AlertCircle size={15}/>} {toast.msg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="page-title">📋 Result Submissions</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {results.length} entries ·{' '}
              <span className="text-green-600 font-semibold">{results.filter(r=>r.verified).length} verified</span> ·{' '}
              <span className="text-amber-600 font-semibold">{results.filter(r=>r.flagged).length} flagged</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              {(['all','pending','verified','flagged'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                    filter === f ? 'bg-sky-50 text-sky-700 border-sky-200' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}>{f}</button>
              ))}
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">
              <Plus size={14}/> Add Result
            </button>
          </div>
        </div>

        {/* Add Polling Station Result Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="font-black text-slate-800">Add Polling Station Result</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Enter votes for all candidates at this station</p>
                </div>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
              </div>
              <form onSubmit={handleAddResult} className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">

                {/* Station Info */}
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">📍 Polling Station Info</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">District Name</label>
                      <input type="text" value={station.districtName} onChange={e => setStation(p => ({ ...p, districtName: e.target.value }))}
                        placeholder="e.g. Gilgit District" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Total Cast Votes</label>
                      <input type="number" min="0" value={station.totalCastVotes} onChange={e => setStation(p => ({ ...p, totalCastVotes: e.target.value }))}
                        placeholder="e.g. 850" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Station Name *</label>
                      <input type="text" required value={station.pollingStationName} onChange={e => setStation(p => ({ ...p, pollingStationName: e.target.value }))}
                        placeholder="e.g. Govt Boys High School" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Station Number</label>
                      <input type="text" value={station.pollingStationNumber} onChange={e => setStation(p => ({ ...p, pollingStationNumber: e.target.value }))}
                        placeholder="e.g. PS-001" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Date *</label>
                      <input type="date" required value={station.date} onChange={e => setStation(p => ({ ...p, date: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Time *</label>
                      <input type="time" required value={station.time} onChange={e => setStation(p => ({ ...p, time: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                    </div>
                  </div>
                </div>

                {/* Candidate Entries */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">🗳️ Candidate Votes</p>
                    <button type="button" onClick={addEntry}
                      className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                      <Plus size={12}/> Add Candidate
                    </button>
                  </div>
                  <div className="space-y-2">
                    {entries.map((entry, i) => {
                      const voteNum = parseInt(entry.votes) || 0;
                      const isWinner   = entry.candidateName && entry.candidateName === winnerId && voteNum > 0;
                      const isRunnerUp = entry.candidateName && entry.candidateName === runnerUpId && entry.candidateName !== winnerId && voteNum > 0;
                      return (
                        <div key={i} className={`flex items-center gap-2 p-3 rounded-xl border ${isWinner ? 'border-amber-300 bg-amber-50' : isRunnerUp ? 'border-slate-300 bg-slate-50' : 'border-slate-200'}`}>
                          <div className="shrink-0 w-6 text-center">
                            {isWinner   ? <Trophy size={14} className="text-amber-500 mx-auto"/> :
                             isRunnerUp ? <Medal  size={14} className="text-slate-400 mx-auto"/> :
                             <span className="text-xs font-bold text-slate-300">{i+1}</span>}
                          </div>
                          <select value={entry.candidateId} onChange={e => handleCandidateSelect(i, e.target.value)}
                            className="flex-1 border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400 min-w-0">
                            <option value="">— Select or type below —</option>
                            {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <input type="text" value={entry.candidateName} onChange={e => updateEntry(i, 'candidateName', e.target.value)}
                            placeholder="Candidate name" className="flex-1 border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400 min-w-0"/>
                          <input type="number" min="0" value={entry.votes} onChange={e => updateEntry(i, 'votes', e.target.value)}
                            placeholder="Votes" className="w-24 shrink-0 border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                          {entries.length > 1 && (
                            <button type="button" onClick={() => removeEntry(i)} className="shrink-0 text-slate-300 hover:text-red-500 transition-colors">
                              <X size={14}/>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {sorted[0]?.voteNum > 0 && (
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
                      <span><Trophy size={11} className="inline text-amber-500 mr-1"/>Winner: <strong className="text-slate-700">{sorted[0]?.candidateName}</strong> ({sorted[0]?.voteNum.toLocaleString()} votes)</span>
                      {sorted[1]?.voteNum > 0 && <span><Medal size={11} className="inline text-slate-400 mr-1"/>Runner-up: <strong className="text-slate-700">{sorted[1]?.candidateName}</strong> ({sorted[1]?.voteNum.toLocaleString()} votes)</span>}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-ghost text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                    {saving ? 'Saving…' : <><Check size={14}/> Save Result</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Candidate</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Station</th>
                  <th className="text-right px-4 py-3">Votes</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Submitted</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="px-4 py-3"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">No results found</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${r.flagged ? 'bg-amber-50/40' : ''} ${acting === r.id ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.party_color && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.party_color }}/>}
                        <div>
                          <div className="font-semibold text-slate-900">{r.candidate_name}</div>
                          {r.party_short && <div className="text-xs font-semibold" style={{ color: r.party_color }}>{r.party_short}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{r.polling_station_name}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{r.votes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">{fmt(r.submitted_at)}</td>
                    <td className="px-4 py-3 text-center">
                      {r.flagged
                        ? <span className="badge bg-amber-100 text-amber-700">⚠ Flagged</span>
                        : r.verified
                          ? <span className="badge bg-green-100 text-green-700">✓ Verified</span>
                          : <span className="badge bg-slate-100 text-slate-500">Pending</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {!r.verified && (
                          <button onClick={() => act(r.id, { verified: true, flagged: false })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all" title="Verify">
                            <ShieldCheck size={14}/>
                          </button>
                        )}
                        {!r.flagged && (
                          <button onClick={() => act(r.id, { flagged: true, verified: false })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Flag">
                            <Flag size={14}/>
                          </button>
                        )}
                        {r.flagged && (
                          <button onClick={() => act(r.id, { flagged: false })}
                            className="text-xs font-semibold text-sky-600 hover:bg-sky-50 px-2 py-1 rounded-lg transition-colors" title="Clear flag">
                            Clear
                          </button>
                        )}
                        <button onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
