'use client';

interface FoodCardProps {
  nombre: string;
  porcion: string;
  nota: string;
}

export default function FoodCard({ nombre, porcion, nota }: FoodCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{nombre}</h4>
      <p className="text-sm text-blue-500 font-medium mt-1">Porción: {porcion}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{nota}</p>
    </div>
  );
}
