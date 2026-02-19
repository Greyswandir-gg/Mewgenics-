import React, { useMemo, useState } from 'react';
import { useAppState } from '../state';
import { STAT_DEFS } from '../constants';
import GameIcon from '../components/GameIcon';

type Role = 'tank' | 'melee' | 'ranged' | 'caster' | 'support';

const ROLE_ORDER: Role[] = ['tank', 'melee', 'ranged', 'caster', 'support'];

const weightRole = (stats: Record<string, number>, role: Role) => {
  switch (role) {
    case 'tank':
      return 0.55 * stats.con + 0.25 * stats.speed + 0.20 * stats.str;
    case 'melee':
      return 0.45 * stats.str + 0.35 * stats.speed + 0.20 * stats.con;
    case 'ranged':
      return 0.45 * stats.dex + 0.35 * stats.speed + 0.20 * stats.con;
    case 'caster':
      return 0.40 * stats.int + 0.30 * stats.cha + 0.20 * stats.speed + 0.10 * stats.con;
    case 'support':
      return 0.35 * stats.cha + 0.20 * stats.int + 0.20 * stats.con + 0.15 * stats.speed + 0.10 * stats.luck;
  }
};

const penaltyScore = (base: Record<string, number>, effective: Record<string, number>, collarDelta: Record<string, number>, mode: 'safe' | 'dps' = 'safe') => {
  let p = 0;
  if (effective.con <= 3) p += 2;
  if (effective.speed <= 3) p += 2;
  if ((collarDelta.con || 0) < 0 && base.con <= 4) p += 1;
  if ((collarDelta.speed || 0) < 0 && base.speed <= 4) p += 1;
  const k = mode === 'safe' ? 0.8 : 0.45;
  return p * k;
};

const buildStatObj = (src: any) => ({
  str: src.str?.current ?? src.str ?? 0,
  dex: src.dex?.current ?? src.dex ?? 0,
  con: src.con?.current ?? src.con ?? 0,
  speed: src.speed?.current ?? src.speed ?? 0,
  int: src.int?.current ?? src.int ?? 0,
  cha: src.cha?.current ?? src.cha ?? 0,
  luck: src.luck?.current ?? src.luck ?? 0
});

