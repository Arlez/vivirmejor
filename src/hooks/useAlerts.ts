'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HealthRecord, Alert } from '@/types/HealthRecord';
import { generateAlerts } from '@/lib/alerts';

export function useAlerts(record: HealthRecord | undefined) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const checkAlerts = useCallback(async (rec: HealthRecord) => {
    const result = await generateAlerts(rec);
    setAlerts(result);
  }, []);

  useEffect(() => {
    if (record) {
      checkAlerts(record);
    } else {
      setAlerts([]);
    }
  }, [record, checkAlerts]);

  return alerts;
}
