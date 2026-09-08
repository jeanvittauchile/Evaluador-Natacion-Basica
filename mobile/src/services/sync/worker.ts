import NetInfo from '@react-native-community/netinfo';
import { AppState as RNAppState } from 'react-native';
import { colaSyncRepo, estudiantesRepo, evaluacionesRepo } from '../../db';
import { ROWS } from '../../domain/rubric';
import { sheetsClient, SheetsSyncError, type FilaEvaluacionSheet } from '../sheets';
import type { EstadoSync } from '../../state/AppStateContext';

interface WorkerDeps {
  setEstadoSync: (e: EstadoSync) => void;
}

let ejecutando = false;
let timer: ReturnType<typeof setInterval> | null = null;

function construirFila(evaluacionId: string): FilaEvaluacionSheet | null {
  const registro = evaluacionesRepo.obtenerPorId(evaluacionId);
  if (!registro) return null;
  const estudiante = estudiantesRepo.obtenerEstudiante(registro.evaluacion.estudiante_id);
  if (!estudiante) return null;
  const { evaluacion, scores } = registro;
  return {
    id_local: evaluacion.id,
    fecha: evaluacion.evaluado_en,
    asignatura: evaluacion.asignatura,
    seccion: evaluacion.seccion,
    estudiante: `${estudiante.apellidos}, ${estudiante.nombre}`,
    rut: estudiante.rut,
    estilo: evaluacion.estilo,
    distancia_m: evaluacion.distancia_m,
    piscina_m: evaluacion.piscina_m,
    observaciones: ROWS.map((r) => scores[r.key] ?? null),
    puntaje: evaluacion.puntaje,
    puntaje_max: evaluacion.puntaje_max,
    nota: evaluacion.nota,
    incompleta: evaluacion.incompleta === 1,
    exigencia: evaluacion.exigencia,
    evaluador: evaluacion.evaluador,
    lugar: evaluacion.lugar,
  };
}

/** Validación de integridad antes de enviar — README §"Estrategia de errores", punto 8. */
function validarIntegridad(fila: FilaEvaluacionSheet): string | null {
  const valores = fila.observaciones.filter((v) => v !== null) as number[];
  if (valores.some((v) => v < 1 || v > 3)) return 'Puntaje fuera de rango 1–3';
  if (!fila.incompleta && fila.observaciones.some((v) => v === null)) return 'Prueba marcada completa con observaciones N/O';
  if (fila.nota < 1 || fila.nota > 7) return 'Nota fuera de rango 1,0–7,0';
  if (fila.puntaje_max <= 0) return 'puntaje_max inválido';
  return null;
}

async function enviarUno(item: { id: number; evaluacion_id: string; intentos: number }): Promise<void> {
  colaSyncRepo.marcarEnviando(item.id);
  try {
    const fila = construirFila(item.evaluacion_id);
    if (!fila) {
      colaSyncRepo.marcarError(item.id, item.intentos, { reintentable: false, motivo: 'Evaluación no encontrada localmente' });
      return;
    }
    const problema = validarIntegridad(fila);
    if (problema) {
      colaSyncRepo.marcarError(item.id, item.intentos, { reintentable: false, motivo: problema });
      return;
    }
    await sheetsClient.upsertEvaluacion(fila);
    colaSyncRepo.marcarOk(item.id, item.evaluacion_id);
  } catch (e) {
    const err = e instanceof SheetsSyncError ? e : new SheetsSyncError(String(e), { reintentable: true });
    colaSyncRepo.marcarError(item.id, item.intentos, {
      reintentable: err.reintentable,
      motivo: err.message,
      requiereReauth: err.requiereReauth,
    });
  }
}

export async function runSyncCycle(setEstadoSync: (e: EstadoSync) => void): Promise<void> {
  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    setEstadoSync('Sin conexión');
    return;
  }
  const listas = colaSyncRepo.listarPendientesListas();
  if (!listas.length) {
    setEstadoSync(colaSyncRepo.contarPendientes() > 0 ? 'Sincronizando' : 'Al día');
    return;
  }
  if (ejecutando) return;
  ejecutando = true;
  setEstadoSync('Sincronizando');
  for (const item of listas) {
    await enviarUno(item);
  }
  ejecutando = false;
  setEstadoSync(colaSyncRepo.contarPendientes() > 0 ? 'Sincronizando' : 'Al día');
}

/** Dispara un ciclo inmediato — se usa al cerrar una evaluación con red disponible. */
export function triggerSync(setEstadoSync: (e: EstadoSync) => void): void {
  runSyncCycle(setEstadoSync);
}

/** Arranca los disparadores del worker: reconexión, foreground y timer cada 5 min. */
export function startSyncWorker({ setEstadoSync }: WorkerDeps): () => void {
  const netSub = NetInfo.addEventListener((state) => {
    if (state.isConnected) runSyncCycle(setEstadoSync);
    else setEstadoSync('Sin conexión');
  });
  const appSub = RNAppState.addEventListener('change', (state) => {
    if (state === 'active') runSyncCycle(setEstadoSync);
  });
  timer = setInterval(() => runSyncCycle(setEstadoSync), 5 * 60_000);
  runSyncCycle(setEstadoSync);

  return () => {
    netSub();
    appSub.remove();
    if (timer) clearInterval(timer);
  };
}
