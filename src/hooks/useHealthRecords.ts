'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { HealthRecord } from '@/types/HealthRecord';
import { todayString } from '@/lib/calculations';

export function useHealthRecords(days: number = 30) {
  const since = (() => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  })();

  const records = useLiveQuery(
    () => db.records.where('date').aboveOrEqual(since).reverse().sortBy('date'),
    [since]
  );

  const todayRecord = useLiveQuery(
    () => db.records.where('date').equals(todayString()).first(),
    []
  );

  const addRecord = async (record: HealthRecord) => {
    return await db.records.add(record);
  };

  const updateRecord = async (id: number, changes: Partial<HealthRecord>) => {
    return await db.records.update(id, changes);
  };

  const deleteRecord = async (id: number) => {
    return await db.records.delete(id);
  };

  const getAllRecords = async () => {
    return await db.records.orderBy('date').toArray();
  };

  return {
    records: records ?? [],
    todayRecord,
    addRecord,
    updateRecord,
    deleteRecord,
    getAllRecords,
  };
}
