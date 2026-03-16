'use client';

import { useState, useEffect } from 'react';
import type { HealthRecord } from '@/types/HealthRecord';
import { todayString } from '@/lib/calculations';
import SymptomSelector from '@/components/SymptomSelector';

interface HealthFormProps {
  initialData?: HealthRecord;
  onSave: (record: HealthRecord) => void;
  onCancel?: () => void;
}

const defaultRecord: HealthRecord = {
  date: todayString(),
  spo2Rest: null,
  spo2Walk: null,
  walkMinutes: null,
  oxygenUsed: false,
  heartRate: null,
  bloodPressure: '',
  weight: null,
  energyLevel: 3,
  breathDifficulty: 2,
  symptoms: [],
  notes: '',
};

export default function HealthForm({ initialData, onSave, onCancel }: HealthFormProps) {
  const [form, setForm] = useState<HealthRecord>(initialData ?? defaultRecord);

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const updateField = <K extends keyof HealthRecord>(key: K, value: HealthRecord[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const parseNum = (val: string): number | null => {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md space-y-4">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">📊 Signos vitales</h3>

        <label className="block">
          <span className="text-base font-medium text-gray-600 dark:text-gray-300">Saturación en reposo (%)</span>
          <input
            type="number"
            min={60}
            max={100}
            className="mt-1 w-full p-4 text-xl rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-400 outline-none"
            value={form.spo2Rest ?? ''}
            onChange={e => updateField('spo2Rest', parseNum(e.target.value))}
          />
        </label>

        <label className="block">
          <span className="text-base font-medium text-gray-600 dark:text-gray-300">Saturación caminando (%)</span>
          <input
            type="number"
            min={60}
            max={100}
            className="mt-1 w-full p-4 text-xl rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-400 outline-none"
            value={form.spo2Walk ?? ''}
            onChange={e => updateField('spo2Walk', parseNum(e.target.value))}
          />
        </label>

        <label className="block">
          <span className="text-base font-medium text-gray-600 dark:text-gray-300">Frecuencia cardíaca (lpm)</span>
          <input
            type="number"
            min={30}
            max={200}
            className="mt-1 w-full p-4 text-xl rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-400 outline-none"
            value={form.heartRate ?? ''}
            onChange={e => updateField('heartRate', parseNum(e.target.value))}
          />
        </label>

        <label className="block">
          <span className="text-base font-medium text-gray-600 dark:text-gray-300">Presión arterial (ej: 120/80)</span>
          <input
            type="text"
            pattern="\d{2,3}/\d{2,3}"
            className="mt-1 w-full p-4 text-xl rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-400 outline-none"
            value={form.bloodPressure}
            onChange={e => updateField('bloodPressure', e.target.value)}
            placeholder="120/80"
          />
        </label>

        <label className="block">
          <span className="text-base font-medium text-gray-600 dark:text-gray-300">Peso (kg)</span>
          <input
            type="number"
            min={20}
            max={300}
            step={0.1}
            className="mt-1 w-full p-4 text-xl rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-400 outline-none"
            value={form.weight ?? ''}
            onChange={e => updateField('weight', parseNum(e.target.value))}
          />
        </label>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md space-y-4">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">🚶 Actividad</h3>

        <label className="block">
          <span className="text-base font-medium text-gray-600 dark:text-gray-300">Minutos caminados</span>
          <input
            type="number"
            min={0}
            max={120}
            className="mt-1 w-full p-4 text-xl rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-400 outline-none"
            value={form.walkMinutes ?? ''}
            onChange={e => updateField('walkMinutes', parseNum(e.target.value))}
          />
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-6 h-6 rounded accent-blue-500"
            checked={form.oxygenUsed}
            onChange={e => updateField('oxygenUsed', e.target.checked)}
          />
          <span className="text-base font-medium text-gray-600 dark:text-gray-300">¿Usó oxígeno suplementario?</span>
        </label>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md space-y-4">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">⚡ Estado general</h3>

        <div>
          <span className="text-base font-medium text-gray-600 dark:text-gray-300">
            Nivel de energía: {form.energyLevel}/5
          </span>
          <input
            type="range"
            min={1}
            max={5}
            className="mt-2 w-full h-3 accent-blue-500"
            value={form.energyLevel}
            onChange={e => updateField('energyLevel', parseInt(e.target.value))}
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>Muy baja</span><span>Excelente</span>
          </div>
        </div>

        <div>
          <span className="text-base font-medium text-gray-600 dark:text-gray-300">
            Dificultad para respirar: {form.breathDifficulty}/5
          </span>
          <input
            type="range"
            min={1}
            max={5}
            className="mt-2 w-full h-3 accent-orange-500"
            value={form.breathDifficulty}
            onChange={e => updateField('breathDifficulty', parseInt(e.target.value))}
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>Ninguna</span><span>Muy difícil</span>
          </div>
        </div>
      </div>

      <SymptomSelector
        selected={form.symptoms}
        onChange={(symptoms: string[]) => updateField('symptoms', symptoms)}
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md space-y-4">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">📝 Notas</h3>
        <textarea
          className="w-full p-4 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-400 outline-none"
          rows={3}
          value={form.notes}
          onChange={e => updateField('notes', e.target.value)}
          placeholder="¿Cómo se siente hoy?"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition"
        >
          💾 Guardar registro
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
