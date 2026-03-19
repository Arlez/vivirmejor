export interface HealthRecord {
  id?: number;
  date: string;
  spo2Rest: number | null;
  spo2Walk: number | null;
  walkMinutes: number | null;
  oxygenUsed: boolean;
  heartRate: number | null;
  bloodPressure: string;
  weight: number | null;
  energyLevel: number;
  breathDifficulty: number;
  symptoms: string[];
  notes: string;
}

export interface DailyPlanItem {
  hora: string;
  actividad: string;
  instrucciones: string;
  icono: string;
  completada?: boolean;
}

export interface BloqueTask {
  idTask: string;
  titulo: string;
  hora: string;
  completada: boolean;
  categoria: 'med' | 'ejercicio' | 'salud';
  instrucciones?: string;
}

export interface PlanDiario {
  id: string; // "YYYY-MM-DD" — clave primaria
  timestamp: number;
  bloques: BloqueTask[];
}

export interface MedicationDose {
  id?: number;
  medicationId: string;
  date: string;
  hora: string;
  taken: boolean;
  takenAt?: string;
}

export interface Alert {
  type: 'danger' | 'warning' | 'info';
  message: string;
  detail?: string;
}
