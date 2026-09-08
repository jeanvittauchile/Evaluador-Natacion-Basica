import type { Estilo } from '../domain/rubric';

export type ScreenName =
  | 'home'
  | 'sesion'
  | 'students'
  | 'new'
  | 'style'
  | 'eval'
  | 'summary'
  | 'reporte'
  | 'rubric';

export interface ParamsPorPantalla {
  home: undefined;
  sesion: undefined;
  students: undefined;
  new: undefined;
  style: { estudianteId: string };
  eval: { estudianteId: string; estilo: Estilo };
  summary: { estudianteId: string; estilo: Estilo; evaluacionId: string };
  reporte: undefined;
  rubric: undefined;
}

export type Ruta = {
  [K in ScreenName]: { screen: K; params: ParamsPorPantalla[K] };
}[ScreenName];
