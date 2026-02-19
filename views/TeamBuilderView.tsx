
import React, { useState, useMemo } from 'react';
import { useAppState } from '../state';
import { STAT_DEFS } from '../constants';
import GameIcon from '../components/GameIcon';

const TeamBuilderView: React.FC = () => {
  const { cats, collars, calculateCatStats } = useAppState();
  const [teamMembers, setTeamMembers] = useState<{ catId: string; sandboxCollarId: string | null }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Filters: Only cats with 'Боец' tag and NO Collar equipped on the real cat object
  const availableCats = cats.filter(c => 
    !c.isArchived && 
    c.tags.includes('Боец') && 
    c.equippedCollarId === null &&
    !teamMembers.find(m => m.catId === c.id)
  );

  const addMember = (catId: string) => {
    if (teamMembers.length >= 4) return;
    const defaultCollar = collars[0]?.id || null;
    setTeamMembers([...teamMembers, { catId, sandboxCollarId: defaultCollar }]);
  };

  const removeMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateMemberCollar = (index: number, collarId: string | null) => {
    const updated = [...teamMembers];
    updated[index].sandboxCollarId = collarId;
    setTeamMembers(updated);
  };

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
        await useAppState.getState().updateCat(cat.id, { equippedCollarId: m.sandboxCollarId, tags: newTags });
      }
      alert('Команда зафиксирована, ошейники надеты, теги обновлены.');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Не удалось сохранить команду');
    } finally {
      setIsSaving(false);
    }
  };

  const teamStats = STAT_DEFS.reduce((acc, def) => {
    acc[def.key] = teamMembers.reduce((sum, member) => {
      const cat = cats.find(c => c.id === member.catId);
      if (!cat) return sum;
      return sum + calculateCatStats(cat, member.sandboxCollarId).stats[def.key].current;
    }, 0);
    return acc;
  }, {} as Record<string, number>);

  const bestCombos = useMemo(() => {
    if (teamMembers.length === 0) return [];
    const combatKeys = ['str', 'con', 'dex', 'int', 'speed'];

    // Для каждого кота берём пул лучших ошейников (баланс: поднимает минимум статов)
    const topCollarsPerCat: Record<string, { collarId: string; collarName: string; score: number }[]> = {};
    teamMembers.forEach(m => {
      const cat = cats.find(c => c.id === m.catId);
      if (!cat) return;
      const ranked = collars.map(col => {
        const stats = calculateCatStats(cat, col.id);
        const minStat = Math.min(...combatKeys.map(k => stats.stats[k]?.current ?? 0));
        const sumStat = combatKeys.reduce((s, k) => s + (stats.stats[k]?.current ?? 0), 0);
        return { collarId: col.id, collarName: col.name, score: minStat, tie: sumStat };
      }).sort((a, b) => b.score !== a.score ? b.score - a.score : b.tie - a.tie);
      topCollarsPerCat[cat.id] = ranked.slice(0, 3); // пул
    });

    const results: { score: number; picks: { catName: string; collarName: string; collarId: string }[] }[] = [];

    const dfs = (idx: number, used: Set<string>, acc: { score: number; picks: { catName: string; collarName: string; collarId: string }[] }) => {
      if (idx >= teamMembers.length) {
        results.push(acc);
        return;
      }
      const member = teamMembers[idx];
      const cat = cats.find(c => c.id === member.catId);
      if (!cat) return;
      const options = topCollarsPerCat[cat.id] || [];
      options.forEach(opt => {
        if (used.has(opt.collarId)) return; // без дубликатов ошейников
        used.add(opt.collarId);
        dfs(idx + 1, used, {
          score: acc.score + opt.score,
          picks: [...acc.picks, { catName: cat.name, collarName: opt.collarName, collarId: opt.collarId }]
        });
        used.delete(opt.collarId);
      });
    };

    dfs(0, new Set<string>(), { score: 0, picks: [] });
    return results.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [teamMembers, collars, cats, calculateCatStats]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Собрание команды</h1>
        <div className="text-black font-black uppercase text-xs opacity-50 underline decoration-2 italic">Рекомендуются коты с тегом "Боец"</div>
      </div>

      {teamMembers.length > 0 && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={confirmTeam}
            disabled={isSaving}
            className="bg-black text-white px-6 py-3 border-4 border-black font-black uppercase text-sm sketch-border disabled:opacity-50"
          >
            {isSaving ? 'Сохраняю...' : 'Подтвердить команду'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[0, 1, 2, 3].map(index => {
          const member = teamMembers[index];
          const cat = member ? cats.find(c => c.id === member.catId) : null;
          const calculated = cat ? calculateCatStats(cat, member.sandboxCollarId) : null;

          return (
            <div key={index} className="bg-[#e8dfcf] border-4 border-black min-h-[520px] flex flex-col p-6 relative sketch-border shadow-lg">
              {cat ? (
                <>
                  <button 
                    onClick={() => removeMember(index)}
                    className="absolute top-3 right-3 text-black hover:bg-black hover:text-white border-2 border-black w-8 h-8 flex items-center justify-center font-black transition"
                  >
                    ✖
                  </button>
                  <div className="w-full text-center mb-6">
                    <div className="text-2xl font-black uppercase italic border-b-2 border-black pb-1 truncate">{cat.name}</div>
                    <div className="text-[10px] text-black font-black mt-2 bg-white inline-block px-2 border border-black uppercase tracking-tighter">
                      Боевая мощь: <span className="stat-green italic">{calculated?.subjectiveScore}</span>
                    </div>
                  </div>
                  
                  {/* Grid showing all 8 stats - Ensuring full list as requested */}
                  <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1 mb-6 flex-1 bg-white/30 p-2 border-2 border-black/10">
                    {STAT_DEFS.map(def => (
                      <div key={def.key} className="flex justify-between items-center text-sm font-black uppercase border-b border-black/5 pb-1">
                        <div className="flex items-center gap-1">
                           <GameIcon type={def.icon} size={14} className="opacity-70" />
                           <span className="opacity-70">{def.name}</span>
                        </div>
                        <span className="stat-green mono text-base bg-white px-2">{calculated?.stats[def.key].current}</span>
                      </div>
                    ))}
                  </div>

                  <div className="w-full mt-auto">
                    <label className="text-[9px] uppercase font-black block mb-1 opacity-60 italic">Тест снаряжения:</label>
                    <select 
                      className="w-full bg-white border-2 border-black p-2 text-[10px] font-black uppercase sketch-border-sm"
                      value={member.sandboxCollarId || collars[0]?.id || ''}
                      onChange={(e) => updateMemberCollar(index, e.target.value)}
                    >
                      {collars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <div className="text-center w-full flex flex-col items-center justify-center h-full">
                  <div className="bg-black/5 p-6 border-4 border-dashed border-black/20 mb-6 flex items-center justify-center w-full">
                    <GameIcon type="cat" size={64} className="opacity-20" />
                  </div>
                  <div className="text-black/30 font-black uppercase text-xs mb-4 italic">Пустой слот</div>
                  <select 
                    className="bg-white border-4 border-black p-3 text-xs font-black uppercase w-full sketch-border-sm"
                    onChange={(e) => addMember(e.target.value)}
                    value=""
                  >
                    <option value="" disabled>Найти бойца</option>
                    {availableCats.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (🧬 {calculateCatStats(c).subjectiveScore})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
        <div className="bg-white border-4 border-black sketch-border p-10 shadow-xl">
          <h2 className="text-3xl font-black uppercase italic mb-10 border-b-4 border-black pb-3 flex items-center gap-3">
             <GameIcon type="hp" size={32} /> СУММАРНЫЕ ХАРАКТЕРИСТИКИ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10">
            {STAT_DEFS.map(def => (
              <div key={def.key} className="text-center group border-b-2 border-black/5 pb-2">
                <div className="flex justify-center mb-2 group-hover:scale-125 transition-transform">
                   <GameIcon type={def.icon} size={36} className="text-black" />
                </div>
                <div className="text-[10px] uppercase font-black opacity-40">{def.name}</div>
                <div className="text-4xl font-black text-black mono italic drop-shadow-sm">{teamStats[def.key]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#fff9f0] border-4 border-black sketch-border p-10 shadow-xl">
          <h2 className="text-3xl font-black uppercase italic mb-6 border-b-4 border-black pb-3 flex items-center gap-3">
            <GameIcon type="cha" size={32} /> ТОП КОМБИНАЦИИ
          </h2>
          {teamMembers.length === 0 ? (
            <p className="text-black font-black italic opacity-50 text-lg text-center">Выбери до 4 бойцов чтобы рассчитать связки</p>
          ) : (
            <div className="space-y-4">
              {bestCombos.length === 0 && <p className="text-black font-black italic opacity-50">Нет подходящих комбинаций</p>}
              {bestCombos.map((combo, idx) => (
                <div key={idx} className="border-2 border-black bg-white/70 p-3 sketch-border-sm">
                  <div className="flex justify-between items-center font-black text-sm uppercase mb-2">
                    <span>#{idx + 1}</span>
                    <span className="text-lg">Счёт: {combo.score}</span>
                  </div>
                  <ul className="text-sm leading-tight space-y-1">
                    {combo.picks.map((p, i) => (
                      <li key={i} className="flex justify-between">
                        <span className="font-black">{p.catName}</span>
                        <span className="opacity-70">{p.collarName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeamBuilderView;
