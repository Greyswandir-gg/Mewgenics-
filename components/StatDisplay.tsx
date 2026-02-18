
import React from 'react';
import { StatDef } from '../types';
import GameIcon from './GameIcon';

interface StatDisplayProps {
  def: StatDef;
  current: number;
  gene: number;
  delta: number;
  size?: 'sm' | 'md';
}

const StatDisplay: React.FC<StatDisplayProps> = ({ def, current, gene, delta, size = 'md' }) => {
  const deltaText = delta === 0 ? '' : delta > 0 ? `+${delta}` : `${delta}`;
  
  return (
    <div className={`flex items-center justify-between py-2 border-b-2 border-black/10 ${size === 'sm' ? 'text-[11px]' : 'text-base'} font-black uppercase tracking-tight`}>
      <div className="flex items-center gap-3">
        <GameIcon type={def.icon} size={28} className="text-black" />
        <span className="text-black opacity-90">{def.name}</span>
      </div>
      <div className="flex items-center gap-6 mono">
        <div className="bg-white border-2 border-black px-3 py-1 sketch-border-sm flex items-center justify-center min-w-[55px]">
          <span className="stat-green text-2xl italic">{current}</span>
        </div>
        <div className="flex flex-col items-end min-w-[65px]">
          <span className="text-black/40 text-[10px] font-black">ГЕН: {gene}</span>
          <span className={`text-xs font-black italic ${delta > 0 ? 'text-green-900' : delta < 0 ? 'text-red-900' : 'text-black/20'}`}>
            {deltaText || '0'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatDisplay;
