
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Cat, Branch, CatEvent, Collar, TeamPreset, Temperament, EventType, RelationshipKind, User } from './types';
import { INITIAL_BRANCHES, DEFAULT_COLLARS, STAT_DEFS } from './constants';

const STORAGE_KEY = 'mewgenics_plus_data';
const USERS_KEY = 'mewgenics_plus_users';

interface AppState {
  cats: Cat[];
  branches: Branch[];
  events: CatEvent[];
  teamPresets: TeamPreset[];
  collars: Collar[];
  user: User | null;
}

const useAppStateInternal = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Ensure tags exist if migrating from old flags
      parsed.cats = parsed.cats.map((c: any) => ({
        ...c,
        tags: c.tags || [
          ...(c.flags?.forBattle ? ['Боец'] : []),
          ...(c.flags?.forBreeding ? ['Племя'] : [])
        ]
      }));
      return parsed;
    }
    return {
      cats: [],
      branches: INITIAL_BRANCHES,
      events: [],
      teamPresets: [],
      collars: DEFAULT_COLLARS,
      user: null
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  const register = (email: string, password: string) => {
    if (users.find(u => u.email === email)) {
      throw new Error('Пользователь с таким email уже существует');
    }
    const newUser = { email, password };
    setUsers([...users, newUser]);
    setState(s => ({ ...s, user: { email } }));
  };

  const login = (email: string, password: string) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Неверный email или пароль');
    }
    setState(s => ({ ...s, user: { email } }));
  };

  const logout = () => setState(s => ({ ...s, user: null }));

  const addBranch = (name: string, color: string) => {
    const newBranch: Branch = { id: crypto.randomUUID(), name, color };
    setState(s => ({ ...s, branches: [...s.branches, newBranch] }));
  };

  const addCat = (catData: Omit<Cat, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    const newCat: Cat = {
      ...catData,
      id: crypto.randomUUID(),
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setState(s => ({ ...s, cats: [...s.cats, newCat] }));
    return newCat;
  };

  const updateCat = (id: string, updates: Partial<Cat>) => {
    setState(s => ({
      ...s,
      cats: s.cats.map(c => c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c)
    }));
  };

  const archiveCat = (id: string) => {
    setState(s => ({
      ...s,
      cats: s.cats.map(c => c.id === id ? { 
        ...c, 
        isArchived: true, 
        equippedCollarId: null, // Unequip collar when archived
        updatedAt: Date.now() 
      } : c)
    }));
  };

  const unarchiveCat = (id: string) => {
    setState(s => ({
      ...s,
      cats: s.cats.map(c => c.id === id ? { ...c, isArchived: false, updatedAt: Date.now() } : c)
    }));
  };

  const deleteCat = (id: string) => {
    setState(s => ({
      ...s,
      cats: s.cats.filter(c => c.id !== id),
      events: s.events.filter(e => e.catId !== id)
    }));
  };

  const addEvent = (eventData: Omit<CatEvent, 'id' | 'createdAt' | 'isActive'>) => {
    const newEvent: CatEvent = {
      ...eventData,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: Date.now()
    };
    setState(s => ({ ...s, events: [...s.events, newEvent] }));
  };

  const toggleEvent = (id: string) => {
    setState(s => ({
      ...s,
      events: s.events.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e)
    }));
  };

  const deleteEvent = (id: string) => {
    setState(s => ({ ...s, events: s.events.filter(e => e.id !== id) }));
  };

  const calculateCatStats = (cat: Cat, sandboxCollarId?: string | null) => {
    const activeEvents = state.events.filter(e => e.catId === cat.id && e.isActive && e.statKey);
    const collarId = sandboxCollarId !== undefined ? sandboxCollarId : cat.equippedCollarId;
    const collar = state.collars.find(c => c.id === collarId);

    const stats: Record<string, { current: number; gene: number; delta: number }> = {};

    STAT_DEFS.forEach(def => {
      if (def.isDerived) return;
      const gene = cat.genesStats[def.key] || 0;
      const eventDelta = activeEvents.filter(e => e.statKey === def.key).reduce((sum, e) => sum + (e.delta || 0), 0);
      const collarDelta = collar?.deltas[def.key] || 0;
      const current = Math.max(0, gene + eventDelta + collarDelta);
      stats[def.key] = { current, gene, delta: current - gene };
    });

    STAT_DEFS.forEach(def => {
      if (!def.isDerived) return;
      let current = 0; let gene = 0;
      if (def.key === 'hp') {
        const conStat = stats['con'];
        if (conStat) { gene = conStat.gene * 4; current = conStat.current * 4; }
        const eventDelta = activeEvents.filter(e => e.statKey === def.key).reduce((sum, e) => sum + (e.delta || 0), 0);
        const collarDelta = collar?.deltas[def.key] || 0;
        current += (eventDelta + collarDelta);
        current = Math.max(0, current);
      }
      stats[def.key] = { current, gene, delta: current - gene };
    });

    const combatStats = ['str', 'con', 'dex', 'int', 'speed'];
    const subjectiveScore = Math.min(...combatStats.map(k => stats[k]?.current || 0));

    return { stats, subjectiveScore };
  };

  return {
    ...state,
    register,
    login,
    logout,
    addBranch,
    addCat,
    updateCat,
    archiveCat,
    unarchiveCat,
    deleteCat,
    addEvent,
    toggleEvent,
    deleteEvent,
    calculateCatStats
  };
};

type AppStateValue = ReturnType<typeof useAppStateInternal>;
const StateContext = createContext<AppStateValue | null>(null);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useAppStateInternal();
  return React.createElement(StateContext.Provider, { value }, children);
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) throw new Error('useAppState must be used within a StateProvider');
  return context;
};
