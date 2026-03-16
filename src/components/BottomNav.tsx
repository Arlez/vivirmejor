'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: '📊' },
  { href: '/plan', label: 'Plan', icon: '📅' },
  { href: '/registro', label: 'Registro', icon: '📋' },
  { href: '/medicacion', label: 'Meds', icon: '💊' },
  { href: '/menu', label: 'Más', icon: '☰' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors min-w-[60px]
                ${active
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
                }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-xs font-medium mt-0.5 ${active ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