const TeamBuilderView: React.FC = () => {
  const { cats, collars, calculateCatStats, updateCat } = useAppState();
  const [teamMembers, setTeamMembers] = useState<{ catId: string; sandboxCollarId: string | null }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Только активные коты без ошейника и с тегом "для битв"
  const availableCats = cats.filter(c =>
    !c.isArchived &&
    c.equippedCollarId === null &&
    (c.tags.includes('для битв') || c.tags.includes('Боец')) &&
    !teamMembers.find(m => m.catId === c.id)
  );

  const addMember = (catId: string) => {
    if (teamMembers.length >= 4) return;
    setTeamMembers([...teamMembers, { catId, sandboxCollarId: null }]);
  };

  const removeMember = (index: number) => setTeamMembers(teamMembers.filter((_, i) => i !== index));

  const updateMemberCollar = (index: number, collarId: string | null) => {
    const updated = [...teamMembers];
    updated[index].sandboxCollarId = collarId;
    setTeamMembers(updated);
  };

  const evalCollarForCat = (catId: string, collarId: string | null) => {
    const cat = cats.find(c => c.id === catId);
    if (!cat) return null;
    const baseStats = buildStatObj(calculateCatStats(cat, null).stats);
    const afterStats = buildStatObj(calculateCatStats(cat, collarId).stats);
    const collar = collars.find(c => c.id === collarId);
    const collarDelta = collar?.deltas || {};

    const beforeRoles = ROLE_ORDER.map(r => ({ role: r, val: weightRole(baseStats, r) }));
    const afterRoles = ROLE_ORDER.map(r => ({ role: r, val: weightRole(afterStats, r) }));
    const bestBefore = beforeRoles.reduce((a, b) => (b.val > a.val ? b : a));
    const bestAfter = afterRoles.reduce((a, b) => (b.val > a.val ? b : a));
    const deltaBest = bestAfter.val - bestBefore.val;
    const penalty = penaltyScore(baseStats, afterStats, collarDelta, 'safe');
    const finalScore = deltaBest - penalty;
    return { catId, collarId, role: bestAfter.role, finalScore, deltaBest, penalty };
  };

  // формируем топ-3 ошейника для каждого выбранного кота
  const topCollarsPerCat: Record<string, ReturnType<typeof evalCollarForCat>[]> = useMemo(() => {
    const map: Record<string, ReturnType<typeof evalCollarForCat>[]> = {};
    teamMembers.forEach(m => {
      const ranked = collars
        .map(c => evalCollarForCat(m.catId, c.id))
        .filter(Boolean) as NonNullable<ReturnType<typeof evalCollarForCat>>[];
      ranked.sort((a, b) => b.finalScore - a.finalScore);
      map[m.catId] = ranked.slice(0, 3);
    });
    return map;
  }, [teamMembers, collars, cats, calculateCatStats]);

  const bestCombos = useMemo(() => {
    if (teamMembers.length === 0) return [];
    const results: { picks: { catId: string; collarId: string; role: Role; score: number }[]; total: number }[] = [];

    const dfs = (idx: number, used: Set<string>, current: any[]) => {
      if (idx >= teamMembers.length) {
        const total = current.reduce((s, p) => s + p.score, 0);
        results.push({ picks: [...current], total });
        return;
      }
      const catId = teamMembers[idx].catId;
      const options = topCollarsPerCat[catId] || [];
      options.forEach(opt => {
        if (used.has(opt.collarId!)) return;
        used.add(opt.collarId!);
        current.push({ catId, collarId: opt.collarId!, role: opt.role, score: opt.finalScore });
        dfs(idx + 1, used, current);
        current.pop();
        used.delete(opt.collarId!);
      });
    };
    dfs(0, new Set(), []);
    return results.sort((a, b) => b.total - a.total).slice(0, 3);
  }, [teamMembers, topCollarsPerCat]);

  const teamStats = STAT_DEFS.reduce((acc, def) => {
    acc[def.key] = teamMembers.reduce((sum, member) => {
      const cat = cats.find(c => c.id === member.catId);
      if (!cat) return sum;
      return sum + calculateCatStats(cat, member.sandboxCollarId).stats[def.key].current;
    }, 0);
    return acc;
  }, {} as Record<string, number>);

  const confirmTeam = async () => {
    if (teamMembers.length === 0) return;
    const missing = teamMembers.some(m => !m.sandboxCollarId);
    if (missing) {
      alert('У каждого бойца должен быть выбран ошейник.');
      return;
    }
    try {
      setIsSaving(true);
      for (const m of teamMembers) {
        const cat = cats.find(c => c.id === m.catId);
        if (!cat) continue;
        const newTags = Array.from(new Set(cat.tags.filter(t => t !== 'для битв').concat(['в бою'])));
        await updateCat(cat.id, { equippedCollarId: m.sandboxCollarId, tags: newTags });
      }
      alert('Команда зафиксирована, ошейники надеты.');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Не удалось сохранить команду');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-10">
      <div className="flex items-center justify-between gap-4 border-b-4 border-black pb-4">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <GameIcon type="cat" size={42} />
          Собрание команды
        </h1>
        <button
          onClick={confirmTeam}
          disabled={isSaving || teamMembers.length === 0 || teamMembers.some(m => !m.sandboxCollarId)}
          className="bg-black text-white px-6 py-3 border-4 border-black font-black uppercase text-sm tracking-widest sketch-border-sm disabled:opacity-40"
        >
          Подтвердить
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {availableCats.map(cat => (
          <button
            key={cat.id}
            onClick={() => addMember(cat.id)}
            disabled={teamMembers.length >= 4}
            className="px-3 py-2 border-2 border-black bg-white font-black text-xs uppercase sketch-border-sm hover:bg-black hover:text-white transition"
          >
            + {cat.name}
          </button>
        ))}
        {availableCats.length === 0 && <span className="text-xs font-black uppercase text-black/40">Нет свободных котов</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamMembers.map((m, idx) => {
          const cat = cats.find(c => c.id === m.catId);
          if (!cat) return null;
          const catStats = calculateCatStats(cat, m.sandboxCollarId);
          const collar = m.sandboxCollarId ? collars.find(c => c.id === m.sandboxCollarId) : null;

          return (
            <div key={m.catId} className="bg-[#e8dfcf] border-4 border-black p-4 sketch-border flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-black uppercase tracking-tighter">{cat.name}</div>
                  <div className="text-[10px] uppercase font-black text-black/50">Ур. {cat.level}</div>
                </div>
                <button onClick={() => removeMember(idx)} className="text-xs border-2 border-black px-2 py-1 font-black uppercase bg-white hover:bg-black hover:text-white">×</button>
              </div>

              <div className="space-y-1 text-sm">
                {STAT_DEFS.filter(d => !d.isDerived).map(def => (
                  <div key={def.key} className="flex justify-between text-[12px] font-black text-black/70">
                    <span className="flex items-center gap-2 uppercase"><GameIcon type={def.icon} size={14} /> {def.name}</span>
                    <span className="mono">{catStats.stats[def.key].current}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2">
                <label className="text-[10px] uppercase font-black opacity-60 block mb-1">Тест снаряжения</label>
                <select
                  value={m.sandboxCollarId || ''}
                  onChange={e => updateMemberCollar(idx, e.target.value || null)}
                  className="w-full border-2 border-black p-2 text-xs font-black uppercase bg-white sketch-border-sm"
                >
                  <option value="">Выбери ошейник</option>
                  {collars.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {collar && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-3 h-3 border border-black" style={{ backgroundColor: collar.color || '#ccc' }} />
                    <span className="text-[11px] font-black uppercase text-black/70">{collar.name}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border-4 border-black p-6 sketch-border shadow-lg">
          <div className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <GameIcon type="hp" size={18} /> Суммарные характеристики
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm font-black">
            {STAT_DEFS.map(def => (
              <div key={def.key} className="flex items-center gap-2">
                <GameIcon type={def.icon} size={16} />
                <span className="uppercase text-black/60">{def.name}</span>
                <span className="mono text-lg">{teamStats[def.key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-4 border-black p-6 sketch-border shadow-lg">
          <div className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <GameIcon type="str" size={18} /> Топ комбинации
          </div>
          <div className="space-y-4">
            {bestCombos.length === 0 && <div className="text-xs uppercase font-black text-black/40">Добавь хотя бы одного бойца</div>}
            {bestCombos.map((combo, idx) => (
              <div key={idx} className="border-2 border-black p-3 sketch-border-sm">
                <div className="flex justify-between text-xs font-black uppercase mb-2">
                  <span>#{idx + 1}</span>
                  <span>Счёт: {combo.total.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  {combo.picks.map(p => {
                    const cat = cats.find(c => c.id === p.catId);
                    const collar = collars.find(c => c.id === p.collarId);
                    return (
                      <div key={p.catId} className="flex justify-between items-center text-[12px] font-black">
                        <span>{cat?.name}</span>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border border-black" style={{ backgroundColor: collar?.color || '#ccc' }} />
                          {collar?.name} · {p.role} · {p.score.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBuilderView;
