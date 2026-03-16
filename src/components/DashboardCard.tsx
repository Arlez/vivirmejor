'use client';

interface DashboardCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  icon: string;
  color?: string;
}

export default function DashboardCard({ title, value, unit, icon, color = '#3b82f6' }: DashboardCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-base text-gray-500 dark:text-gray-400 font-medium">{title}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold" style={{ color }}>
          {value !== null && value !== undefined ? value : '--'}
        </span>
        {unit && <span className="text-lg text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}
