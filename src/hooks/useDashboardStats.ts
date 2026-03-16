'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { healthScore } from '@/lib/calculations';
import type { HealthRecord } from '@/types/HealthRecord';

export function useDashboardStats(days: number = 7) {
  const since = (() => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  })();

  const records = useLiveQuery(
    () => db.records.where('date').aboveOrEqual(since).toArray(),
    [since]
  );

  if (!records || records.length === 0) {
    return {
      avgSpo2: null,
      avgWalkMinutes: null,
      avgEnergy: null,
      lastWeight: null,
      latestScore: null,
      chartData: [],
      totalRecords: 0,
    };
  }

  const avgSpo2 = average(records.map(r => r.spo2Rest).filter(notNull));
  const avgWalkMinutes = average(records.map(r => r.walkMinutes).filter(notNull));
  const avgEnergy = average(records.map(r => r.energyLevel));
  const lastWeight = records
    .filter(r => r.weight !== null)
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight ?? null;

  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const latestScore = sortedRecords.length > 0
    ? healthScore(sortedRecords[sortedRecords.length - 1])
    : null;

  const chartData = sortedRecords.map(r => ({
    date: r.date.slice(5),
    spo2: r.spo2Rest,
    energia: r.energyLevel,
    caminata: r.walkMinutes,
    score: healthScore(r),
  }));

  return {
    avgSpo2: avgSpo2 !== null ? Math.round(avgSpo2) : null,
    avgWalkMinutes: avgWalkMinutes !== null ? Math.round(avgWalkMinutes) : null,
    avgEnergy: avgEnergy !== null ? Number(avgEnergy.toFixed(1)) : null,
    lastWeight,
    latestScore,
    chartData,
    totalRecords: records.length,
  };
}

function notNull<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
