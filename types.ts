
export enum Temperament {
  FRIENDLY = 'Friendly',
  NORMAL = 'Normal',
  TOXIC = 'Toxic'
}

export enum EventType {
  INJURY = 'injury',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  CUSTOM = 'custom',
  RELATIONSHIP = 'relationship'
}

export enum RelationshipKind {
  LOVE = 'love',
  ENEMY = 'enemy',
  TEMPERAMENT = 'temperament'
}

export interface StatDef {
  key: string;
  name: string;
  icon: string;
  group: 'left' | 'right';
  isDerived?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  color: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
}

export interface CatEvent {
  id: string;
  catId: string;
  type: EventType;
  statKey?: string;
  delta?: number;
  relKind?: RelationshipKind;
  relFrom?: string;
  relTo?: string;
  note?: string;
  isActive: boolean;
  createdAt: number;
}

export interface Collar {
  id: string;
  name: string;
  description: string;
  deltas: Record<string, number>;
}

export interface Cat {
  id: string;
  branchId: string;
  name: string;
  age: number;
  level: number;
  temperament: Temperament;
  genesStats: Record<string, number>;
  tags: string[]; // Replaces fixed flags with flexible tag system
  loveCatId: string | null;
  enemyCatId: string | null;
  motherId: string | null;
  fatherId: string | null;
  equippedCollarId: string | null;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TeamPreset {
  id: string;
  name: string;
  members: {
    catId: string;
    sandboxCollarId: string | null;
  }[];
}
