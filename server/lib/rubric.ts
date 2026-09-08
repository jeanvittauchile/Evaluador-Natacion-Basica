// Duplicado de mobile/src/domain/rubric.ts (solo los textos, para escribir la
// hoja "Rúbrica" al crear la planilla) — ver nota en types.ts.

export const CRITERIA_HOJA_RUBRICA: { name: string; d1: string; d2: string; d3: string }[] = [
  {
    name: 'Salida',
    d1: 'No reacciona a la señal; entra de pie o desequilibrado, casi sin impulso.',
    d2: 'Reacciona con demora; impulso débil y entrada plana que frena el avance.',
    d3: 'Reacción inmediata, extensión completa de piernas y entrada hidrodinámica en flecha.',
  },
  {
    name: 'Sub acuático',
    d1: 'Emerge de inmediato; no logra posición de flecha ni aprovecha el impulso.',
    d2: 'Mantiene la flecha un instante y pierde alineación de cabeza o brazos.',
    d3: 'Flecha alineada y sostenida, con patada ondulatoria continua desde la cadera.',
  },
  {
    name: 'Break out',
    d1: 'Sale a la superficie sin brazada, deteniendo por completo el avance.',
    d2: 'Coordina la salida pero pierde velocidad al emerger; brazada tardía.',
    d3: 'Transición fluida: la primera brazada empieza justo antes de emerger, sin frenar.',
  },
  {
    name: 'Respiración',
    d1: 'Levanta la cabeza al frente y detiene el avance; respira sin ritmo.',
    d2: 'Respira al lado, con ritmo irregular y leve pérdida de alineación.',
    d3: 'Respiración lateral rítmica y bilateral, sin alterar la posición del cuerpo.',
  },
  {
    name: 'Brazadas',
    d1: 'Los brazos cruzan la línea media; recorrido incompleto y codo caído.',
    d2: 'Recorrido completo, con agarre inconsistente y recobro tenso.',
    d3: 'Agarre firme con codo alto, tracción completa hasta la cadera y recobro relajado.',
  },
  {
    name: 'Patadas',
    d1: 'Patea desde la rodilla, con tobillo rígido y sin propulsión.',
    d2: 'Patea desde la cadera pero con amplitud irregular y pausas.',
    d3: 'Patada continua desde la cadera, tobillo suelto y amplitud constante.',
  },
  {
    name: 'Viraje',
    d1: 'Toca y se detiene; se incorpora y parte sin empuje de pared.',
    d2: 'Ejecuta el viraje completo con pérdida evidente de velocidad.',
    d3: 'Viraje compacto, pies bien apoyados, empuje potente y salida en flecha.',
  },
  {
    name: 'Llegada',
    d1: 'Desacelera varios metros antes y toca sin control.',
    d2: 'Llega sin ajustar la última brazada; toque impreciso.',
    d3: 'Mantiene la velocidad, ajusta la última brazada y toca según la norma del estilo.',
  },
];
