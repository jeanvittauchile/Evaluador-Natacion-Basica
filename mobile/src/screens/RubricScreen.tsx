import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/ui/Header';
import { colors, fontFamily, radius } from '../theme';
import { CRITERIA } from '../domain/rubric';

const NIVEL_COLOR = [colors.red, colors.amber, colors.green];

export function RubricScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={[]}>
      <Header titulo="Rúbrica de natación" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.nota}>
          Referencia para una prueba de 50 m en piscina de 25 m (dos largos): sub acuático y break out se observan dos veces
          (ida y vuelta tras el viraje). En pecho y mariposa, el viraje y la llegada exigen toque simultáneo con ambas manos.
        </Text>
        {CRITERIA.map((c, i) => (
          <View key={c.name} style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={styles.numero}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.nombre}>{c.name}</Text>
            </View>
            <View style={{ gap: 8, marginTop: 10 }}>
              {(['d1', 'd2', 'd3'] as const).map((d, idx) => (
                <View key={d} style={styles.linea}>
                  <View style={[styles.box, { backgroundColor: NIVEL_COLOR[idx] }]}>
                    <Text style={styles.boxText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.desc}>{c[d]}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 16, paddingBottom: 26, gap: 9 },
  nota: { fontFamily: fontFamily.barlow400, fontSize: 13, color: colors.earthText, marginBottom: 6 },
  card: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.1)',
    borderRadius: radius.card,
    padding: 14,
    paddingHorizontal: 16,
  },
  numero: { fontFamily: fontFamily.condensed700, fontSize: 13, color: colors.onNavyEyebrow },
  nombre: { fontFamily: fontFamily.barlow600, fontSize: 16.5, color: colors.navy },
  linea: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  box: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  boxText: { fontFamily: fontFamily.condensed700, fontSize: 12, color: '#fff' },
  desc: { flex: 1, fontFamily: fontFamily.barlow400, fontSize: 12.5, color: colors.earthTextAlt },
});
