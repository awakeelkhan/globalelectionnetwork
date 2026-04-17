'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ELECTIONS } from '@/lib/mockData';
import type { Candidate, LiveUpdate, User, ElectionConfig } from '@/types';

interface AppState {
  candidates: Candidate[];
  totalVotesCast: number;
  seatsDeclared: number;
  nationalTurnout: number;
  liveUpdates: LiveUpdate[];
  user: User | null;
  isLive: boolean;
  likedCandidates: Set<string>;
  activeElection: ElectionConfig;
  allElections: ElectionConfig[];
  setActiveElection: (e: ElectionConfig) => void;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  toggleLike: (candidateId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

function dbRowToConfig(e: Record<string, unknown>): ElectionConfig {
  return {
    id: e.id as string,
    name: e.name as string,
    country: e.country as string,
    electionType: (e.election_type ?? e.electionType) as string,
    region: e.region as string,
    province: e.province as string,
    date: e.date as string,
    status: e.status as string,
    totalSeats: (e.total_seats ?? e.totalSeats ?? 0) as number,
    totalRegisteredVoters: (e.total_registered_voters ?? e.totalRegisteredVoters ?? 0) as number,
    description: e.description as string,
    flagEmoji: (e.flag_emoji ?? e.flagEmoji ?? '🗳️') as string,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotesCast, setTotalVotesCast] = useState(0);
  const [seatsDeclared, setSeatsDeclared] = useState(0);
  const [nationalTurnout, setNationalTurnout] = useState(0);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [likedCandidates, setLikedCandidates] = useState<Set<string>>(new Set());
  const [isLive, setIsLive] = useState(false);
  const [activeElection, setActiveElectionState] = useState<ElectionConfig>(ELECTIONS[0]);
  const [allElections, setAllElections] = useState<ElectionConfig[]>([]);

  // Restore user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gen_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  // Fetch candidates whenever activeElection changes
  const fetchCandidatesForElection = useCallback((electionId: string, status: string) => {
    fetch(`/api/candidates?electionId=${electionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.candidates) {
          setCandidates(data.candidates);
          const total = data.candidates.reduce((s: number, c: { votes: number }) => s + (c.votes || 0), 0);
          setTotalVotesCast(total);
          const withVotes = new Set(data.candidates.filter((c: { votes: number }) => c.votes > 0).map((c: { constituencyId: string }) => c.constituencyId));
          setSeatsDeclared(withVotes.size);
        }
      })
      .catch(() => {});

    if (status === 'live') {
      fetch(`/api/live-updates?electionId=${electionId}`)
        .then(r => r.json())
        .then(data => { if (data.updates) setLiveUpdates(data.updates); })
        .catch(() => {});
    }
  }, []);

  // Load all elections + restore selected from localStorage
  useEffect(() => {
    fetch('/api/elections')
      .then(r => r.json())
      .then(data => {
        if (data.elections?.length) {
          const configs = data.elections.map(dbRowToConfig);
          setAllElections(configs);

          // Try to restore previously selected election
          const savedId = localStorage.getItem('gen_election_id');
          const saved = savedId ? configs.find((c: ElectionConfig) => c.id === savedId) : null;

          // Fall back to active election
          const active = saved ?? configs.find((c: ElectionConfig) => c.status === 'live') ?? configs.find((c: ElectionConfig) => c.status === 'active') ?? configs[0];
          setActiveElectionState(active);
          setIsLive(active.status === 'live');
          fetchCandidatesForElection(active.id, active.status);
        }
      })
      .catch(() => {
        // fallback: try active endpoint
        fetch('/api/elections/active')
          .then(r => r.json())
          .then(data => {
            if (data.election) {
              const cfg = dbRowToConfig(data.election);
              setActiveElectionState(cfg);
              setIsLive(cfg.status === 'live');
              fetchCandidatesForElection(cfg.id, cfg.status);
            }
          })
          .catch(() => {});
      });
  }, [fetchCandidatesForElection]);

  const setActiveElection = useCallback((e: ElectionConfig) => {
    setActiveElectionState(e);
    setIsLive(e.status === 'live');
    localStorage.setItem('gen_election_id', e.id);
    fetchCandidatesForElection(e.id, e.status);
  }, [fetchCandidatesForElection]);

  const login = useCallback(async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('gen_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('gen_user');
  }, []);

  const toggleLike = useCallback((candidateId: string) => {
    setLikedCandidates(prev => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
        setCandidates(cs => cs.map(c => c.id === candidateId ? { ...c, likes: c.likes - 1 } : c));
      } else {
        next.add(candidateId);
        setCandidates(cs => cs.map(c => c.id === candidateId ? { ...c, likes: c.likes + 1 } : c));
      }
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      candidates, totalVotesCast, seatsDeclared, nationalTurnout,
      liveUpdates, user, isLive, likedCandidates,
      activeElection, allElections, setActiveElection,
      login, logout, toggleLike,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
