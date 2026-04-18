'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Plus, Check, AlertCircle, Eye, UserX, UserCheck, Trash2 } from 'lucide-react';

interface Observer {
  id: string; name: string; email: string; phone: string; cnic: string;
  polling_station_name: string; status: string; results_submitted: number;
  last_activity: string | null; joined_at: string; election_id: string;
  username: string | null; photo_url: string | null;
}

const EMPTY_FORM = { name: '', email: '', phone: '', cnic: '', pollingStationName: '', username: '', password: '', photoUrl: '' };

export default function AdminObserversPage() {
  const { activeElection } = useApp();
  const electionId = activeElection?.id ?? 'el-gb-2024';

  const [observers, setObservers]   = useState<Observer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<'all'|'active'|'inactive'|'pending'>('all');
  const [showInvite, setShowInvite] = useState(false);
  const [viewing, setViewing]       = useState<Observer | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{msg:string;ok:boolean}|null>(null);
  const [showPass, setShowPass]     = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/observers?electionId=${electionId}`);
      const data = await res.json();
      setObservers(data.observers ?? []);
    } finally { setLoading(false); }
  }, [electionId]);

  useEffect(() => { load(); }, [load]);

  const filtered = observers.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) ||
                        o.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const [createdCreds, setCreatedCreds] = useState<{name:string;email:string;password:string}|null>(null);

  const handleInvite = async () => {
    if (!form.name || !form.email) return showToast('Name and email are required', false);
    setSaving(true);
    try {
      const res = await fetch('/api/observers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, electionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreatedCreds({ name: form.name, email: form.email, password: data.passwordPlain });
      setShowInvite(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e: unknown) { showToast((e as Error).message, false); }
    finally { setSaving(false); }
  };

  const handleStatus = async (o: Observer, status: string) => {
    await fetch(`/api/observers/${o.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    showToast(`Observer marked as ${status}`);
    load();
    if (viewing?.id === o.id) setViewing({ ...o, status });
  };

  const handleDelete = async (o: Observer) => {
    if (!window.confirm(`Delete ${o.name}?`)) return;
    await fetch(`/api/observers/${o.id}`, { method: 'DELETE' });
    showToast('Observer removed');
    setViewing(null);
    load();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2 MB', false); return; }
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, photoUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const sBadge = (s: string) =>
    s === 'active' ? 'badge-forest' : s === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500';

  const timeAgoStr = (ts: string | null) => {
    if (!ts) return 'Never';
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.ok ? <Check size={15}/> : <AlertCircle size={15}/>} {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="page-title">👁️ Observers</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {observers.length} registered · {observers.filter(o=>o.status==='active').length} active
            </p>
          </div>
          <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2">
            <Plus size={15}/> Invite Observer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label:'Active',   count: observers.filter(o=>o.status==='active').length,   c:'bg-green-50 border-green-200 text-green-800' },
            { label:'Pending',  count: observers.filter(o=>o.status==='pending').length,  c:'bg-amber-50 border-amber-200 text-amber-800' },
            { label:'Inactive', count: observers.filter(o=>o.status==='inactive').length, c:'bg-slate-50 border-slate-200 text-slate-700' },
          ].map(s => (
            <div key={s.label} className={`card border p-3 text-center ${s.c}`}>
              <div className="text-2xl font-black">{s.count}</div>
              <div className="text-xs font-bold uppercase tracking-wide opacity-70">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input type="text" placeholder="Search observers…" value={search}
            onChange={e => setSearch(e.target.value)} className="input-field max-w-xs" />
          <div className="flex gap-1">
            {(['all','active','pending','inactive'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                  filter === f ? 'bg-green-50 text-green-700 border-green-200' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Observer</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Station</th>
                  <th className="text-right px-4 py-3">Submissions</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Last Active</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="px-4 py-3"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">No observers found</td></tr>
                ) : filtered.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {o.photo_url ? (
                          <img src={o.photo_url} alt={o.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200"/>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {o.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{o.name}</div>
                          <div className="text-xs text-slate-400">{o.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{o.polling_station_name || '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{o.results_submitted}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">{timeAgoStr(o.last_activity)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${sBadge(o.status)} capitalize`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setViewing(o)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all" title="View">
                          <Eye size={14}/>
                        </button>
                        {o.status !== 'active' ? (
                          <button onClick={() => handleStatus(o, 'active')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all" title="Activate">
                            <UserCheck size={14}/>
                          </button>
                        ) : (
                          <button onClick={() => handleStatus(o, 'inactive')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Deactivate">
                            <UserX size={14}/>
                          </button>
                        )}
                        <button onClick={() => handleDelete(o)}
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

        {/* Invite Modal */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-black text-slate-800 text-lg">Invite Observer</h2>
                <button onClick={() => { setShowInvite(false); setForm(EMPTY_FORM); }} className="text-slate-400 hover:text-slate-700">
                  <X size={20}/>
                </button>
              </div>
              <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

                {/* Photo */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Observer Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 overflow-hidden bg-slate-50 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}>
                      {form.photoUrl
                        ? <img src={form.photoUrl} alt="preview" className="w-full h-full object-cover"/>
                        : <span className="text-2xl">📷</span>}
                    </div>
                    <div className="flex-1 space-y-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors">
                        📁 Upload photo (max 2 MB)
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
                      <input type="url"
                        value={form.photoUrl.startsWith('data:') ? '' : form.photoUrl}
                        onChange={e => setForm(f => ({...f, photoUrl: e.target.value}))}
                        placeholder="…or paste image URL"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400"/>
                    </div>
                  </div>
                </div>

                {/* Basic info */}
                {[
                  { label: 'Full Name *',          key: 'name',               type: 'text',  placeholder: 'e.g. Ahmad Ali Shah' },
                  { label: 'Email *',              key: 'email',              type: 'email', placeholder: 'ahmad@example.com' },
                  { label: 'Phone',                key: 'phone',              type: 'tel',   placeholder: '0300-1234567' },
                  { label: 'CNIC',                 key: 'cnic',               type: 'text',  placeholder: '35202-1234567-1' },
                  { label: 'Polling Station Name', key: 'pollingStationName', type: 'text',  placeholder: 'Govt Boys High School…' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">{f.label}</label>
                    <input type={f.type} value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                  </div>
                ))}

                {/* Login credentials */}
                <div className="pt-1 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Login Credentials</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Username</label>
                      <input type="text" value={form.username}
                        onChange={e => setForm(p => ({...p, username: e.target.value}))}
                        placeholder="e.g. ahmad.shah"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
                      <div className="relative">
                        <input type={showPass ? 'text' : 'password'} value={form.password}
                          onChange={e => setForm(p => ({...p, password: e.target.value}))}
                          placeholder="Set a login password"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400 pr-16"/>
                        <button type="button" onClick={() => setShowPass(s => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700">
                          {showPass ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                <button onClick={() => { setShowInvite(false); setForm(EMPTY_FORM); }} className="btn-ghost text-sm">Cancel</button>
                <button onClick={handleInvite} disabled={saving || !form.name || !form.email}
                  className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                  {saving ? 'Saving…' : <><Check size={14}/> Send Invite</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Drawer */}
        {viewing && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
            <div className="bg-white h-full w-full max-w-sm shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-black text-slate-800">Observer Details</h2>
                <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-700">
                  <X size={20}/>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="flex items-center gap-4">
                  {viewing.photo_url ? (
                    <img src={viewing.photo_url} alt={viewing.name}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200"/>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-xl font-black shrink-0">
                      {viewing.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-black text-slate-900 text-lg">{viewing.name}</div>
                    {viewing.username && <div className="text-xs text-slate-400 font-mono">@{viewing.username}</div>}
                    <span className={`badge ${sBadge(viewing.status)} capitalize`}>{viewing.status}</span>
                  </div>
                </div>
                {[
                  ['Email',           viewing.email],
                  ['Username',        viewing.username || '—'],
                  ['Phone',           viewing.phone || '—'],
                  ['CNIC',            viewing.cnic || '—'],
                  ['Polling Station', viewing.polling_station_name || '—'],
                  ['Submissions',     String(viewing.results_submitted)],
                  ['Last Activity',   timeAgoStr(viewing.last_activity)],
                  ['Joined',          new Date(viewing.joined_at).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{k}</span>
                    <span className="text-sm font-semibold text-slate-700 text-right max-w-[60%] break-words">{v}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 space-y-2">
                {viewing.status !== 'active' ? (
                  <button onClick={() => handleStatus(viewing, 'active')}
                    className="w-full btn-primary text-sm flex items-center justify-center gap-2">
                    <UserCheck size={14}/> Activate Observer
                  </button>
                ) : (
                  <button onClick={() => handleStatus(viewing, 'inactive')}
                    className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 transition-all flex items-center justify-center gap-2">
                    <UserX size={14}/> Deactivate
                  </button>
                )}
                <button onClick={() => handleDelete(viewing)}
                  className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                  <Trash2 size={14}/> Remove Observer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Modal */}
        {createdCreds && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check size={20} className="text-green-600"/>
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Observer Invited!</h3>
                  <p className="text-xs text-slate-500">Credentials have been sent to their email</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-semibold text-slate-800">{createdCreds.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-semibold text-slate-800">{createdCreds.email}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Password</span>
                  <code className="font-mono text-xs bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-800">{createdCreds.password}</code>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4">⚠️ Save this password — it won&apos;t be shown again.</p>
              <button onClick={() => setCreatedCreds(null)} className="w-full btn-primary text-sm">Done</button>
            </div>
          </div>
        )}
    </div>
  );
}
