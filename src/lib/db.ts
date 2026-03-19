import Dexie, { type Table } from 'dexie';
import type { HealthRecord, MedicationDose, BloqueTask, PlanDiario } from '@/types/HealthRecord';
import { todayString } from './calculations';

export interface PlanCompletion {
  id?: number;
  date: string;
  activityIndex: number;
  completada: boolean;
}

// ─── Plan base según protocolo médico ────────────────────────────────────────
const PLAN_BASE_TAREAS: Omit<BloqueTask, 'completada'>[] = [
  // MAÑANA
  { idTask: 'despertar',   titulo: 'Despertar y Estiramientos',  hora: '09:00', categoria: 'salud',     instrucciones: 'Levántese despacio. Estire los brazos antes de ponerse de pie.' },
  { idTask: 'resp-am',     titulo: 'Respiración Diafragmática',  hora: '09:10', categoria: 'ejercicio', instrucciones: '5 minutos de respiración controlada sentado en la cama.' },
  { idTask: 'desayuno',    titulo: 'Desayuno',                   hora: '09:30', categoria: 'salud',     instrucciones: 'Avena con frutas, o pan integral con huevo. Beber agua.' },
  { idTask: 'prednisona',  titulo: 'Prednisona / Micofenolato',  hora: '09:45', categoria: 'med',       instrucciones: 'Tomar con el desayuno. Verificar que no haya síntomas nuevos.' },
  { idTask: 'colacion-am', titulo: 'Colación de Fruta',         hora: '11:30', categoria: 'salud',     instrucciones: 'Una fruta fresca: manzana, pera o plátano.' },
  // TARDE
  { idTask: 'almuerzo',    titulo: 'Almuerzo',                   hora: '13:00', categoria: 'salud',     instrucciones: 'Proteína + verduras + carbohidrato integral. Comer despacio.' },
  { idTask: 'descanso',    titulo: 'Descanso / Siesta',          hora: '14:00', categoria: 'salud',     instrucciones: 'Reposo de 30-45 minutos. Puede hacer siesta corta.' },
  { idTask: 'registro',    titulo: 'Registro de Salud',          hora: '15:00', categoria: 'salud',     instrucciones: 'Registrar saturación, presión y cómo se siente.' },
  { idTask: 'anoro',       titulo: 'Inhalador Anoro',            hora: '16:00', categoria: 'med',       instrucciones: 'Administrar inhalador sentado, inhalar lentamente.' },
  { idTask: 'caminata',    titulo: 'Caminata Terapéutica',       hora: '17:00', categoria: 'ejercicio', instrucciones: '15-20 min de caminata suave. Llevar oxígeno si es necesario.' },
  { idTask: 'piernas',     titulo: 'Ejercicios de Piernas',      hora: '17:20', categoria: 'ejercicio', instrucciones: 'Bombeo de pantorrillas sentado. 2 series de 15 repeticiones.' },
  { idTask: 'colacion-pm', titulo: 'Colación de Tarde',         hora: '18:00', categoria: 'salud',     instrucciones: 'Yogur natural o puñado de nueces.' },
  // NOCHE
  { idTask: 'cena',        titulo: 'Cena Ligera',                hora: '20:30', categoria: 'salud',     instrucciones: 'Sopa de verduras o ensalada con proteína. Evitar sal.' },
  { idTask: 'resp-pm',     titulo: 'Respiración Relajante',      hora: '22:00', categoria: 'ejercicio', instrucciones: '10 minutos de respiración 4-4-6 acostado en la cama.' },
  { idTask: 'bisoprolol',  titulo: 'Bisoprolol / Amlodipino',   hora: '22:30', categoria: 'med',       instrucciones: 'Tomar medicamentos de la noche según prescripción médica.' },
];

// ─── Base de datos ────────────────────────────────────────────────────────────
class VivirMejorDB extends Dexie {
  records!: Table<HealthRecord, number>;
  medicationDoses!: Table<MedicationDose, number>;
  planCompletions!: Table<PlanCompletion, number>;
  planDiario!: Table<PlanDiario, string>;

  constructor() {
    super('VivirMejorDB');
    this.version(1).stores({
      records: '++id, date',
      medicationDoses: '++id, date, medicationId',
      planCompletions: '++id, date, activityIndex',
    });
    this.version(2).stores({
      records: '++id, date',
      medicationDoses: '++id, date, medicationId',
      planCompletions: '++id, date, activityIndex',
      planDiario: '&id',
    });
  }
}

export const db = new VivirMejorDB();

// ─── Lógica de sincronización diaria ─────────────────────────────────────────

/**
 * Verifica si ya existe un plan para hoy en IndexedDB.
 * - Si no existe: genera el plan base y lo guarda.
 * - Si existe: carga el progreso actual.
 */
export async function inicializarPlan(): Promise<PlanDiario> {
  const hoy = todayString();
  const existente = await db.planDiario.get(hoy);
  if (existente) return existente;

  const nuevo: PlanDiario = {
    id: hoy,
    timestamp: Date.now(),
    bloques: PLAN_BASE_TAREAS.map(t => ({ ...t, completada: false })),
  };
  await db.planDiario.add(nuevo);
  return nuevo;
}

/** Alterna el estado completada/pendiente de una tarea del plan de hoy. */
export async function toggleTarea(idTask: string): Promise<void> {
  const hoy = todayString();
  const plan = await db.planDiario.get(hoy);
  if (!plan) return;
  const bloques = plan.bloques.map(b =>
    b.idTask === idTask ? { ...b, completada: !b.completada } : b
  );
  await db.planDiario.update(hoy, { bloques });
}

