'use client';

import { useState } from 'react';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { formatDate, healthScore, getScoreColor, exportToCSV, exportToJSON, downloadFile } from '@/lib/calculations';
import HealthForm from '@/components/HealthForm';
import type { HealthRecord } from '@/types/HealthRecord';

export default function HistorialPage() {
  const { records, updateRecord, getAllRecords } = useHealthRecords(90);
  const [editing, setEditing] = useState<HealthRecord | null>(null);

  const handleUpdate = async (record: HealthRecord) => {
    if (record.id) {
      await updateRecord(record.id, record);
    }
    setEditing(null);
  };

  const handleExportCSV = async () => {
    const all = await getAllRecords();
    const csv = exportToCSV(all);
    downloadFile(csv, `vivirmejor-datos-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  const handleExportJSON = async () => {
    const all = await getAllRecords();
    const json = exportToJSON(all);
    downloadFile(json, `vivirmejor-datos-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  if (editing) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">✏️ Editar registro</h1>
        <HealthForm
          initialData={editing}
          onSave={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📜 Historial</h1>

      {/* Botones de exportación */}
      <div className="flex gap-3">
        <button
          onClick={handleExportCSV}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-base font-bold py-3 px-4 rounded-2xl shadow active:scale-95 transition"
        >
          📄 Exportar CSV
        </button>
        <button
          onClick={handleExportJSON}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-base font-bold py-3 px-4 rounded-2xl shadow active:scale-95 transition"
        >
          📋 Exportar JSON
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-3">📜</p>
          <p className="text-lg">Sin registros aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(record => {
            const score = healthScore(record);
            return (
              <button
                key={record.id}
                onClick={() => setEditing(record)}
                className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-700 text-left active:scale-[0.98] transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    📅 {formatDate(record.date)}
                  </span>
                  <span
                    className="text-lg font-black px-3 py-1 rounded-full"
                    style={{
                      color: getScoreColor(score),
                      backgroundColor: getScoreColor(score) + '20',
                    }}
                  >
                    {score}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>🫁 SpO2: {record.spo2Rest ?? '--'}%</span>
                  <span>🚶 {record.walkMinutes ?? '--'} min</span>
                  <span>⚡ Energía: {record.energyLevel}/5</span>
                  <span>⚖️ {record.weight ?? '--'} kg</span>
                </div>
                {record.symptoms.length > 0 && (
                  <p className="text-sm text-red-400 mt-2">
                    Síntomas: {record.symptoms.length}
                  </p>
                )}
                <p className="text-xs text-blue-400 mt-2">Toque para editar →</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
