'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

type Props = { showHeader?: boolean };
const menuItems = [
  { href: '/plan', label: 'Plan del día', icon: '📅', desc: 'Cronograma diario' },
  { href: '/alimentacion', label: 'Alimentación', icon: '🍽️', desc: 'Guía de alimentos' },
  { href: '/medicacion', label: 'Medicación', icon: '💊', desc: 'Control de medicamentos' },
  { href: '/ejercicios', label: 'Ejercicios', icon: '🏃', desc: 'Ejercicios respiratorios' },
  { href: '/historial', label: 'Historial', icon: '📜', desc: 'Ver registros anteriores' },
  { href: '/registro', label: 'Registro diario', icon: '📋', desc: 'Ingresar mediciones' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊', desc: 'Ver resumen de salud' },
];

export default function MenuList({ showHeader = false }: Props) {
  const pathname = usePathname();

  return (
    <div className="space-y-4 pt-2">
      {showHeader && (
        <>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Menú</h1>
        </>
      )}

      <div className="space-y-3 mt-4">
        {menuItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 p-5 rounded-2xl transition-transform active:scale-[0.98] shadow-lg border
                ${active
                  ? 'bg-green-50 dark:bg-green-700/20 border-green-300 dark:border-green-500 text-green-800 dark:text-green-100'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100'
                }`}
            >
              <span className="text-5xl">{item.icon}</span>
              <div>
                <span className="text-2xl font-bold leading-tight">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
