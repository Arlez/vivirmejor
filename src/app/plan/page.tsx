'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PlanCompletion } from '@/lib/db';
import planData from '@/data/dailyPlan.json';
import { todayString } from '@/lib/calculations';

export default function PlanPage() {
  const today = todayString();
  const completions = useLiveQuery(
    () => db.planCompletions.where('date').equals(today).toArray(),
    [today]
  );
  const [saving, setSaving] = useState(false);

  const isCompleted = (index: number) => {
    return completions?.some(c => c.activityIndex === index && c.completada) ?? false;
  };

  const toggleActivity = async (index: number) => {
    if (saving) return;
    setSaving(true);
    try {
      const existing = await db.planCompletions
        .where({ date: today, activityIndex: index })
        .first();

      if (existing?.id) {
        await db.planCompletions.update(existing.id, { completada: !existing.completada });
      } else {
        await db.planCompletions.add({ date: today, activityIndex: index, completada: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const completedCount = completions?.filter(c => c.completada).length ?? 0;
  const total = planData.actividades.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📅 Plan del día</h1>

      {/* Progreso */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md">
        <div className="flex justify-between text-base font-medium text-gray-600 dark:text-gray-300 mb-2">
          <span>Progreso del día</span>
          <span>{completedCount}/{total}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className="h-4 rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actividades */}
      <div className="space-y-3">
        {planData.actividades.map((act, i) => {
          const done = isCompleted(i);
          return (
            <button
              key={i}
              onClick={() => toggleActivity(i)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition active:scale-[0.98] shadow-sm
                ${done
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
                  : 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700'
                }`}
            >
              <span className="text-3xl">{act.icono}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-blue-500">{act.hora}</span>
                  <span className={`text-lg font-bold ${done ? 'text-green-600 dark:text-green-400 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
                    {act.actividad}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{act.instrucciones}</p>
              </div>
              <span className="text-2xl">{done ? '✅' : '⬜'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
