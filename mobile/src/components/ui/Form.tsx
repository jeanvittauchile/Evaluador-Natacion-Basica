import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fontFamily, radius, tracking } from '../../theme';

export function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  help?: string;
}

export function TextField({ label, error, help, style, ...props }: TextFieldProps) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        placeholderTextColor={error ? colors.faintTextAlt : colors.faintText}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : help ? <Text style={styles.help}>{help}</Text> : null}
    </View>
  );
}

const SECCIONES = ['Sección 1', 'Sección 2', 'Sección 3'] as const;

export function SectionPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View>
      <FieldLabel>Sección</FieldLabel>
      <View style={styles.seccionRow}>
        {SECCIONES.map((s) => {
          const activo = value === s;
          return (
            <Text
              key={s}
              onPress={() => onChange(s)}
              style={[styles.seccionBtn, activo ? styles.seccionBtnActivo : styles.seccionBtnInactivo]}
            >
              {s.replace('Sección ', 'Sección ')}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

export function ProgressBar({ progreso, alto = 6 }: { progreso: number; alto?: number }) {
  const pct = Math.max(0, Math.min(1, progreso)) * 100;
  return (
    <View style={[styles.track, { height: alto, borderRadius: alto / 2 }]}>
      <View style={[styles.fill, { width: `${pct}%`, height: alto, borderRadius: alto / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.condensed600,
    fontSize: 11,
    letterSpacing: tracking(11, 0.14),
    textTransform: 'uppercase',
    color: colors.tertiaryText,
    marginBottom: 7,
  },
  input: {
    width: '100%',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.2)',
    borderRadius: radius.card,
    padding: 14,
    fontFamily: fontFamily.barlow500,
    fontSize: 16,
    color: colors.navy,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: colors.red,
  },
  error: {
    fontFamily: fontFamily.barlow500,
    fontSize: 12.5,
    color: colors.red,
    marginTop: 6,
  },
  help: {
    fontFamily: fontFamily.barlow400,
    fontSize: 12,
    color: colors.tertiaryText,
    marginTop: 6,
  },
  seccionRow: { flexDirection: 'row', gap: 8 },
  seccionBtn: {
    flex: 1,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.16)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
    fontFamily: fontFamily.barlow600,
    fontSize: 14,
    overflow: 'hidden',
  },
  seccionBtnActivo: { backgroundColor: colors.navy, color: '#fff' },
  seccionBtnInactivo: { backgroundColor: colors.cardBg, color: '#28374F' },
  track: { width: '100%', backgroundColor: colors.barTrack },
  fill: { backgroundColor: colors.actionLight },
});
