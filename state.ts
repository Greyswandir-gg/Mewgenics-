import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { Cat, Branch, CatEvent, Collar, TeamPreset, Temperament, EventType, RelationshipKind, User, TagPreset } from './types';
import { DEFAULT_COLLARS, STAT_DEFS, INITIAL_BRANCHES } from './constants';

interface AppState {
  cats: Cat[];
  branches: Branch[];
  events: CatEvent[];
  teamPresets: TeamPreset[];
  collars: Collar[];
  tagPresets: TagPreset[];
  user: User | null;
  loading: boolean;
}

const initialState: AppState = {
  cats: [],
  branches: [],
  events: [],
  teamPresets: [],
  collars: DEFAULT_COLLARS,
  tagPresets: [],
  user: null,
  loading: true
};

const StateContext = createContext<ReturnType<typeof useAppStateInternal> | null>(null);

const useAppStateInternal = () => {
  const [state, setState] = useState<AppState>(initialState);

  const loadData = useCallback(async (userId: string) => {
    setState(s => ({ ...s, loading: true }));
    const [branchesRes, catsRes, eventsRes, presetsRes, tagsRes] = await Promise.all([
      supabase.from('branches').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('cats').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('events').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('team_presets').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('tag_presets').select('*').eq('user_id', userId).order('name', { ascending: true })
    ]);

    const branches: Branch[] = branchesRes.data || [];
    // Seed default branches for new user
    if (branches.length === 0) {
      const seed = INITIAL_BRANCHES.map(({ name, color, notes }) => ({ name, color, notes, user_id: userId }));
      const inserted = await supabase.from('branches').insert(seed).select();
      if (!inserted.error && inserted.data) branches.push(...inserted.data as Branch[]);
    }

    setState(s => ({
      ...s,
      branches,
      cats: (catsRes.data || []).map(supabaseCatToModel),
      events: (eventsRes.data || []).map(supabaseEventToModel),
      teamPresets: (presetsRes.data as TeamPreset[]) || [],
      tagPresets: (tagsRes.data as TagPreset[]) || [],
      loading: false
    }));
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user: User = { id: session.user.id, email: session.user.email || '' };
        setState(s => ({ ...s, user }));
        await loadData(user.id);
      } else {
        setState(initialState);
      }
    });
    // check existing session
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user) {
        const user: User = { id: session.user.id, email: session.user.email || '' };
        setState(s => ({ ...s, user }));
        loadData(user.id);
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });
    return () => listener?.subscription.unsubscribe();
  }, [loadData]);

  const requireUser = () => {
    if (!state.user) throw new Error('Нужна авторизация');
    return state.user;
  };

  const register = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) throw error || new Error('Регистрация не удалась');
    const user: User = { id: data.user.id, email: data.user.email || '' };
    setState(s => ({ ...s, user }));
    await loadData(user.id);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw error || new Error('Неверный email или пароль');
    const user: User = { id: data.user.id, email: data.user.email || '' };
    setState(s => ({ ...s, user }));
    await loadData(user.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setState(initialState);
  };

  const addBranch = async (name: string, color: string) => {
    const user = requireUser();
    const { data, error } = await supabase.from('branches').insert({ name, color, user_id: user.id }).select().single();
    if (error) throw error;
    setState(s => ({ ...s, branches: [...s.branches, data as Branch] }));
  };

  const addCat = async (catData: Omit<Cat, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    const user = requireUser();
    // Автотег "для битв" если не указан
    const ensuredTags = catData.tags.includes('для битв') ? catData.tags : [...catData.tags, 'для битв'];
    const payload = {
      ...modelCatToSupabase({ ...catData, tags: ensuredTags }),
      user_id: user.id,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('cats').insert(payload).select().single();
    if (error) throw error;
    const cat = supabaseCatToModel(data as any);
    setState(s => ({ ...s, cats: [...s.cats, cat] }));
    return cat;
  };

  const updateCat = async (id: string, updates: Partial<Cat>) => {
    const user = requireUser();
    const payload: any = { ...modelCatToSupabase(updates), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('cats').update(payload).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw error;
    const updated = supabaseCatToModel(data as any);
    setState(s => ({
      ...s,
      cats: s.cats.map(c => c.id === id ? updated : c)
    }));
  };

  const archiveCat = async (id: string) => updateCat(id, { isArchived: true, equippedCollarId: null });
  const unarchiveCat = async (id: string) => updateCat(id, { isArchived: false });

  const deleteCat = async (id: string) => {
    const user = requireUser();
    const { error } = await supabase.from('cats').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    setState(s => ({
      ...s,
      cats: s.cats.filter(c => c.id !== id),
      events: s.events.filter(e => e.catId !== id)
    }));
  };

  const addEvent = async (eventData: Omit<CatEvent, 'id' | 'createdAt' | 'isActive'>) => {
    const user = requireUser();
    // Normalize delta: buffs always positive, debuffs always negative
    let normalizedDelta = eventData.delta;
    if (normalizedDelta != null) {
      if (eventData.type === EventType.BUFF && normalizedDelta < 0) normalizedDelta = Math.abs(normalizedDelta);
      if (eventData.type === EventType.DEBUFF && normalizedDelta > 0) normalizedDelta = -Math.abs(normalizedDelta);
    }

    const payload: any = {
      user_id: user.id,
      cat_id: eventData.catId,
      type: eventData.type,
      stat_key: eventData.statKey,
      delta: normalizedDelta,
      rel_kind: eventData.relKind,
      rel_from: eventData.relFrom,
      rel_to: eventData.relTo,
      note: eventData.note,
      is_active: true,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('events').insert(payload).select().single();
    if (error) throw error;
    const ev = supabaseEventToModel(data as any);
    setState(s => ({ ...s, events: [...s.events, ev] }));
  };

  const toggleEvent = async (id: string) => {
    const user = requireUser();
    const current = state.events.find(e => e.id === id);
    if (!current) return;
    const { data, error } = await supabase.from('events').update({ is_active: !current.isActive }).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw error;
    const ev = supabaseEventToModel(data as any);
    setState(s => ({ ...s, events: s.events.map(e => e.id === id ? ev : e) }));
  };

  const deleteEvent = async (id: string) => {
    const user = requireUser();
    const { error } = await supabase.from('events').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    setState(s => ({ ...s, events: s.events.filter(e => e.id !== id) }));
  };

  const addTagPreset = async (name: string, color: string) => {
    const user = requireUser();
    const { data, error } = await supabase.from('tag_presets').insert({ name, color, user_id: user.id }).select().single();
    if (error) throw error;
    setState(s => ({ ...s, tagPresets: [...s.tagPresets, data as TagPreset] }));
  };

  const deleteTagPreset = async (id: string) => {
    const user = requireUser();
    const { error } = await supabase.from('tag_presets').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    setState(s => ({ ...s, tagPresets: s.tagPresets.filter(t => t.id !== id) }));
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
    const subjectiveScore = Math.min(...combatStats.map(k => stats[k]?.gene ?? 0));

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
    addTagPreset,
    deleteTagPreset,
    calculateCatStats
  };
};

const supabaseCatToModel = (row: any): Cat => ({
  id: row.id,
  branchId: row.branch_id,
  name: row.name,
  age: row.age,
  level: row.level,
  temperament: row.temperament as Temperament,
  genesStats: row.genes_stats || {},
  tags: row.tags || [],
  loveCatId: row.love_cat_id,
  enemyCatId: row.enemy_cat_id,
  motherId: row.mother_id,
  fatherId: row.father_id,
  equippedCollarId: row.equipped_collar_id,
  isArchived: row.is_archived,
  gender: (row.gender as any) || 'unknown',
  createdAt: Date.parse(row.created_at),
  updatedAt: Date.parse(row.updated_at)
});

const modelCatToSupabase = (cat: Partial<Cat>) => ({
  branch_id: cat.branchId,
  name: cat.name,
  age: cat.age,
  level: cat.level,
  temperament: cat.temperament,
  genes_stats: cat.genesStats,
  tags: cat.tags,
  love_cat_id: cat.loveCatId,
  enemy_cat_id: cat.enemyCatId,
  mother_id: cat.motherId,
  father_id: cat.fatherId,
  equipped_collar_id: cat.equippedCollarId,
  is_archived: cat.isArchived,
  gender: cat.gender
});

const supabaseEventToModel = (row: any): CatEvent => ({
  id: row.id,
  catId: row.cat_id,
  type: row.type as EventType,
  statKey: row.stat_key,
  delta: row.delta,
  relKind: row.rel_kind as RelationshipKind,
  relFrom: row.rel_from,
  relTo: row.rel_to,
  note: row.note,
  isActive: row.is_active,
  createdAt: Date.parse(row.created_at)
});

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useAppStateInternal();
  return React.createElement(StateContext.Provider, { value }, children);
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) throw new Error('useAppState must be used within a StateProvider');
  return context;
};
