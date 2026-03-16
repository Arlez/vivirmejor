'use client';

import MedicationReminder from '@/components/MedicationReminder';

export default function MedicacionPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💊 Medicación</h1>
      <p className="text-base text-gray-500 dark:text-gray-400">
        Marque cada dosis cuando la tome
      </p>
      <MedicationReminder />
    </div>
  );
}
