// Tokens de color — README §"Design Tokens › Colores". Valores finales del
// sistema de diseño; no aproximar ni recalcular.

export const colors = {
  // Azules (marca / acción)
  navy: '#16305B',
  action: '#2E7FB8',
  actionLight: '#4A96C4',
  linkText: '#1F4C86',
  onNavyEyebrow: '#8FBBDD',
  onNavyText: '#B9CDE2',
  onActionChip: '#DCE8F4',
  onActionChipAlt: '#D6E8F5',
  avatarBg: '#E4EDF5',
  badgeBg: '#E0EAF3',

  // Fondo / crema
  screenBg: '#F7F4E9',
  cardBg: '#FFFCF4',
  rubricBg: '#F4F0E2',
  reportCellBg: '#F2EFE3',
  barTrack: '#EAE4D2',

  // Texto neutro
  bodyText: '#28374F',
  tertiaryText: '#8A8270',
  faintText: '#B5AE9B',
  faintTextAlt: '#B0A896',
  earthText: '#5C5340',
  earthTextAlt: '#4A4534',

  // Rojo · No logrado / errores / reprobado
  red: '#B4553F',
  redBg: '#FBF1EC',
  redOnRedText: '#FFF4EE',
  redOnRedTextAlt: '#F3D9CF',
  redOnRedTextAlt2: '#F0C9B9',
  redAlertDark: '#8A3A26',
  redAlertDarker: '#6B3223',
  redAlertBg: '#F8E9E2',

  // Ámbar · Medianamente logrado / avisos
  amber: '#9A7A28',
  amberBg: '#FBF6EA',
  amberOnAmberText: '#FFF9EC',
  amberOnAmberTextAlt: '#F2E5C4',
  amberWarn: '#E0A93C',
  amberWarnBg: '#FBF7EC',

  // Verde · Logrado / aprobado
  green: '#1B6E7C',
  greenBg: '#EDF5F6',
  greenOnGreenText: '#EFF9FA',
  greenOnGreenTextAlt: '#CFE8EB',
} as const;

export const borders = {
  row: 'rgba(22,48,91,.1)',
  card: 'rgba(22,48,91,.12)',
  inputSoft: 'rgba(22,48,91,.14)',
  input: 'rgba(22,48,91,.16)',
  inputStrong: 'rgba(22,48,91,.2)',
  dashed: 'rgba(22,48,91,.32)',
  onNavy: 'rgba(255,255,255,.18)',
  onNavyStrong: 'rgba(255,255,255,.35)',
  amberWarn: 'rgba(224,169,60,.5)',
} as const;

/** Colores de los tres niveles de puntaje (1 No logrado · 2 Medianamente · 3 Logrado). */
export const nivel = {
  1: { fg: colors.red, bg: colors.redBg, border: 'rgba(180,85,63,.35)', onSelected: colors.redOnRedText },
  2: { fg: colors.amber, bg: colors.amberBg, border: 'rgba(154,122,40,.35)', onSelected: colors.amberOnAmberText },
  3: { fg: colors.green, bg: colors.greenBg, border: 'rgba(27,110,124,.35)', onSelected: colors.greenOnGreenText },
} as const;
