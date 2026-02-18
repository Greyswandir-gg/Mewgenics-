
import React, { useState } from 'react';
import { useAppState } from '../state';
import { STAT_DEFS } from '../constants';
import GameIcon from '../components/GameIcon';

const TeamBuilderView: React.FC = () => {
  const { cats, collars, calculateCatStats } = useAppState();
  const [teamMembers, setTeamMembers] = useState<{ catId: string; sandboxCollarId: string | null }[]>([]);

  // Filters: Only cats with 'Боец' tag and NO Collar equipped on the real cat object
  const availableCats = cats.filter(c => 
    !c.isArchived && 
    c.tags.includes('Боец') && 
    c.equippedCollarId === null &&
    !teamMembers.find(m => m.catId === c.id)
  );

  const addMember = (catId: string) => {
    if (teamMembers.length >= 4) return;
    setTeamMembers([...teamMembers, { catId, sandboxCollarId: null }]);
  };

  const removeMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateMemberCollar = (index: number, collarId: string | null) => {
    const updated = [...teamMembers];
    updated[index].sandboxCollarId = collarId;
    setTeamMembers(updated);
  };

  const teamStats = STAT_DEFS.reduce((acc, def) => {
    acc[def.key] = teamMembers.reduce((sum, member) => {
      const cat = cats.find(c => c.id === member.catId);
      if (!cat) return sum;
      return sum + calculateCatStats(cat, member.sandboxCollarId).stats[def.key].current;
    }, 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Собрание команды</h1>
        <div className="text-black font-black uppercase text-xs opacity-50 underline decoration-2 italic">Рекомендуются коты с тегом "Боец"</div>
      </div>

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
                      <div key={def.key} className="flex justify-between items-center text-[9px] font-black uppercase border-b border-black/5 pb-1">
                        <div className="flex items-center gap-1">
                           <GameIcon type={def.icon} size={12} className="opacity-70" />
                           <span className="opacity-60">{def.name}</span>
                        </div>
                        <span className="stat-green mono text-[11px] bg-white px-1">{calculated?.stats[def.key].current}</span>
                      </div>
                    ))}
                  </div>

                  <div className="w-full mt-auto">
                    <label className="text-[9px] uppercase font-black block mb-1 opacity-60 italic">Тест снаряжения:</label>
                    <select 
                      className="w-full bg-white border-2 border-black p-2 text-[10px] font-black uppercase sketch-border-sm"
                      value={member.sandboxCollarId || ''}
                      onChange={(e) => updateMemberCollar(index, e.target.value || null)}
                    >
                      <option value="">Без ошейника</option>
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
            <GameIcon type="cha" size={32} /> TEAM TIPS
          </h2>
          <p className="text-black font-black italic leading-tight mb-4">
            Pick a goal: burst (STR/CON), speed (DEX/SPEED), or hybrid (LUCK/INT). Try collars in slots to see final stats instantly.
          </p>
          <p className="text-black font-black italic leading-tight">
            Data is stored in Supabase per email. After sign-in you will see your branches, cats, and events.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TeamBuilderView;
