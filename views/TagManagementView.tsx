import React, { useState } from 'react';
import { useAppState } from '../state';

const TagManagementView: React.FC = () => {
  const { tagPresets, addTagPreset, deleteTagPreset, cats } = useAppState();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#f97316');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addTagPreset(name.trim(), color);
    setName('');
  };

  const catCount = (tagName: string) => cats.filter(c => c.tags.includes(tagName)).length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10">
      <h1 className="text-4xl font-black mb-8 text-black">Теги</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-white border-4 border-black p-6 sketch-border shadow-lg">
          <h2 className="text-xl font-black mb-4">Создать тег</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase mb-1 opacity-60">Название</label>
              <input
                className="w-full border-4 border-black px-3 py-2 font-black bg-[#fdf6e3] sketch-border-sm"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase mb-1 opacity-60">Цвет</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-16 h-10 border border-black" />
                <input
                  className="flex-1 border-4 border-black px-3 py-2 font-black bg-[#fdf6e3] sketch-border-sm"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-black text-white font-black py-3 sketch-border uppercase tracking-widest">Сохранить</button>
          </form>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-black mb-2">Список тегов ({tagPresets.length})</h2>
          {tagPresets.map(tag => (
            <div key={tag.id} className="flex items-center justify-between border-4 border-black bg-white px-4 py-3 sketch-border-sm">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 border-2 border-black" style={{ backgroundColor: tag.color }} />
                <div>
                  <div className="font-black uppercase">{tag.name}</div>
                  <div className="text-xs opacity-60">Котов с тегом: {catCount(tag.name)}</div>
                </div>
              </div>
              <button
                onClick={() => deleteTagPreset(tag.id)}
                className="text-[11px] font-black text-red-700 uppercase border-2 border-black px-3 py-1 hover:bg-red-50"
              >
                Удалить
              </button>
            </div>
          ))}
          {tagPresets.length === 0 && <div className="text-black/50 font-black">Тегов пока нет</div>}
        </div>
      </div>
    </div>
  );
};

export default TagManagementView;
