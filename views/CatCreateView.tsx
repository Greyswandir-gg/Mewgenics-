
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state';
import { STAT_DEFS } from '../constants';
import { Temperament } from '../types';
import GameIcon from '../components/GameIcon';

const CatCreateView: React.FC = () => {
  const navigate = useNavigate();
  const { branches, addCat, cats } = useAppState();

  const [formData, setFormData] = useState({
    name: '',
    branchId: branches[0]?.id || '',
    age: 0,
    level: 1,
    temperament: Temperament.NORMAL,
    genesStats: STAT_DEFS.reduce((acc, def) => {
      if (!def.isDerived) acc[def.key] = 10;
      return acc;
    }, {} as Record<string, number>),
    tags: [] as string[],
    motherId: null as string | null,
    fatherId: null as string | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.branchId) return;
    const cat = addCat({
      ...formData,
      loveCatId: null,
      enemyCatId: null,
      equippedCollarId: null
    });
    navigate(`/cats/${cat.id}`);
  };

  const toggleInitialTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag) 
        ? formData.tags.filter(t => t !== tag)
        : [...formData.tags, tag]
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10">
      <h1 className="text-4xl font-black mb-10 text-black italic uppercase tracking-tighter">Новое пополнение питомника</h1>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-white border-4 border-black p-8 sketch-border shadow-xl">
          <h2 className="text-xl font-black mb-6 flex items-center gap-3 uppercase italic border-b-2 border-black pb-2">
            <GameIcon type="cat" size={24} /> Основные сведения
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1 ml-1 opacity-60">Имя кота</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-[#fdf6e3] border-4 border-black px-4 py-3 font-black text-black focus:outline-none sketch-border-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1 ml-1 opacity-60">Генетическая линия</label>
                <select 
                  className="w-full bg-[#fdf6e3] border-4 border-black px-4 py-3 font-black text-black focus:outline-none sketch-border-sm uppercase text-xs"
                  value={formData.branchId}
                  onChange={e => setFormData({...formData, branchId: e.target.value})}
                >
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-black uppercase mb-1 ml-1 opacity-60">Уровень</label>
                  <input 
                    type="number" 
                    className="w-full bg-[#fdf6e3] border-4 border-black px-4 py-3 font-black text-black focus:outline-none sketch-border-sm"
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-black uppercase mb-1 ml-1 opacity-60">Возраст</label>
                  <input 
                    type="number" 
                    className="w-full bg-[#fdf6e3] border-4 border-black px-4 py-3 font-black text-black focus:outline-none sketch-border-sm"
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1 ml-1 opacity-60">Характер</label>
                <select 
                  className="w-full bg-[#fdf6e3] border-4 border-black px-4 py-3 font-black text-black focus:outline-none sketch-border-sm uppercase text-xs"
                  value={formData.temperament}
                  onChange={e => setFormData({...formData, temperament: e.target.value as Temperament})}
                >
                  {Object.values(Temperament).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-black p-8 sketch-border shadow-xl">
          <h2 className="text-xl font-black mb-6 flex items-center gap-3 uppercase italic border-b-2 border-black pb-2">
            <GameIcon type="branch" size={24} /> Генеалогия
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-black uppercase mb-1 ml-1 opacity-60">Биологическая Мать</label>
              <select 
                className="w-full bg-[#fdf6e3] border-4 border-black px-4 py-3 font-black text-black focus:outline-none sketch-border-sm text-xs"
                value={formData.motherId || ''}
                onChange={e => setFormData({...formData, motherId: e.target.value || null})}
              >
                <option value="">Дикая природа</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name} {c.tags.includes('Племя') ? '🧬' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-black uppercase mb-1 ml-1 opacity-60">Биологический Отец</label>
              <select 
                className="w-full bg-[#fdf6e3] border-4 border-black px-4 py-3 font-black text-black focus:outline-none sketch-border-sm text-xs"
                value={formData.fatherId || ''}
                onChange={e => setFormData({...formData, fatherId: e.target.value || null})}
              >
                <option value="">Дикая природа</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name} {c.tags.includes('Племя') ? '🧬' : ''}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-black p-8 sketch-border shadow-xl">
          <h2 className="text-xl font-black mb-6 flex items-center gap-3 uppercase italic border-b-2 border-black pb-2">
             Врожденные гены (База)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STAT_DEFS.filter(def => !def.isDerived).map(def => (
              <div key={def.key}>
                <label className="block text-[10px] font-black text-black uppercase mb-1 flex items-center gap-2">
                  <GameIcon type={def.icon} size={14} /> {def.name}
                </label>
                <input 
                  type="number" 
                  className="w-full bg-[#fdf6e3] border-4 border-black px-4 py-2 font-black text-black focus:outline-none sketch-border-sm mono"
                  value={formData.genesStats[def.key]}
                  onChange={e => setFormData({
                    ...formData, 
                    genesStats: { ...formData.genesStats, [def.key]: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap gap-4">
            <button 
              type="button"
              onClick={() => toggleInitialTag('Боец')}
              className={`flex items-center gap-2 px-6 py-3 border-4 border-black font-black uppercase text-xs sketch-border-sm transition ${formData.tags.includes('Боец') ? 'bg-red-400' : 'bg-white opacity-40'}`}
            >
              <GameIcon type="battle" size={16} /> Для битв
            </button>
            <button 
              type="button"
              onClick={() => toggleInitialTag('Племя')}
              className={`flex items-center gap-2 px-6 py-3 border-4 border-black font-black uppercase text-xs sketch-border-sm transition ${formData.tags.includes('Племя') ? 'bg-blue-400' : 'bg-white opacity-40'}`}
            >
              <GameIcon type="breeding" size={16} /> Племенной
            </button>
          </div>
          <div className="flex gap-6">
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="px-8 py-3 text-sm font-black uppercase italic border-b-4 border-black hover:bg-black hover:text-white transition"
            >
              Отмена
            </button>
            <button 
              type="submit"
              className="bg-black text-white px-12 py-4 border-4 border-black font-black text-lg transition sketch-border uppercase tracking-widest italic"
            >
              Создать запись
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CatCreateView;
