import Dexie, { type Table } from 'dexie';
import type { HealthRecord, MedicationDose } from '@/types/HealthRecord';

export interface PlanCompletion {
  id?: number;
  date: string;
  activityIndex: number;
  completada: boolean;
}

class VivirMejorDB extends Dexie {
  records!: Table<HealthRecord, number>;
  medicationDoses!: Table<MedicationDose, number>;
  planCompletions!: Table<PlanCompletion, number>;

  constructor() {
    super('VivirMejorDB');
    this.version(1).stores({
      records: '++id, date',
      medicationDoses: '++id, date, medicationId',
      planCompletions: '++id, date, activityIndex',
    });
  }
}

export const db = new VivirMejorDB();
