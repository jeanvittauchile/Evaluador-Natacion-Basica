import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fontsToLoad } from './src/theme/typography';
import { colors } from './src/theme/colors';
import { runMigrations } from './src/db';
import { NavigationProvider } from './src/navigation/NavigationContext';
import { AppStateProvider, useAppState } from './src/state/AppStateContext';
import { Router } from './src/navigation/Router';
import { startSyncWorker } from './src/services/sync/worker';

function SyncWorkerBridge() {
  const { setEstadoSync } = useAppState();
  useEffect(() => startSyncWorker({ setEstadoSync }), [setEstadoSync]);
  return null;
}

export default function App() {
  const [fontsLoaded] = useFonts(fontsToLoad);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    try {
      runMigrations();
      setDbReady(true);
    } catch (e) {
      setDbError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  if (!fontsLoaded || (!dbReady && !dbError)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.navy} size="large" />
      </View>
    );
  }

  if (dbError) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <NavigationProvider>
          <SyncWorkerBridge />
          <View style={styles.app}>
            <StatusBar style="light" />
            <Router />
          </View>
        </NavigationProvider>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.screenBg,
  },
  app: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
});
