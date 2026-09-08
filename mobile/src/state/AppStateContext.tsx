import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { sesionRepo, colaSyncRepo, type Config, type Sesion } from '../db';

export type EstadoSync = 'Sin conexión' | 'Sincronizando' | 'Al día';

interface AppStateValue {
  sesion: Sesion;
  config: Config;
  actualizarSesion: (patch: Partial<Sesion>) => void;
  actualizarConfig: (patch: Partial<Config>) => void;
  /** Se incrementa en cada escritura relevante; las pantallas lo usan como dependencia para releer SQLite. */
  dbTick: number;
  tocarDb: () => void;
  estadoSync: EstadoSync;
  setEstadoSync: (e: EstadoSync) => void;
  pendientes: number;
  refrescarPendientes: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesionState] = useState<Sesion>(() => sesionRepo.obtenerSesion());
  const [config, setConfigState] = useState<Config>(() => sesionRepo.obtenerConfig());
  const [dbTick, setDbTick] = useState(0);
  const [estadoSync, setEstadoSync] = useState<EstadoSync>('Sin conexión');
  const [pendientes, setPendientes] = useState(0);

  const tocarDb = useCallback(() => setDbTick((t) => t + 1), []);

  const actualizarSesion = useCallback((patch: Partial<Sesion>) => {
    setSesionState(sesionRepo.actualizarSesion(patch));
  }, []);

  const actualizarConfig = useCallback((patch: Partial<Config>) => {
    setConfigState(sesionRepo.actualizarConfig(patch));
  }, []);

  const refrescarPendientes = useCallback(() => {
    setPendientes(colaSyncRepo.contarPendientes());
  }, []);

  useEffect(() => {
    refrescarPendientes();
  }, [dbTick, refrescarPendientes]);

  const value = useMemo<AppStateValue>(
    () => ({
      sesion,
      config,
      actualizarSesion,
      actualizarConfig,
      dbTick,
      tocarDb,
      estadoSync,
      setEstadoSync,
      pendientes,
      refrescarPendientes,
    }),
    [sesion, config, actualizarSesion, actualizarConfig, dbTick, tocarDb, estadoSync, pendientes, refrescarPendientes]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState debe usarse dentro de AppStateProvider');
  return ctx;
}
