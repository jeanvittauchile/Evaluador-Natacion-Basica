import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { nivel } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { radius, touch } from '../../theme/spacing';
import type { Puntaje1a3 } from '../../domain/calculo';

interface ScoreButtonProps {
  valor: Puntaje1a3;
  seleccionado: boolean;
  onPress: (valor: Puntaje1a3) => void;
}

/** Botón de puntaje: objetivo táctil de 52×52 — el evaluador toca sin mirar. */
export function ScoreButton({ valor, seleccionado, onPress }: ScoreButtonProps) {
  const colorSet = nivel[valor];
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress(valor);
      }}
      android_ripple={{ color: 'rgba(0,0,0,.08)' }}
      style={[
        styles.button,
        {
          backgroundColor: seleccionado ? colorSet.fg : colorSet.bg,
          borderColor: seleccionado ? colorSet.fg : colorSet.border,
        },
      ]}
    >
      <Text style={[styles.digit, { color: seleccionado ? colorSet.onSelected : colorSet.fg }]}>{valor}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touch.scoreButton,
    height: touch.scoreButton,
    borderRadius: radius.scoreButton,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontFamily: fontFamily.condensed700,
    fontSize: 21,
  },
});
