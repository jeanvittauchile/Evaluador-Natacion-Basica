import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, fontFamily, radius } from '../../theme';

interface PrimaryButtonProps {
  titulo: string;
  subtitulo?: string;
  onPress: () => void;
  chevron?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({ titulo, subtitulo, onPress, chevron, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      disabled={disabled}
      android_ripple={{ color: 'rgba(255,255,255,.15)' }}
      style={[styles.primary, disabled && styles.disabled]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.primaryTitle}>{titulo}</Text>
        {subtitulo ? <Text style={styles.primarySubtitle}>{subtitulo}</Text> : null}
      </View>
      {chevron ? <ChevronRight size={20} color="#fff" /> : null}
    </Pressable>
  );
}

export function SecondaryButton({ titulo, onPress }: { titulo: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      android_ripple={{ color: 'rgba(22,48,91,.08)' }}
      style={styles.secondary}
    >
      <Text style={styles.secondaryTitle}>{titulo}</Text>
    </Pressable>
  );
}

export function CtaButton({ titulo, onPress, tono = 'navy' }: { titulo: string; onPress: () => void; tono?: 'navy' | 'action' }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      android_ripple={{ color: 'rgba(255,255,255,.15)' }}
      style={[styles.cta, { backgroundColor: tono === 'navy' ? colors.navy : colors.action }]}
    >
      <Text style={styles.ctaTitle}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.action,
    borderRadius: radius.cardLg,
    paddingVertical: 17,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disabled: { opacity: 0.5 },
  primaryTitle: { fontFamily: fontFamily.barlow600, fontSize: 17, color: '#fff' },
  primarySubtitle: { fontFamily: fontFamily.barlow400, fontSize: 12.5, color: colors.onActionChipAlt, marginTop: 2 },
  secondary: {
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.2)',
    borderRadius: radius.card,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryTitle: { fontFamily: fontFamily.barlow600, fontSize: 15, color: colors.linkText },
  cta: {
    borderRadius: radius.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaTitle: { fontFamily: fontFamily.barlow600, fontSize: 16, color: '#fff' },
});
