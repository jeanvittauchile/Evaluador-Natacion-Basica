import { CRITERIA, ROWS } from '../rubric';
import { calcularPuntaje, nota, notaDeEstilo, official, promedio, type Scores } from '../calculo';

function scoresCompletos(valor: 1 | 2 | 3): Scores {
  const sc: Scores = {};
  for (const row of ROWS) sc[row.key] = valor;
  return sc;
}

describe('nota()', () => {
  it('da 2,7 en el puntaje mínimo, escala 30 (10 pts, todas las obs en 1)', () => {
    // El mínimo real no es 0: cada observación vale al menos 1, así que
    // pts=10 cae por debajo del punto de exigencia (18) pero no en el piso de la escala.
    expect(nota(10, 30, 60)).toBe('2,7');
  });

  it('da 7,0 en el puntaje máximo, escala 30', () => {
    expect(nota(30, 30, 60)).toBe('7,0');
  });

  it('da 2,7 en el puntaje mínimo, escala 24 (8 pts, todos los criterios en 1)', () => {
    expect(nota(8, 24, 60)).toBe('2,7');
  });

  it('da 7,0 en el puntaje máximo, escala 24', () => {
    expect(nota(24, 24, 60)).toBe('7,0');
  });

  it('da exactamente 4,0 en el punto de exigencia (60% de 30 = 18)', () => {
    expect(nota(18, 30, 60)).toBe('4,0');
  });

  it('da exactamente 4,0 en el punto de exigencia con otra exigencia (50% de 24 = 12)', () => {
    expect(nota(12, 24, 50)).toBe('4,0');
  });
});

describe('calcularPuntaje() — prueba incompleta', () => {
  it('reduce max a nObservadas * 3 en la escala de 30, sin contar N/O como 0', () => {
    // Solo 6 de las 10 observaciones registradas.
    const sc: Scores = { salida: 3, sub1: 2, bo1: 2, resp: 3, braz: 2, pat: 1 };
    const r = calcularPuntaje(sc, '30', true);
    expect(r.completadas).toBe(6);
    expect(r.max).toBe(18); // 6 * 3, no 30
    expect(r.puntaje).toBe(3 + 2 + 2 + 3 + 2 + 1);
  });

  it('reduce max a nObservadas * 3 en la escala de 24 (sobre criterios oficiales)', () => {
    // Solo salida, sub acuático (ida) y break out (ida) observados: 3 criterios oficiales.
    const sc: Scores = { salida: 3, sub1: 2, bo1: 1 };
    const r = calcularPuntaje(sc, '24', true);
    expect(r.completadas).toBe(3);
    expect(r.max).toBe(9); // 3 * 3, no 24
  });

  it('con prueba completa, max vuelve a ser 30/24 sin importar incompleta=false', () => {
    const r30 = calcularPuntaje(scoresCompletos(2), '30', false);
    expect(r30.max).toBe(30);
    const r24 = calcularPuntaje(scoresCompletos(2), '24', false);
    expect(r24.max).toBe(24);
  });
});

describe('promedio() — nota general con estilos de distinto max', () => {
  it('promedia las NOTAS resultantes, no los puntajes brutos', () => {
    // Crol: prueba completa, escala 30 → nota(24, 30, 60) = 5,5
    // Espalda: prueba incompleta, max reducido a 18 → nota(18, 18, 60) = 7,0 (puntaje = max observado)
    const crol = { puntaje: 24, max: 30 };
    const espalda = { puntaje: 18, max: 18 };
    expect(nota(crol.puntaje, crol.max, 60)).toBe('5,5');
    expect(nota(espalda.puntaje, espalda.max, 60)).toBe('7,0');
    // Promedio de notas (5,5 + 7,0) / 2 = 6,25 → 6,3 — nunca promedio de 24 y 18 sobre un max común.
    expect(promedio([crol, espalda], 60)).toBe('6,3');
  });

  it('devuelve — cuando no hay estilos evaluados', () => {
    expect(promedio([])).toBe('—');
  });
});

describe('official() — consolidación de sub acuático y break out', () => {
  it('usa floor(mean(ida, vuelta)) cuando ambas observaciones existen', () => {
    const sc: Scores = { sub1: 3, sub2: 2, bo1: 3, bo2: 3 };
    const off = official(sc);
    // Sub acuático es el criterio índice 1: floor(mean(3,2)) = floor(2.5) = 2
    expect(off[1]).toBe(2);
    // Break out es el criterio índice 2: floor(mean(3,3)) = 3
    expect(off[2]).toBe(3);
  });

  it('usa el único valor disponible si solo se registró ida o vuelta', () => {
    const sc: Scores = { sub1: 2 };
    expect(official(sc)[1]).toBe(2);
  });

  it('devuelve null cuando ninguna de las dos observaciones existe', () => {
    expect(official({})[1]).toBeNull();
    expect(official({})[2]).toBeNull();
  });

  it('toma el valor directo para los criterios sin doble observación', () => {
    const sc: Scores = { salida: 3, resp: 1, lleg: 2 };
    const off = official(sc);
    expect(off[0]).toBe(3); // Salida
    expect(off[3]).toBe(1); // Respiración
    expect(off[7]).toBe(2); // Llegada
  });

  it('produce exactamente 8 valores, uno por criterio oficial', () => {
    expect(official({})).toHaveLength(CRITERIA.length);
  });
});

describe('notaDeEstilo()', () => {
  it('nunca es un literal: se deriva de calcularPuntaje() + nota()', () => {
    const sc = scoresCompletos(3);
    expect(notaDeEstilo(sc, '30', false, 60)).toBe(nota(30, 30, 60));
  });
});
