import React, { useState } from 'react';
import { useAppState } from '../state';
import { Collar } from '../types';
import { v4 as uuid } from 'uuid';

const emptyDeltas = () => ({ str: 0, dex: 0, con: 0, speed: 0, int: 0, cha: 0, luck: 0 });

const CollarManagementView: React.FC = () => {
  const { collars, addCollar, updateCollar, deleteCollar } = useAppState();
  const [form, setForm] = useState<Collar>({
    id: '',
    name: '',
    description: '',
    deltas: emptyDeltas(),
    color: '#cccccc'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (col: Collar) => {
    setEditingId(col.id);
    setForm({ ...col, deltas: { ...emptyDeltas(), ...col.deltas } });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ id: '', name: '', description: '', deltas: emptyDeltas(), color: '#cccccc' });
  };

  const save = () => {
    const payload = { ...form, id: editingId || uuid() };
    if (editingId) {
      updateCollar(editingId, payload);
    } else {
      addCollar(payload);
    }
    resetForm();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-black uppercase italic mb-8">Ошейники</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border-4 border-black p-6 sketch-border">
          <h2 className="text-xl font-black uppercase mb-4">{editingId ? 'Правка' : 'Новый ошейник'}</h2>
          <div className="space-y-4">
            <input
              className="w-full border-2 border-black px-3 py-2 font-black"
              placeholder="Название"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="w-full border-2 border-black px-3 py-2 font-black"
              placeholder="Описание"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(emptyDeltas()).map(key => (
                <label key={key} className="text-xs font-black uppercase flex items-center gap-2">
                  {key.toUpperCase()}
                  <input
                    type="number"
                    className="w-20 border-2 border-black px-2 py-1 font-black"
                    value={(form.deltas as any)[key] || 0}
                    onChange={e => setForm({ ...form, deltas: { ...form.deltas, [key]: parseInt(e.target.value) || 0 } })}
                  />
                </label>
              ))}
            </div>
            <label className="text-xs font-black uppercase flex items-center gap-2">
              Цвет
              <input
                type="color"
                value={form.color || '#cccccc'}
                onChange={e => setForm({ ...form, color: e.target.value })}
              />
            </label>
            <div className="flex gap-3">
              <button onClick={save} className="bg-black text-white px-4 py-2 border-2 border-black font-black uppercase sketch-border-sm">
                {editingId ? 'Сохранить' : 'Добавить'}
              </button>
              {editingId && (
                <button onClick={resetForm} className="px-3 py-2 border-2 border-black font-black uppercase">Отмена</button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {collars.map(col => (
            <div key={col.id} className="border-2 border-black bg-white p-4 flex items-center justify-between sketch-border-sm">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-black" style={{ backgroundColor: col.color || '#ccc' }} />
                <div>
                  <div className="font-black uppercase">{col.name}</div>
                  <div className="text-xs opacity-60">{col.description}</div>
                  <div className="text-xs font-mono">
                    {Object.entries(col.deltas).map(([k,v]) => `${k.toUpperCase()}:${v>0?'+':''}${v}`).join('  ')}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(col)} className="text-xs px-3 py-1 border-2 border-black font-black uppercase">Править</button>
                <button onClick={() => deleteCollar(col.id)} className="text-xs px-3 py-1 border-2 border-black font-black uppercase text-red-700">Удалить</button>
              </div>
            </div>
          ))}
          {collars.length === 0 && <div className="text-sm font-black uppercase opacity-60">Пусто</div>}
        </div>
      </div>
    </div>
  );
};

export default CollarManagementView;
