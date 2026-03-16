import type { HealthRecord } from '@/types/HealthRecord';

export function healthScore(record: HealthRecord): number {
  let score = 0;

  // Saturación en reposo (0-30 puntos)
  if (record.spo2Rest !== null) {
    if (record.spo2Rest >= 95) score += 30;
    else if (record.spo2Rest >= 92) score += 20;
    else if (record.spo2Rest >= 88) score += 10;
    else score += 0;
  }

  // Energía (0-25 puntos) - escala 1-5
  score += (record.energyLevel / 5) * 25;

  // Dificultad respiratoria inversa (0-25 puntos) - escala 1-5
  score += ((5 - record.breathDifficulty) / 4) * 25;

  // Actividad física (0-20 puntos)
  if (record.walkMinutes !== null) {
    if (record.walkMinutes >= 20) score += 20;
    else if (record.walkMinutes >= 10) score += 15;
    else if (record.walkMinutes >= 5) score += 10;
    else score += 5;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return 'Buen estado';
  if (score >= 40) return 'Atención';
  return 'Alerta';
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function exportToCSV(records: HealthRecord[]): string {
  const headers = [
    'Fecha', 'SpO2 Reposo', 'SpO2 Caminar', 'Min Caminados',
    'Oxígeno', 'Frecuencia Cardíaca', 'Presión Arterial',
    'Peso', 'Energía', 'Dif. Respiratoria', 'Síntomas', 'Notas'
  ];

  const rows = records.map(r => [
    r.date,
    r.spo2Rest ?? '',
    r.spo2Walk ?? '',
    r.walkMinutes ?? '',
    r.oxygenUsed ? 'Sí' : 'No',
    r.heartRate ?? '',
    r.bloodPressure,
    r.weight ?? '',
    r.energyLevel,
    r.breathDifficulty,
    r.symptoms.join('; '),
    r.notes
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function exportToJSON(records: HealthRecord[]): string {
  return JSON.stringify(records, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
