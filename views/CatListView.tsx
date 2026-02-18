
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../state';
import GameIcon from '../components/GameIcon';

const CatListView: React.FC = () => {
  const { cats, branches, calculateCatStats } = useAppState();
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  const filteredCats = cats.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || cat.branchId === selectedBranch;
    const matchesArchive = showArchived ? cat.isArchived : !cat.isArchived;
    return matchesSearch && matchesBranch && matchesArchive;
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-12 flex flex-col lg:flex-row gap-8 items-center justify-between border-b-4 border-black pb-8">
        <div>
          <h1 className="text-5xl font-black text-black flex items-center gap-4 italic uppercase tracking-tighter">
            <GameIcon type={showArchived ? 'archive' : 'cat'} size={48} />
            {showArchived ? 'Архив Ветеранов' : 'Питомник'}
            <span className="text-slate-800 opacity-40 text-2xl">({filteredCats.length})</span>
          </h1>
          <p className="text-black font-black uppercase text-xs mt-2 opacity-60">Заметки о генетическом превосходстве</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <button 
            onClick={() => setShowArchived(!showArchived)}
            className={`px-5 py-2 border-4 border-black font-black uppercase text-xs transition sketch-border-sm ${showArchived ? 'bg-orange-300 shadow-none transform translate-y-1' : 'bg-white'}`}
          >
            {showArchived ? 'К активным' : 'Архив'}
          </button>
          
          <input
            type="text"
            placeholder="Искать кота..."
            className="border-4 border-black px-4 py-2 text-sm bg-white font-black uppercase focus:ring-0 focus:outline-none w-full md:w-64 sketch-border-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <select
            className="border-4 border-black px-4 py-2 text-sm bg-white font-black uppercase focus:ring-0 focus:outline-none sketch-border-sm"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="all">Линии: Все</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <Link
            to="/cats/new"
            className="bg-black text-white hover:bg-zinc-800 px-8 py-3 border-4 border-black font-black text-sm transition sketch-border uppercase tracking-widest italic"
          >
            + Запись
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {filteredCats.map(cat => {
          const { subjectiveScore } = calculateCatStats(cat);
          const branch = branches.find(b => b.id === cat.branchId);
          
          return (
            <Link
              key={cat.id}
              to={`/cats/${cat.id}`}
              className={`bg-[#e8dfcf] border-4 border-black p-6 hover:bg-[#efe7da] transition-all group flex flex-col sketch-border relative ${cat.isArchived ? 'opacity-70 grayscale-[0.5]' : ''}`}
            >
              <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
                <div>
                  <h3 className="text-3xl font-black text-black uppercase group-hover:underline italic truncate max-w-[160px] tracking-tighter">
                    {cat.name}
                  </h3>
                  <div 
                    className="inline-block px-3 py-1 border-2 border-black text-[10px] font-black uppercase tracking-widest mt-1"
                    style={{ backgroundColor: branch?.color || '#ffffff', color: '#fff', textShadow: '1px 1px 0 #000' }}
                  >
                    {branch?.name || 'Бродяга'}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-[10px] text-black font-black uppercase tracking-tighter mb-1 bg-white px-1 border border-black/10">Оценка</div>
                  <div className="text-4xl font-black stat-green leading-none mono italic drop-shadow-sm">{subjectiveScore}</div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-black text-black/60 uppercase w-20 pt-1 shrink-0">Теги:</span>
                  <div className="flex flex-wrap gap-1">
                    {cat.tags.map(tag => (
                       <div key={tag} className={`px-1.5 py-0.5 border border-black text-[9px] font-black uppercase shadow-sm ${tag === 'Боец' ? 'bg-red-400' : tag === 'Племя' ? 'bg-blue-400' : 'bg-white'}`}>
                          {tag}
                       </div>
                    ))}
                    {cat.tags.length === 0 && <span className="text-black/30 font-black text-[10px] italic">пусто</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-black/60 uppercase w-20 shrink-0">Характер:</span>
                  <span className="text-sm text-black font-black uppercase italic truncate">{cat.temperament}</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t-2 border-black border-dashed flex justify-between items-center text-[10px] font-black text-black uppercase tracking-widest opacity-60">
                <span>УР. {cat.level || 1}</span>
                <span>ВЗ. {cat.age || 0}</span>
              </div>
            </Link>
          );
        })}
      </div>
      
      {filteredCats.length === 0 && (
        <div className="text-center py-40 bg-black/5 border-8 border-dashed border-black/20 rounded-lg">
           <div className="text-black font-black text-3xl uppercase italic opacity-40">Пусто...</div>
        </div>
      )}
    </div>
  );
};

export default CatListView;
