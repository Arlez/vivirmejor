'use client';

import foodsData from '@/data/foods.json';
import FoodCard from '@/components/FoodCard';

export default function AlimentacionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🍽️ Alimentación</h1>
      <p className="text-base text-gray-500 dark:text-gray-400">
        Alimentos recomendados para su salud cardiovascular y respiratoria
      </p>

      {foodsData.categorias.map(cat => (
        <div key={cat.nombre}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{cat.icono}</span>
            <h2 className="text-xl font-bold" style={{ color: cat.color }}>
              {cat.nombre}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {cat.alimentos.map(alimento => (
              <FoodCard
                key={alimento.nombre}
                nombre={alimento.nombre}
                porcion={alimento.porcion}
                nota={alimento.nota}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
