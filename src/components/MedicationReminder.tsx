'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import medicationsData from '@/data/medications.json';
import { todayString } from '@/lib/calculations';

export default function MedicationReminder() {
  const today = todayString();
  const doses = useLiveQuery(
    () => db.medicationDoses.where('date').equals(today).toArray(),
    [today]
  );
  const [saving, setSaving] = useState(false);

  const isDoseTaken = (medId: string, hora: string) => {
    return doses?.some(d => d.medicationId === medId && d.hora === hora && d.taken) ?? false;
  };

  const toggleDose = async (medId: string, hora: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const existing = await db.medicationDoses
        .where({ date: today, medicationId: medId })
        .filter(d => d.hora === hora)
        .first();

      if (existing?.id) {
        await db.medicationDoses.update(existing.id, { taken: !existing.taken, takenAt: new Date().toISOString() });
      } else {
        await db.medicationDoses.add({
          medicationId: medId,
          date: today,
          hora,
          taken: true,
          takenAt: new Date().toISOString(),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {medicationsData.medicamentos.map(med => (
        <div key={med.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{med.icono}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{med.nombre}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{med.dosis}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{med.instrucciones}</p>
          <div className="flex flex-wrap gap-2">
            {med.horarios.map(hora => {
              const taken = isDoseTaken(med.id, hora);
              return (
                <button
                  key={hora}
                  onClick={() => toggleDose(med.id, hora)}
                  className={`px-4 py-3 rounded-xl text-base font-bold transition active:scale-95
                    ${taken
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-2 border-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  {taken ? '✅' : '⬜'} {hora}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
