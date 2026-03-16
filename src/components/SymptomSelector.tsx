'use client';

import symptomsData from '@/data/symptoms.json';

interface SymptomSelectorProps {
  selected: string[];
  onChange: (symptoms: string[]) => void;
}

export default function SymptomSelector({ selected, onChange }: SymptomSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md space-y-3">
      <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">🩺 Síntomas</h3>
      <div className="grid grid-cols-1 gap-2">
        {symptomsData.sintomas.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            className={`flex items-center gap-3 p-3 rounded-xl text-left text-base font-medium transition active:scale-95
              ${selected.includes(s.id)
                ? 'bg-red-50 dark:bg-red-900/30 border-2 border-red-400 text-red-700 dark:text-red-300'
                : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent text-gray-600 dark:text-gray-300'
              }`}
          >
            <span className="text-2xl">{s.icono}</span>
            <span>{s.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
