
import React, { useState } from 'react';
import { useAppState } from '../state';

const BranchManagementView: React.FC = () => {
  const { branches, cats, addBranch } = useAppState();
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchColor, setNewBranchColor] = useState('#3b82f6');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    addBranch(newBranchName, newBranchColor);
    setNewBranchName('');
  };

  const getCatCount = (branchId: string) => {
    return cats.filter(c => c.branchId === branchId).length;
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Управление ветками</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Branch Creation Form */}
        <div className="bg-card rounded-xl border border-slate-700 p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="bg-blue-600 w-2 h-6 rounded"></span>
            Создать новую ветку
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Название линии</label>
              <input 
                type="text" 
                placeholder="Напр: Огненная кровь"
                className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Цвет маркера</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  className="w-12 h-12 bg-transparent border-none cursor-pointer"
                  value={newBranchColor}
                  onChange={(e) => setNewBranchColor(e.target.value)}
                />
                <input 
                  type="text" 
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white mono uppercase"
                  value={newBranchColor}
                  onChange={(e) => setNewBranchColor(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-900/20"
            >
              Добавить линию
            </button>
          </form>
        </div>

        {/* Branch List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold mb-6 text-slate-400">Существующие ветки ({branches.length})</h2>
          <div className="grid gap-3">
            {branches.map(branch => (
              <div 
                key={branch.id} 
                className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between group hover:border-slate-500 transition"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full shadow-lg" 
                    style={{ backgroundColor: branch.color }}
                  ></div>
                  <div>
                    <div className="font-bold text-white">{branch.name}</div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">
                      {getCatCount(branch.id)} Котов
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-600 mono">{branch.id.split('-')[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchManagementView;
