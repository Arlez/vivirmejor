'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Sun, CloudSun, Moon, Pill, Activity, Heart,
  CheckCircle2, Circle, AlertTriangle, Bell,
} from 'lucide-react';
import { db, inicializarPlan, toggleTarea } from '@/lib/db';
import { todayString } from '@/lib/calculations';
import { solicitarPermiso, programarNotificaciones, cancelarNotificaciones, desactivarNotificaciones, activarNotificaciones, notificacionesActivadasPersistentes } from '@/lib/notificaciones';
import type { BloqueTask } from '@/types/HealthRecord';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPeriodo(hora: string): 'mañana' | 'tarde' | 'noche' {
  const h = parseInt(hora.split(':')[0], 10);
  if (h < 12) return 'mañana';
  if (h < 20) return 'tarde';
  return 'noche';
}

// ─── Progreso Circular SVG ────────────────────────────────────────────────────

function CircularProgress({
  pct,
  completado,
  total,
}: {
  pct: number;
  completado: number;
  total: number;
}) {
  const r = 46;
  const circunferencia = 2 * Math.PI * r;
  const dash = (pct / 100) * circunferencia;
  const colorStroke = pct === 100 ? '#22c55e' : '#3b82f6';

  return (
    <svg
      className="w-32 h-32 drop-shadow-lg"
      viewBox="0 0 120 120"
      aria-label={`${pct}% completado`}
    >
      {/* Track */}
      <circle cx="60" cy="60" r={r} fill="none" stroke="#1e2d4a" strokeWidth="10" />
      {/* Progreso */}
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={colorStroke}
        strokeWidth="10"
        strokeDasharray={`${dash} ${circunferencia}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }}
      />
      {/* Porcentaje */}
      <text
        x="60"
        y="55"
        textAnchor="middle"
        fill="white"
        fontSize="23"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {pct}%
      </text>
      {/* Fracción */}
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fill="#64748b"
        fontSize="11"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {completado}/{total}
      </text>
    </svg>
  );
}

// ─── Icono por categoría ──────────────────────────────────────────────────────

function CategoriaIcon({ cat }: { cat: BloqueTask['categoria'] }) {
  if (cat === 'med') return <Pill className="w-4 h-4 text-purple-400 shrink-0" />;
  if (cat === 'ejercicio') return <Activity className="w-4 h-4 text-blue-400 shrink-0" />;
  return <Heart className="w-4 h-4 text-rose-400 shrink-0" />;
}

// ─── Configuración de períodos ────────────────────────────────────────────────

const PERIODOS = {
  mañana: { label: 'Mañana', Icon: Sun,      color: 'text-amber-400' },
  tarde:  { label: 'Tarde',  Icon: CloudSun,  color: 'text-orange-400' },
  noche:  { label: 'Noche',  Icon: Moon,      color: 'text-indigo-400' },
} as const;

// ─── Banner de refuerzo positivo ──────────────────────────────────────────────

function MensajeCompletado() {
  return (
    <div className="text-center rounded-3xl p-6 border border-green-700/40 bg-green-950/50 shadow-lg shadow-green-950/30">
      <div className="text-5xl mb-3" role="img" aria-label="Estrella">🌟</div>
      <p className="text-green-300 font-bold text-lg">¡Día completado!</p>
      <p className="text-green-400/80 text-sm mt-2 leading-relaxed">
        Tu cuerpo agradece el cuidado de hoy.
        <br />
        Estás fortaleciendo tu salud.
      </p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PlanDelDia() {
  const hoy = todayString();
  const [iniciado, setIniciado] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [notifPermiso, setNotifPermiso] = useState<NotificationPermission>('default');
  const [notifPersistenteActiva, setNotifPersistenteActiva] = useState(true);
  const prevPct = useRef(0);

  // Plan reactivo desde IndexedDB
  const plan = useLiveQuery(() => db.planDiario.get(hoy), [hoy]);

  // Último registro para detectar SpO₂ baja
  const ultimoRegistro = useLiveQuery(() => db.records.orderBy('id').last(), []);

  // Inicializar plan al montar (crea si no existe, carga si existe)
  useEffect(() => {
    inicializarPlan().then(() => setIniciado(true));
  }, []);

  // Detectar permiso de notificaciones actual
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermiso(Notification.permission);
    }
    try {
      setNotifPersistenteActiva(notificacionesActivadasPersistentes());
    } catch {}
  }, []);

  // Calcular progreso
  const bloques = plan?.bloques ?? [];
  const total = bloques.length;
  const completados = bloques.filter(b => b.completada).length;
  const pct = total > 0 ? Math.round((completados / total) * 100) : 0;

  // Alerta SpO₂ < 88 %
  const spo2Bajo = typeof ultimoRegistro?.spo2Rest === 'number' && ultimoRegistro.spo2Rest < 88;

  // Confetti al alcanzar 100 %
  useEffect(() => {
    if (pct === 100 && prevPct.current < 100 && iniciado) {
      import('canvas-confetti').then(mod =>
        mod.default({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a78bfa'],
        })
      );
    }
    prevPct.current = pct;
  }, [pct, iniciado]);

  // Programar notificaciones cada vez que el plan cambia
  useEffect(() => {
    if (plan && notifPermiso === 'granted') {
      programarNotificaciones(plan.bloques);
    }
  }, [plan, notifPermiso]);

  // Solicitar permiso de notificaciones
  const handleSolicitarNotif = useCallback(async () => {
    const concedido = await solicitarPermiso();
    const nuevoPermiso = concedido ? 'granted' : 'denied';
    setNotifPermiso(nuevoPermiso as NotificationPermission);
    if (concedido && plan) programarNotificaciones(plan.bloques);
  }, [plan]);

  const handleDesactivarNotif = useCallback(() => {
    desactivarNotificaciones();
    setNotifPersistenteActiva(false);
    setNotifPermiso('denied');
  }, []);

  const handleActivarNotif = useCallback(async () => {
    // Reactivar persistentemente la preferencia inmediatamente
    activarNotificaciones();
    setNotifPersistenteActiva(true);
    // Pedir permiso en segundo plano (no bloqueante para la UI)
    const concedido = await solicitarPermiso();
    setNotifPermiso(concedido ? 'granted' : 'denied');
    if (concedido && plan) programarNotificaciones(plan.bloques);
  }, [plan]);

  const handleToggleNotif = useCallback(() => {
    if (notifPersistenteActiva) {
      // Desactivar inmediatamente la preferencia y cancelar notifs
      desactivarNotificaciones();
      cancelarNotificaciones();
      setNotifPersistenteActiva(false);
      setNotifPermiso('denied');
    } else {
      // Reactiva la preferencia y solicita permiso en background
      activarNotificaciones();
      setNotifPersistenteActiva(true);
      // request permission asynchronously
      (async () => {
        const concedido = await solicitarPermiso();
        setNotifPermiso(concedido ? 'granted' : 'denied');
        if (concedido && plan) programarNotificaciones(plan.bloques);
      })();
    }
  }, [notifPersistenteActiva, plan]);

  // Alternar tarea
  const handleToggle = useCallback(
    async (idTask: string) => {
      if (toggling) return;
      setToggling(idTask);
      await toggleTarea(idTask);
      setToggling(null);
    },
    [toggling]
  );

  // Agrupar tareas por período
  const grupos = (['mañana', 'tarde', 'noche'] as const).map(p => ({
    periodo: p,
    tareas: bloques.filter(b => getPeriodo(b.hora) === p),
  }));

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!iniciado || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[55vh]">
        <div className="text-gray-500 dark:text-gray-400 animate-pulse font-medium">
          Cargando plan del día…
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-6">

      {/* ── Header: Progreso circular + info ────────────────────────────── */}
      <div
        className="rounded-3xl p-5 flex items-center gap-5 border"
        style={{ background: 'linear-gradient(135deg,#121826 0%,#151f30 100%)', borderColor: '#1e2d4a' }}
      >
        <CircularProgress pct={pct} completado={completados} total={total} />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-0.5">
            Vivir Mejor
          </p>
          <h2 className="text-xl font-bold text-white leading-tight">Plan del Día</h2>
          <p className="text-gray-500 text-sm mt-0.5 capitalize">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>

          {/* Botón de notificaciones */}
          <div className="mt-3">
            <button
              onClick={handleToggleNotif}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border active:scale-95 transition-all ${
                notifPersistenteActiva
                  ? 'text-green-400 border-green-400'
                  : 'text-red-400 border-red-400'
              }`}
              style={{
                backgroundColor: notifPersistenteActiva
                  ? 'rgba(34,197,94,0.18)' // verde-500 con opacidad
                  : 'rgba(239,68,68,0.18)' // rojo-500 con opacidad
              }}
            >
              <Bell className={`w-4 h-4 ${notifPersistenteActiva ? 'text-green-400' : 'text-red-400'}`} /> {notifPersistenteActiva ? 'Alertas Activadas' : 'Alertas Desactivadas'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Banner: SpO₂ baja ────────────────────────────────────────────── */}
      {spo2Bajo && (
        <div
          className="flex items-start gap-3 rounded-2xl p-4 border border-red-800/60"
          style={{ background: '#2d0a0a' }}
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-bold text-base">
              Saturación baja detectada
            </p>
            <p className="text-red-400/80 text-sm mt-1 leading-relaxed">
              Tu último registro de SpO₂ fue{' '}
              <strong className="text-red-300">{ultimoRegistro?.spo2Rest}%</strong>
              , por debajo del 88 %. La{' '}
              <strong>Caminata Terapéutica</strong> está desactivada hoy.
              Descansa y consulta a tu médico.
            </p>
          </div>
        </div>
      )}

      {/* ── Mensaje de completado 100 % ──────────────────────────────────── */}
      {pct === 100 && <MensajeCompletado />}

      {/* ── Timeline por período ─────────────────────────────────────────── */}
      {grupos.map(({ periodo, tareas }) => {
        if (tareas.length === 0) return null;
        const cfg = PERIODOS[periodo];

        return (
          <section key={periodo} aria-labelledby={`periodo-${periodo}`}>
            {/* Encabezado de período */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <cfg.Icon className={`w-5 h-5 ${cfg.color}`} />
              <h3
                id={`periodo-${periodo}`}
                className={`text-sm font-bold uppercase tracking-widest ${cfg.color}`}
              >
                {cfg.label}
              </h3>
            </div>

            {/* Tareas */}
            <div className="space-y-2.5">
              {tareas.map(tarea => {
                const esCaminata = tarea.idTask === 'caminata';
                const bloqueada = esCaminata && spo2Bajo;
                const enProgreso = toggling === tarea.idTask;

                return (
                  <button
                    key={tarea.idTask}
                    onClick={() => !bloqueada && handleToggle(tarea.idTask)}
                    disabled={bloqueada || enProgreso}
                    style={{ minHeight: '64px' }}
                    className={[
                      'w-full flex items-center gap-4 px-4 rounded-2xl text-left',
                      'transition-all duration-200 active:scale-[0.97] border',
                      tarea.completada
                        ? 'bg-green-950/50 border-green-800/50'
                        : bloqueada
                        ? 'pointer-events-none opacity-40 bg-gray-900/30 border-gray-800/30'
                        : 'bg-[#151f30] border-[#1e2d4a] hover:border-blue-700/60 hover:bg-[#192438]',
                      enProgreso ? 'opacity-60' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={tarea.completada}
                    aria-label={`${tarea.titulo}${tarea.completada ? ' – completada' : ''}`}
                  >
                    {/* Checkbox visual */}
                    <span className="shrink-0">
                      {tarea.completada ? (
                        <CheckCircle2 className="w-7 h-7 text-green-400" />
                      ) : (
                        <Circle className="w-7 h-7 text-gray-600" />
                      )}
                    </span>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-blue-400 tabular-nums">
                          {tarea.hora}
                        </span>
                        <CategoriaIcon cat={tarea.categoria} />
                        <span
                          className={`text-base font-semibold leading-tight ${
                            tarea.completada
                              ? 'text-green-400 line-through decoration-green-700'
                              : 'text-gray-100'
                          }`}
                        >
                          {tarea.titulo}
                        </span>
                        {bloqueada && (
                          <span className="text-xs text-red-400 font-medium">(SpO₂ baja)</span>
                        )}
                      </div>
                      {tarea.instrucciones && (
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                          {tarea.instrucciones}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
