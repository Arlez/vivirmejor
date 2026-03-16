'use client';

import { useState, useEffect } from 'react';

export default function ConfiguracionPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('respiravida-darkmode');
    if (stored === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('respiravida-darkmode', String(next));
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const clearData = async () => {
    if (confirm('¿Está seguro de borrar TODOS los datos? Esta acción no se puede deshacer.')) {
      const { db } = await import('@/lib/db');
      await db.records.clear();
      await db.medicationDoses.clear();
      await db.planCompletions.clear();
      alert('Datos borrados exitosamente.');
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Configuración</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md space-y-4">
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">Apariencia</h2>

        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700 active:scale-[0.98] transition"
        >
          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
            {darkMode ? '🌙 Modo oscuro' : '☀️ Modo claro'}
          </span>
          <span className={`w-14 h-8 rounded-full flex items-center px-1 transition-colors shrink-0 ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <span className={`w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md space-y-4">
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">Datos</h2>

        <button
          onClick={clearData}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-4 rounded-2xl shadow active:scale-95 transition"
        >
          🗑️ Borrar todos los datos
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3">Acerca de</h2>
        <p className="text-base text-gray-500 dark:text-gray-400">
          <strong>RespiraVida</strong> v1.0
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Aplicación de seguimiento de salud para pacientes con enfermedades crónicas respiratorias y cardiovasculares.
          Los datos se almacenan localmente en su dispositivo.
        </p>
      </div>
    </div>
  );
}
