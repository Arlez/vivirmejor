'use client';

import { useState, useEffect } from 'react';
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
  const [order, setOrder] = useState<number[]>(() => planData.actividades.map((_, i) => i));

  const isCompleted = (index: number) => {
    return completions?.some(c => c.activityIndex === index && c.completada) ?? false;
  };

  const toggleActivity = async (index: number) => {
    if (saving) return;
    setSaving(true);
    const wasDone = isCompleted(index);
    try {
      const existing = await db.planCompletions
        .where({ date: today, activityIndex: index })
        .first();

      if (existing?.id) {
        await db.planCompletions.update(existing.id, { completada: !existing.completada });
      } else {
        await db.planCompletions.add({ date: today, activityIndex: index, completada: true });
      }

      // Si acabamos de completar la actividad, muévela al final de la lista (optimista)
      if (!wasDone) {
        const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        setOrder(prev => [...prev.filter(x => x !== index), index]);
        // Restaurar la posición de scroll después del re-render para evitar saltos visuales
        if (typeof window !== 'undefined') {
          requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, scrollY)));
        }
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
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-md">
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
      <div className="space-y-4">
        {order.map((idx) => {
          const act = planData.actividades[idx];
          const done = isCompleted(idx);
          return (
            <button
              key={idx}
              onClick={(e) => { (e.currentTarget as HTMLElement).blur(); toggleActivity(idx); }}
              className={`w-full flex items-center gap-6 p-6 rounded-4xl overflow-hidden text-left transition active:scale-[0.98] shadow-md
                ${done
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
                  : 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700'
                }`}
            >
              <span className="text-4xl">{act.icono}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{act.hora}</span>
                  <span className={`text-xl font-bold ${done ? 'text-green-600 dark:text-green-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                    {act.actividad}
                  </span>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-2 whitespace-normal">{act.instrucciones}</p>
              </div>
              <span className="text-3xl">{done ? '✅' : '⬜'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
