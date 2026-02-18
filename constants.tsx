
import { StatDef, Collar, Branch } from './types';

export const STAT_DEFS: StatDef[] = [
  { key: 'hp', name: 'ОЗ', icon: 'hp', group: 'left', isDerived: true },
  { key: 'str', name: 'Сила', icon: 'str', group: 'left' },
  { key: 'dex', name: 'Ловкость', icon: 'dex', group: 'left' },
  { key: 'con', name: 'Телослож.', icon: 'con', group: 'left' },
  { key: 'int', name: 'Разум', icon: 'int', group: 'right' },
  { key: 'speed', name: 'Скорость', icon: 'speed', group: 'right' },
  { key: 'cha', name: 'Харизма', icon: 'cha', group: 'right' },
  { key: 'luck', name: 'Удача', icon: 'luck', group: 'right' },
];

export const DEFAULT_COLLARS: Collar[] = [
  {
    id: 'class-hunter',
    name: 'Охотник',
    description: 'Ловкость +3, Телосложение -1, Скорость -2, Удача +2',
    deltas: { dex: 3, con: -1, speed: -2, luck: 2 }
  },
  {
    id: 'class-warrior',
    name: 'Воин',
    description: 'Сила +2, Интеллект -1, Скорость +1',
    deltas: { str: 2, int: -1, speed: 1 }
  },
  {
    id: 'class-tank',
    name: 'Танк',
    description: 'Ловкость -1, Телосложение +4, Интеллект -1',
    deltas: { dex: -1, con: 4, int: -1 }
  },
  {
    id: 'class-mage',
    name: 'Маг',
    description: 'Сила -1, Телосложение -1, Интеллект +2, Харизма +2',
    deltas: { str: -1, con: -1, int: 2, cha: 2 }
  },
  {
    id: 'class-thief',
    name: 'Вор',
    description: 'Сила -1, Телосложение -1, Скорость +4, Удача +1',
    deltas: { str: -1, con: -1, speed: 4, luck: 1 }
  },
  {
    id: 'class-cleric',
    name: 'Клирик',
    description: 'Ловкость -1, Телосложение +2, Скорость -1, Харизма +2',
    deltas: { dex: -1, con: 2, speed: -1, cha: 2 }
  },
  {
    id: 'class-necromancer',
    name: 'Некромант',
    description: 'Сила -1, Телосложение +2, Харизма +1',
    deltas: { str: -1, con: 2, cha: 1 }
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Линия Альфа', color: '#8b0000', notes: 'Боевые коты' },
  { id: 'b2', name: 'Линия Бета', color: '#00008b', notes: 'Разведение' },
];
