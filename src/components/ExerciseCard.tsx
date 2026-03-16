'use client';

interface ExerciseCardProps {
  nombre: string;
  duracion: string;
  icono: string;
  instrucciones: string[];
  categoria: string;
}

export default function ExerciseCard({ nombre, duracion, icono, instrucciones }: ExerciseCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{icono}</span>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{nombre}</h3>
          <span className="text-sm text-blue-500 font-medium">⏱ {duracion}</span>
        </div>
      </div>
      <ol className="space-y-2 mt-3">
        {instrucciones.map((step, i) => (
          <li key={i} className="flex gap-2 text-base text-gray-600 dark:text-gray-300">
            <span className="font-bold text-blue-400 shrink-0">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
