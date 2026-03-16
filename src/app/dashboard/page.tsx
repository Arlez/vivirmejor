'use client';

import DashboardCard from '@/components/DashboardCard';
import ChartWidget from '@/components/ChartWidget';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { useAlerts } from '@/hooks/useAlerts';
import { getScoreColor, getScoreLabel } from '@/lib/calculations';

export default function DashboardPage() {
  const stats = useDashboardStats(7);
  const { todayRecord } = useHealthRecords();
  const alerts = useAlerts(todayRecord);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Mi salud hoy</h1>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl text-base font-medium ${
                alert.type === 'danger'
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-400'
                  : alert.type === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-400'
                  : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-400'
              }`}
            >
              <p className="font-bold">{alert.message}</p>
              {alert.detail && <p className="text-sm mt-1 opacity-80">{alert.detail}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Score de salud */}
      {stats.latestScore !== null && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md text-center">
          <p className="text-base text-gray-500 dark:text-gray-400 mb-2">Score de salud</p>
          <p className="text-6xl font-black" style={{ color: getScoreColor(stats.latestScore) }}>
            {stats.latestScore}
          </p>
          <p className="text-lg font-medium mt-1" style={{ color: getScoreColor(stats.latestScore) }}>
            {getScoreLabel(stats.latestScore)}
          </p>
        </div>
      )}

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 gap-3">
        <DashboardCard
          title="SpO2 promedio"
          value={stats.avgSpo2}
          unit="%"
          icon="🫁"
          color={stats.avgSpo2 !== null && stats.avgSpo2 < 90 ? '#ef4444' : '#22c55e'}
        />
        <DashboardCard
          title="Caminata"
          value={stats.avgWalkMinutes}
          unit="min"
          icon="🚶"
          color="#3b82f6"
        />
        <DashboardCard
          title="Energía"
          value={stats.avgEnergy}
          unit="/5"
          icon="⚡"
          color="#f59e0b"
        />
        <DashboardCard
          title="Peso"
          value={stats.lastWeight}
          unit="kg"
          icon="⚖️"
          color="#8b5cf6"
        />
      </div>

      {/* Gráficos */}
      <ChartWidget
        data={stats.chartData}
        dataKey="spo2"
        title="📈 Saturación (últimos 7 días)"
        color="#22c55e"
        unit="%"
      />
      <ChartWidget
        data={stats.chartData}
        dataKey="score"
        title="📈 Score de salud"
        color="#3b82f6"
      />
      <ChartWidget
        data={stats.chartData}
        dataKey="caminata"
        title="📈 Minutos caminados"
        color="#f59e0b"
        unit=" min"
      />

      {stats.totalRecords === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-5xl mb-3">📋</p>
          <p className="text-lg">Aún no hay registros</p>
          <p className="text-base">Vaya a &quot;Registro&quot; para comenzar</p>
        </div>
      )}
    </div>
  );
}
