import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../../theme';
import { useAppState } from '../../state/AppStateContext';

export function SyncChip() {
  const { estadoSync } = useAppState();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (estadoSync !== 'Sincronizando') {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: 550, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 550, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [estadoSync, opacity]);

  return (
    <View style={styles.chip}>
      <Animated.View style={[styles.dot, { opacity }]} />
      <Text style={styles.label}>{estadoSync}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,.12)',
    borderRadius: 100,
    paddingVertical: 5,
    paddingLeft: 8,
    paddingRight: 10,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.amberWarn,
  },
  label: {
    fontFamily: fontFamily.barlow600,
    fontSize: 11.5,
    color: colors.onActionChip,
  },
});
