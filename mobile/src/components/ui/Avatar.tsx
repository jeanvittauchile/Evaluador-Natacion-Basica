import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius } from '../../theme';

function iniciales(nombre: string, apellidos: string): string {
  const a = apellidos.trim().charAt(0).toUpperCase();
  const n = nombre.trim().charAt(0).toUpperCase();
  return `${a}${n}` || '?';
}

export function Avatar({ nombre, apellidos, size = 40 }: { nombre: string; apellidos: string; size?: number }) {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size >= 44 ? radius.card : radius.avatar },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.34 }]}>{iniciales(nombre, apellidos)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily.barlow700,
    color: colors.linkText,
  },
});
