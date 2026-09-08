// Especificación ejecutable de la rúbrica: 8 criterios oficiales, las 10
// observaciones de una prueba de 50 m en piscina de 25 m, y los criterios que
// se observan dos veces (ida y vuelta). Portado 1:1 desde el prototipo
// (Natación VITTA.dc.html), que es la fuente de verdad de estos valores.

export const ESTILOS = ['Crol', 'Espalda', 'Pecho', 'Mariposa'] as const;
export type Estilo = (typeof ESTILOS)[number];

export interface Criterio {
  name: string;
  hint: string;
  d1: string;
  d2: string;
  d3: string;
}

export const CRITERIA: readonly Criterio[] = [
  {
    name: 'Salida',
    hint: 'Reacción, impulso y entrada',
    d1: 'No reacciona a la señal; entra de pie o desequilibrado, casi sin impulso.',
    d2: 'Reacciona con demora; impulso débil y entrada plana que frena el avance.',
    d3: 'Reacción inmediata, extensión completa de piernas y entrada hidrodinámica en flecha.',
  },
  {
    name: 'Sub acuático',
    hint: 'Flecha y ondulación bajo el agua',
    d1: 'Emerge de inmediato; no logra posición de flecha ni aprovecha el impulso.',
    d2: 'Mantiene la flecha un instante y pierde alineación de cabeza o brazos.',
    d3: 'Flecha alineada y sostenida, con patada ondulatoria continua desde la cadera.',
  },
  {
    name: 'Break out',
    hint: 'Transición del agua a la superficie',
    d1: 'Sale a la superficie sin brazada, deteniendo por completo el avance.',
    d2: 'Coordina la salida pero pierde velocidad al emerger; brazada tardía.',
    d3: 'Transición fluida: la primera brazada empieza justo antes de emerger, sin frenar.',
  },
  {
    name: 'Respiración',
    hint: 'Momento, lado y efecto en el cuerpo',
    d1: 'Levanta la cabeza al frente y detiene el avance; respira sin ritmo.',
    d2: 'Respira al lado, con ritmo irregular y leve pérdida de alineación.',
    d3: 'Respiración lateral rítmica y bilateral, sin alterar la posición del cuerpo.',
  },
  {
    name: 'Brazadas',
    hint: 'Agarre, tracción y recobro',
    d1: 'Los brazos cruzan la línea media; recorrido incompleto y codo caído.',
    d2: 'Recorrido completo, con agarre inconsistente y recobro tenso.',
    d3: 'Agarre firme con codo alto, tracción completa hasta la cadera y recobro relajado.',
  },
  {
    name: 'Patadas',
    hint: 'Origen, amplitud y continuidad',
    d1: 'Patea desde la rodilla, con tobillo rígido y sin propulsión.',
    d2: 'Patea desde la cadera pero con amplitud irregular y pausas.',
    d3: 'Patada continua desde la cadera, tobillo suelto y amplitud constante.',
  },
  {
    name: 'Viraje',
    hint: 'Aproximación, giro y empuje',
    d1: 'Toca y se detiene; se incorpora y parte sin empuje de pared.',
    d2: 'Ejecuta el viraje completo con pérdida evidente de velocidad.',
    d3: 'Viraje compacto, pies bien apoyados, empuje potente y salida en flecha.',
  },
  {
    name: 'Llegada',
    hint: 'Última brazada y toque final',
    d1: 'Desacelera varios metros antes y toca sin control.',
    d2: 'Llega sin ajustar la última brazada; toque impreciso.',
    d3: 'Mantiene la velocidad, ajusta la última brazada y toca según la norma del estilo.',
  },
];

export type CriterioIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ObsKey =
  | 'salida'
  | 'sub1'
  | 'bo1'
  | 'resp'
  | 'braz'
  | 'pat'
  | 'vir'
  | 'sub2'
  | 'bo2'
  | 'lleg';

export type EtiquetaObs = '' | 'Ida' | 'Vuelta';

export interface ObsRow {
  key: ObsKey;
  criterioIndex: CriterioIndex;
  group: string;
  dist: string;
  tag: EtiquetaObs;
  where: string;
}

// Piscina de 25 m: los 50 m son dos largos, con sub acuático y break out
// observados dos veces (tras la salida y tras el viraje).
export const ROWS: readonly ObsRow[] = [
  { key: 'salida', criterioIndex: 0, group: 'Partida · largo 1', dist: '0 – 15 m', tag: '', where: 'Poyete y entrada al agua' },
  { key: 'sub1', criterioIndex: 1, group: 'Partida · largo 1', dist: '0 – 15 m', tag: 'Ida', where: 'Bajo el agua tras la partida' },
  { key: 'bo1', criterioIndex: 2, group: 'Partida · largo 1', dist: '0 – 15 m', tag: 'Ida', where: 'Al emerger, antes de los 15 m' },
  { key: 'resp', criterioIndex: 3, group: 'Nado · largo 1', dist: '15 – 25 m', tag: '', where: 'Nado continuo hacia la pared' },
  { key: 'braz', criterioIndex: 4, group: 'Nado · largo 1', dist: '15 – 25 m', tag: '', where: 'Nado continuo hacia la pared' },
  { key: 'pat', criterioIndex: 5, group: 'Nado · largo 1', dist: '15 – 25 m', tag: '', where: 'Nado continuo hacia la pared' },
  { key: 'vir', criterioIndex: 6, group: 'Viraje', dist: '25 m', tag: '', where: 'Pared de los 25 m' },
  { key: 'sub2', criterioIndex: 1, group: 'Largo 2', dist: '25 – 40 m', tag: 'Vuelta', where: 'Bajo el agua tras el viraje' },
  { key: 'bo2', criterioIndex: 2, group: 'Largo 2', dist: '25 – 40 m', tag: 'Vuelta', where: 'Al emerger después del viraje' },
  { key: 'lleg', criterioIndex: 7, group: 'Llegada', dist: '50 m', tag: '', where: 'Última brazada y toque final' },
];

// Los criterios que se observan dos veces (ida y vuelta) consolidan su valor
// oficial como floor(mean(...)) — ver official() en calculo.ts.
export const DUAL: Readonly<Record<number, readonly ObsKey[]>> = {
  1: ['sub1', 'sub2'],
  2: ['bo1', 'bo2'],
};
