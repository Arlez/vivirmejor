import type { HealthRecord, Alert } from '@/types/HealthRecord';
import { db } from './db';

export async function generateAlerts(record: HealthRecord): Promise<Alert[]> {
  const alerts: Alert[] = [];

  if (record.spo2Walk !== null && record.spo2Walk < 88) {
    alerts.push({
      type: 'danger',
      message: '⚠️ Saturación baja al caminar',
      detail: `Su SpO2 caminando es ${record.spo2Walk}%. Consulte a su médico si persiste.`,
    });
  }

  if (record.spo2Rest !== null && record.spo2Rest < 90) {
    alerts.push({
      type: 'danger',
      message: '⚠️ Saturación baja en reposo',
      detail: `Su SpO2 en reposo es ${record.spo2Rest}%. Vigile y consulte si baja más.`,
    });
  }

  if (record.weight !== null) {
    const recentRecords = await db.records
      .where('date')
      .above(getDateDaysAgo(3))
      .toArray();

    if (recentRecords.length >= 2) {
      const oldWeight = recentRecords.find(r => r.weight !== null)?.weight;
      if (oldWeight && record.weight - oldWeight > 2) {
        alerts.push({
          type: 'warning',
          message: '⚠️ Aumento de peso significativo',
          detail: `Ha subido ${(record.weight - oldWeight).toFixed(1)} kg en pocos días. Podría indicar retención de líquidos.`,
        });
      }
    }
  }

  if (record.energyLevel <= 2) {
    alerts.push({
      type: 'warning',
      message: '⚡ Energía muy baja',
      detail: 'Su nivel de energía es bajo. Descanse y consulte si persiste.',
    });
  }

  if (record.breathDifficulty >= 4) {
    alerts.push({
      type: 'warning',
      message: '😮‍💨 Dificultad respiratoria alta',
      detail: 'Nivel alto de dificultad para respirar. Considere usar oxígeno y consulte.',
    });
  }

  return alerts;
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}
