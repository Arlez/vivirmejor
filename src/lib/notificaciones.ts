import type { BloqueTask } from '@/types/HealthRecord';

// ─── Mensajes por tarea ───────────────────────────────────────────────────────
const MENSAJES: Record<string, { titulo: string; cuerpo: string }> = {
  prednisona: {
    titulo: '💊 Medicación – Mañana',
    cuerpo: 'Es momento de tomar Prednisona y Micofenolato. Tómalos con el desayuno.',
  },
  anoro: {
    titulo: '💨 Inhalador Anoro',
    cuerpo: 'Es momento de usar el Inhalador Anoro. Siéntate e inhala lentamente.',
  },
  bisoprolol: {
    titulo: '💊 Medicación – Noche',
    cuerpo: 'Es momento de tomar Bisoprolol y Amlodipino. Medicación nocturna.',
  },
};

// ─── Registro de timeouts activos ────────────────────────────────────────────
const timeoutsActivos: ReturnType<typeof setTimeout>[] = [];

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Solicita permiso para enviar notificaciones al navegador.
 * Requiere HTTPS (o localhost). Retorna true si se concedió.
 */
export async function solicitarPermiso(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const resultado = await Notification.requestPermission();
  return resultado === 'granted';
}

/**
 * Programa los recordatorios de medicación usando setTimeout.
 * Cancela cualquier programación previa antes de re-registrar.
 * Solo agenda tareas que aún NO estén completadas.
 */
export function programarNotificaciones(bloques: BloqueTask[]): void {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // Cancelar timeouts previos
  timeoutsActivos.forEach(t => clearTimeout(t));
  timeoutsActivos.length = 0;

  const tareasPendientes = bloques.filter(
    b => b.idTask in MENSAJES && !b.completada
  );

  for (const tarea of tareasPendientes) {
    const ms = msHastaHora(tarea.hora);
    if (ms < 0) continue; // ya pasó hoy

    const notif = MENSAJES[tarea.idTask];
    const t = setTimeout(() => {
      try {
        // Primero intenta con Service Worker (funciona en background)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            titulo: notif.titulo,
            cuerpo: notif.cuerpo,
            tag: tarea.idTask,
          });
        } else {
          // Fallback: API Notification directa (solo funciona con app abierta)
          new Notification(notif.titulo, {
            body: notif.cuerpo,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: tarea.idTask,
            requireInteraction: true,
          });
        }
      } catch {
        // Silencioso en caso de permisos revocados en tiempo de ejecución
      }
    }, ms);

    timeoutsActivos.push(t);
  }
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

/** Retorna los milisegundos hasta la hora indicada (formato "HH:MM") hoy. */
function msHastaHora(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  const ahora = new Date();
  const objetivo = new Date();
  objetivo.setHours(h, m, 0, 0);
  return objetivo.getTime() - ahora.getTime();
}
