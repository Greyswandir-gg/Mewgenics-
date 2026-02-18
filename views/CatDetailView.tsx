
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../state';
import { STAT_DEFS } from '../constants';
import { EventType, Temperament } from '../types';
import StatDisplay from '../components/StatDisplay';
import GameIcon from '../components/GameIcon';

const CatDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    cats, branches, events, collars, tagPresets,
    calculateCatStats, archiveCat, unarchiveCat, addEvent, deleteEvent, updateCat, deleteCat 
  } = useAppState();

  const cat = cats.find(c => c.id === id);
  const [sandboxCollarId, setSandboxCollarId] = useState<string | null>(undefined as any);
  const [showEventForm, setShowEventForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [newTag, setNewTag] = useState('');

  const [newEvent, setNewEvent] = useState({
    type: EventType.BUFF,
    statKey: STAT_DEFS.filter(d => !d.isDerived)[0].key,
    delta: 1,
    note: ''
  });

  if (!cat) return <div className="p-10 font-black uppercase text-2xl text-center">Кот сбежал... <br/><Link to="/" className="underline text-black hover:bg-black hover:text-white p-2">Вернуться</Link></div>;

  const branch = branches.find(b => b.id === cat.branchId);
  const mother = cats.find(c => c.id === cat.motherId);
  const father = cats.find(c => c.id === cat.fatherId);
  const { stats, subjectiveScore } = calculateCatStats(cat, sandboxCollarId === undefined ? cat.equippedCollarId : sandboxCollarId);
  const catEvents = events.filter(e => e.catId === cat.id);

  const startEditing = () => {
    setEditData({ ...cat });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    await updateCat(cat.id, editData);
    setIsEditing(false);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.statKey) return;
    await addEvent({ catId: cat.id, ...newEvent });
    setShowEventForm(false);
    setNewEvent({...newEvent, note: '', delta: 1});
  };

  const handleEquipCollar = async (cid: string | null) => {
    await updateCat(cat.id, { equippedCollarId: cid });
    setSandboxCollarId(undefined as any);
  };

  const toggleTag = async (tag: string) => {
    const currentTags = isEditing ? editData.tags : cat.tags;
    const newTags = currentTags.includes(tag) 
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    
    if (isEditing) {
      setEditData({ ...editData, tags: newTags });
    } else {
      await updateCat(cat.id, { tags: newTags });
    }
  };

  const addNewTag = async () => {
    if (!newTag.trim()) return;
    const currentTags = isEditing ? editData.tags : cat.tags;
    if (!currentTags.includes(newTag.trim())) {
      const updatedTags = [...currentTags, newTag.trim()];
      if (isEditing) {
        setEditData({ ...editData, tags: updatedTags });
      } else {
        await updateCat(cat.id, { tags: updatedTags });
      }
    }
    setNewTag('');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      {cat.isArchived && (
        <div className="bg-orange-100 border-4 border-black p-6 mb-10 text-center font-black uppercase tracking-widest text-2xl sketch-border flex items-center justify-center gap-6">
          📜 ЗАСЛУЖЕННЫЙ ВЕТЕРАН АРХИВА
          <button onClick={async () => { await unarchiveCat(cat.id); }} className="text-sm bg-black text-white px-4 py-1 italic hover:bg-zinc-800 transition sketch-border-sm">Вернуть в питомник</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
        <div className="flex-1 bg-white border-4 border-black p-8 sketch-border relative w-full">
          <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-4">
            <div className="flex items-center gap-6">
              {isEditing ? (
                <input 
                  type="text" 
                  className="text-4xl font-black text-black uppercase italic tracking-tighter sketch-border-sm bg-[#fdf6e3] p-2 w-full max-w-md"
                  value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})}
                />
              ) : (
                <h1 className="text-6xl font-black text-black uppercase italic tracking-tighter">{cat.name}</h1>
              )}
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button onClick={startEditing} className="bg-zinc-800 text-white px-4 py-2 font-black text-xs uppercase tracking-widest sketch-border-sm hover:bg-zinc-700">Править</button>
              ) : (
                <button onClick={saveEdit} className="bg-green-700 text-white px-4 py-2 font-black text-xs uppercase tracking-widest sketch-border-sm hover:bg-green-600">Готово</button>
              )}
            </div>
          </div>

          <div className="mb-8">
             <label className="text-[10px] font-black uppercase opacity-40 block mb-2">Теги и особенности:</label>
              <div className="flex flex-wrap gap-2 items-center">
                 {(isEditing ? editData.tags : cat.tags).map((tag: string) => (
                   <span key={tag} className={`border-2 border-black px-3 py-1 font-black text-[10px] uppercase flex items-center gap-2 shadow-sm ${tag === 'Боец' ? 'bg-red-400' : tag === 'Племя' ? 'bg-blue-400' : 'bg-zinc-200'}`}>
                     {tag === 'Боец' && <GameIcon type="battle" size={12} />}
                     {tag === 'Племя' && <GameIcon type="breeding" size={12} />}
                    {tag}
                    <button onClick={() => toggleTag(tag)} className="hover:text-red-900 ml-1 font-bold">✕</button>
                  </span>
                ))}
                <div className="flex gap-1 items-center">
                  <input 
                    type="text" 
                    placeholder="Добавить тег..." 
                    className="text-[10px] p-1.5 border-2 border-black w-32 uppercase font-black bg-white"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addNewTag()}
                  />
                  <button onClick={addNewTag} className="bg-black text-white text-[12px] p-1 px-3 border-2 border-black font-black">+</button>
                </div>
                <div className="flex flex-wrap gap-1 items-center">
                  {tagPresets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => toggleTag(t.name)}
                      className="px-2 py-1 border-2 border-black text-[10px] uppercase font-black sketch-border-sm"
                      style={{ backgroundColor: (isEditing ? editData.tags : cat.tags).includes(t.name) ? t.color : '#fff' }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
           </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-black font-black uppercase">
            <div className="bg-zinc-50 p-4 border-2 border-black shadow-inner">
              <span className="text-[11px] opacity-40 block mb-2">Линия:</span>
              {isEditing ? (
                <select 
                  className="w-full text-xs font-black p-2 border-black border-2 bg-white"
                  value={editData.branchId}
                  onChange={e => setEditData({...editData, branchId: e.target.value})}
                >
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              ) : (
                <span className="px-3 py-1 border-2 border-black text-white text-xs block truncate" style={{ backgroundColor: branch?.color, textShadow: '1px 1px 0 #000' }}>{branch?.name}</span>
              )}
            </div>
            <div className="bg-zinc-50 p-4 border-2 border-black shadow-inner">
              <span className="text-[11px] opacity-40 block mb-2">Уровень:</span>
              {isEditing ? (
                <input type="number" className="w-full text-xl font-black p-2 border-black border-2 bg-white" value={editData.level} onChange={e => setEditData({...editData, level: parseInt(e.target.value) || 1})} />
              ) : (
                <span className="text-2xl italic">{cat.level || 1}</span>
              )}
            </div>
            <div className="bg-zinc-50 p-4 border-2 border-black shadow-inner">
              <span className="text-[11px] opacity-40 block mb-2">Возраст:</span>
              {isEditing ? (
                <input type="number" className="w-full text-xl font-black p-2 border-black border-2 bg-white" value={editData.age} onChange={e => setEditData({...editData, age: parseInt(e.target.value) || 0})} />
              ) : (
                <span className="text-2xl italic">{cat.age || 0}</span>
              )}
            </div>
            <div className="bg-zinc-50 p-4 border-2 border-black shadow-inner">
              <span className="text-[11px] opacity-40 block mb-2">Пол:</span>
              {isEditing ? (
                <select
                  className="w-full text-xs font-black p-2 border-black border-2 bg-white"
                  value={editData.gender}
                  onChange={e => setEditData({ ...editData, gender: e.target.value as any })}
                >
                  <option value="male">Муж</option>
                  <option value="female">Жен</option>
                  <option value="unknown">?</option>
                </select>
              ) : (
                <span className="text-2xl">{cat.gender === 'male' ? 'М' : cat.gender === 'female' ? 'Ж' : '?'}</span>
              )}
            </div>
            <div className="bg-zinc-50 p-4 border-2 border-black shadow-inner">
              <span className="text-[11px] opacity-40 block mb-2">Характер:</span>
              {isEditing ? (
                <select 
                  className="w-full text-xs font-black p-2 border-black border-2 bg-white"
                  value={editData.temperament}
                  onChange={e => setEditData({...editData, temperament: e.target.value as Temperament})}
                >
                  {Object.values(Temperament).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <span className="text-2xl italic">{cat.temperament}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-black p-8 text-center min-w-[200px] sketch-border flex flex-col justify-center items-center shadow-2xl">
          <div className="text-xs text-black uppercase font-black tracking-widest mb-2 border-b border-black w-full pb-1">Оценка</div>
          <div className="text-7xl font-black stat-green mono italic drop-shadow-md">{subjectiveScore}</div>
        </div>
      </div>

      <div className="bg-[#e8dfcf] border-4 border-black sketch-border overflow-hidden mb-12 shadow-xl">
        <div className="bg-black text-white px-8 py-4 font-black text-sm uppercase tracking-widest italic flex items-center gap-3">
          <GameIcon type="str" size={24} className="text-white" />
          Характеристики и Гены
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 bg-white/50">
          {STAT_DEFS.map(def => (
            <StatDisplay key={def.key} def={def} {...stats[def.key]} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border-4 border-black p-8 sketch-border shadow-xl">
            <div className="text-sm uppercase font-black tracking-widest text-black mb-8 flex items-center gap-3 border-b-4 border-black pb-3 italic">
              🌳 Генеалогия
            </div>
            <div className="space-y-6 font-black uppercase text-sm">
              <div className="flex justify-between items-center border-b border-black/10 pb-2">
                <span className="opacity-40 text-xs">Мать:</span>
                {mother ? (
                  <Link to={`/cats/${mother.id}`} className="underline decoration-red-600 decoration-4 hover:bg-red-50 px-2">{mother.name}</Link>
                ) : <span className="italic opacity-30">Неизвестна</span>}
              </div>
              <div className="flex justify-between items-center border-b border-black/10 pb-2">
                <span className="opacity-40 text-xs">Отец:</span>
                {father ? (
                  <Link to={`/cats/${father.id}`} className="underline decoration-blue-600 decoration-4 hover:bg-blue-50 px-2">{father.name}</Link>
                ) : <span className="italic opacity-30">Неизвестен</span>}
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black sketch-border overflow-hidden shadow-xl">
            <div className="bg-zinc-800 text-white px-6 py-3 border-b-2 border-black font-black text-xs uppercase tracking-widest flex justify-between items-center">
              <span>Снаряжение</span>
              {cat.equippedCollarId && (
                <button onClick={() => handleEquipCollar(null)} className="text-[10px] text-red-400 font-black hover:underline">Сброс</button>
              )}
            </div>
            <div className="p-8">
              <label className="text-[10px] uppercase font-black opacity-50 block mb-2">Активный ошейник</label>
              <select 
                className="w-full bg-white border-4 border-black p-3 text-sm text-black font-black focus:ring-0 mb-6 sketch-border-sm"
                value={sandboxCollarId === undefined ? (cat.equippedCollarId || '') : (sandboxCollarId || '')}
                onChange={(e) => setSandboxCollarId(e.target.value || null)}
              >
                <option value="">Без ошейника</option>
                {collars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {sandboxCollarId !== undefined && sandboxCollarId !== cat.equippedCollarId && (
                <button onClick={() => handleEquipCollar(sandboxCollarId)} className="w-full bg-black text-white font-black py-4 text-sm transition sketch-border uppercase tracking-widest">Экипировать</button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border-4 border-black sketch-border overflow-hidden h-full shadow-xl">
            <div className="bg-zinc-800 text-white px-8 py-3 border-b-2 border-black font-black text-xs uppercase tracking-widest flex justify-between items-center">
              <span>Журнал событий и мутаций</span>
              <button onClick={() => setShowEventForm(!showEventForm)} className="bg-white text-black px-4 py-1 font-black text-[10px] uppercase tracking-wider sketch-border-sm">
                {showEventForm ? 'ЗАКРЫТЬ' : '+ ЗАПИСЬ'}
              </button>
            </div>
            <div className="p-8">
              {showEventForm && (
                <form onSubmit={handleAddEvent} className="mb-10 p-8 bg-[#fff9f0] border-4 border-black sketch-border shadow-inner">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="text-[10px] uppercase font-black mb-1 block">Тип:</label>
                      <select className="w-full bg-white border-4 border-black p-2 text-xs font-black uppercase" value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}><option value="buff">БАФФ</option><option value="debuff">ДЕБАФФ</option></select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black mb-1 block">Стат:</label>
                      <select className="w-full bg-white border-4 border-black p-2 text-xs font-black uppercase" value={newEvent.statKey} onChange={(e) => setNewEvent({...newEvent, statKey: e.target.value})}>
                        {STAT_DEFS.map(d => <option key={d.key} value={d.key}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black mb-1 block">Значение:</label>
                      <input type="number" className="w-full bg-white border-4 border-black p-2 text-xs font-black" value={newEvent.delta} onChange={(e) => setNewEvent({...newEvent, delta: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="text-[10px] uppercase font-black mb-1 block">Заметка/Причина:</label>
                    <textarea 
                      placeholder="Опишите событие..."
                      className="w-full bg-white border-4 border-black p-3 text-sm font-black focus:outline-none min-h-[80px]"
                      value={newEvent.note}
                      onChange={(e) => setNewEvent({...newEvent, note: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="w-full bg-black text-white font-black py-4 text-sm transition uppercase tracking-widest">ДОБАВИТЬ В ЖУРНАЛ</button>
                </form>
              )}
              <div className="space-y-6">
                {catEvents.length === 0 && <div className="text-center py-20 text-black/20 font-black uppercase italic text-xl">История пуста...</div>}
                {catEvents.map(ev => (
                  <div key={ev.id} className="flex flex-col p-5 border-4 border-black bg-white sketch-border-sm relative shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-4">
                        <span className="font-black uppercase text-sm bg-black text-white px-2 py-1 italic">{ev.statKey}</span>
                        <span className={`text-2xl font-black mono italic ${ev.delta! > 0 ? 'text-green-800' : 'text-red-800'}`}>
                          {ev.delta! > 0 ? `+${ev.delta}` : ev.delta}
                        </span>
                      </div>
                      <button onClick={async () => { await deleteEvent(ev.id); }} className="text-[10px] font-black uppercase text-red-900 hover:bg-red-50 px-2 py-1 border border-black/20">Удалить</button>
                    </div>
                    {ev.note && <div className="mt-2 text-xs italic border-t-2 border-black/10 pt-2 font-bold opacity-80">{ev.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 mb-32 flex flex-col md:flex-row justify-between items-center gap-10 pt-10 border-t-4 border-black">
        <Link to="/" className="text-black font-black uppercase tracking-widest border-b-4 border-black hover:bg-black hover:text-white transition px-4 py-2 text-xl italic">← Назад в питомник</Link>
        <div className="flex gap-6">
          {!cat.isArchived && (
            <button 
              onClick={async () => {
                if (confirm('Отправить кота на покой? Ошейник будет снят, а сам кот уйдет из активного списка "Питомник" в "Архив".')) {
                  await archiveCat(cat.id);
                  navigate('/');
                }
              }} 
              className="bg-orange-400 border-4 border-black px-12 py-4 font-black uppercase tracking-widest sketch-border hover:bg-orange-500 transition text-xl italic shadow-none"
            >
              Кот постарел
            </button>
          )}
          <button 
            onClick={async () => {
                if (confirm('ВНИМАНИЕ: Это удалит кота из базы навсегда!')) {
                await deleteCat(cat.id);
                navigate('/');
              }
            }} 
            className="text-red-900 font-black uppercase text-sm hover:underline hover:bg-red-100 p-2"
          >
            Удалить запись навсегда
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatDetailView;
