import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ParamsPorPantalla, Ruta, ScreenName } from './types';

interface NavContextValue {
  current: Ruta;
  puedeVolver: boolean;
  navegar: <S extends ScreenName>(screen: S, params: ParamsPorPantalla[S]) => void;
  volver: () => void;
  irATab: <S extends ScreenName>(screen: S, params: ParamsPorPantalla[S]) => void;
}

const NavigationContext = createContext<NavContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Ruta[]>([{ screen: 'home', params: undefined } as Ruta]);

  const navegar = useCallback(<S extends ScreenName>(screen: S, params: ParamsPorPantalla[S]) => {
    setStack((s) => [...s, { screen, params } as Ruta]);
  }, []);

  const volver = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  // Los tabs de la barra inferior reinician la pila (no se acumulan sobre el flujo de evaluación).
  const irATab = useCallback(<S extends ScreenName>(screen: S, params: ParamsPorPantalla[S]) => {
    setStack([{ screen, params } as Ruta]);
  }, []);

  const value = useMemo<NavContextValue>(
    () => ({ current: stack[stack.length - 1], puedeVolver: stack.length > 1, navegar, volver, irATab }),
    [stack, navegar, volver, irATab]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation debe usarse dentro de NavigationProvider');
  return ctx;
}
