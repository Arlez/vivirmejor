'use client';

import { useState } from 'react';
import HealthForm from '@/components/HealthForm';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { generateAlerts } from '@/lib/alerts';
import type { HealthRecord, Alert } from '@/types/HealthRecord';

export default function RegistroPage() {
  const { addRecord, todayRecord, updateRecord } = useHealthRecords();
  const [saved, setSaved] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const handleSave = async (record: HealthRecord) => {
    if (todayRecord?.id) {
      await updateRecord(todayRecord.id, record);
    } else {
      await addRecord(record);
    }

    const newAlerts = await generateAlerts(record);
    setAlerts(newAlerts);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Registro diario</h1>
      <p className="text-base text-gray-500 dark:text-gray-400">
        Ingrese sus mediciones del día
      </p>

      {saved && (
        <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-400 text-green-700 dark:text-green-300 p-4 rounded-2xl text-center text-lg font-bold">
          ✅ Registro guardado exitosamente
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl text-base font-medium ${
                alert.type === 'danger'
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-400'
                  : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-400'
              }`}
            >
              <p className="font-bold">{alert.message}</p>
              {alert.detail && <p className="text-sm mt-1">{alert.detail}</p>}
            </div>
          ))}
        </div>
      )}

      <HealthForm
        initialData={todayRecord ?? undefined}
        onSave={handleSave}
      />
    </div>
  );
}
