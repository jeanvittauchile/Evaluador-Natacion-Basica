import { getDb } from '../client';
import type { Estudiante, Evaluacion } from '../types';
import { ESTILOS, type Estilo } from '../../domain/rubric';
import { nota, promedio } from '../../domain/calculo';

export interface FilaReporte {
  estudiante: Estudiante;
  notaPorEstilo: Partial<Record<Estilo, string>>;
  estilosEvaluados: number;
  notaGeneral: string; // '—' si no tiene evaluaciones
}

/** Última evaluación por estilo, para cada estudiante de la sección. */
function ultimasEvaluacionesPorSeccion(seccion: string): Map<string, Evaluacion[]> {
  const rows = getDb().getAllSync<Evaluacion>(
    `SELECT e.* FROM evaluacion e
     INNER JOIN (
       SELECT estudiante_id, estilo, MAX(actualizado_en) AS ultima
       FROM evaluacion WHERE seccion = ? GROUP BY estudiante_id, estilo
     ) mx ON mx.estudiante_id = e.estudiante_id AND mx.estilo = e.estilo AND mx.ultima = e.actualizado_en
     WHERE e.seccion = ?`,
    seccion,
    seccion
  );
  const porEstudiante = new Map<string, Evaluacion[]>();
  for (const row of rows) {
    const lista = porEstudiante.get(row.estudiante_id) ?? [];
    lista.push(row);
    porEstudiante.set(row.estudiante_id, lista);
  }
  return porEstudiante;
}

export function matrizSeccion(estudiantes: Estudiante[], seccion: string): FilaReporte[] {
  const porEstudiante = ultimasEvaluacionesPorSeccion(seccion);
  return estudiantes.map((estudiante) => {
    const evals = porEstudiante.get(estudiante.id) ?? [];
    const notaPorEstilo: Partial<Record<Estilo, string>> = {};
    for (const ev of evals) {
      notaPorEstilo[ev.estilo] = nota(ev.puntaje, ev.puntaje_max, ev.exigencia);
    }
    const notaGeneral = evals.length
      ? promedio(evals.map((ev) => ({ puntaje: ev.puntaje, max: ev.puntaje_max, exigenciaPct: ev.exigencia })))
      : '—';
    return { estudiante, notaPorEstilo, estilosEvaluados: evals.length, notaGeneral };
  });
}

export interface ResumenSeccion {
  promedioSeccion: string;
  conNota: number;
  total: number;
  pruebasRegistradas: number;
  bajoExigencia: number;
  sinEvaluar: number;
}

export function resumenSeccion(filas: FilaReporte[]): ResumenSeccion {
  const conNota = filas.filter((f) => f.estilosEvaluados > 0);
  const notasNum = conNota.map((f) => parseFloat(f.notaGeneral.replace(',', '.')));
  const promedioSeccion = notasNum.length
    ? (notasNum.reduce((a, b) => a + b, 0) / notasNum.length).toFixed(1).replace('.', ',')
    : '—';
  return {
    promedioSeccion,
    conNota: conNota.length,
    total: filas.length,
    pruebasRegistradas: filas.reduce((a, f) => a + f.estilosEvaluados, 0),
    bajoExigencia: notasNum.filter((n) => n < 4).length,
    sinEvaluar: filas.length - conNota.length,
  };
}

export { ESTILOS };
