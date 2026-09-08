import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily, tracking } from '../../theme';
import { SyncChip } from './SyncChip';

export function Header({ titulo }: { titulo: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 14 }]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>UMCE · Pedagogía en Ed. Física</Text>
          <Text style={styles.titulo}>{titulo}</Text>
        </View>
        <SyncChip />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.navy,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  eyebrow: {
    fontFamily: fontFamily.condensed700,
    fontSize: 10,
    letterSpacing: tracking(10, 0.18),
    textTransform: 'uppercase',
    color: colors.onNavyEyebrow,
    marginBottom: 4,
  },
  titulo: {
    fontFamily: fontFamily.barlow600,
    fontSize: 19,
    color: '#fff',
  },
});
