'use client';

import exercisesData from '@/data/exercises.json';
import ExerciseCard from '@/components/ExerciseCard';

export default function EjerciciosPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏃 Ejercicios</h1>
      <p className="text-base text-gray-500 dark:text-gray-400">
        Ejercicios respiratorios y de actividad física adaptados para usted
      </p>

      {exercisesData.ejercicios.map(ej => (
        <ExerciseCard
          key={ej.id}
          nombre={ej.nombre}
          duracion={ej.duracion}
          icono={ej.icono}
          instrucciones={ej.instrucciones}
          categoria={ej.categoria}
        />
      ))}
    </div>
  );
}
