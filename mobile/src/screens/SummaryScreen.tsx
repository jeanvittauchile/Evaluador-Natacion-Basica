import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/ui/Header';
import { CtaButton, SecondaryButton } from '../components/ui/Buttons';
import { colors, fontFamily, radius } from '../theme';
import { useNavigation } from '../navigation/NavigationContext';
import { estudiantesRepo, evaluacionesRepo } from '../db';
import { CRITERIA, DUAL, ESTILOS } from '../domain/rubric';
import { ESCALA_LABEL, nota, official, promedio } from '../domain/calculo';
import type { ParamsPorPantalla } from '../navigation/types';

export function SummaryScreen({ params }: { params: ParamsPorPantalla['summary'] }) {
  const { estudianteId, estilo, evaluacionId } = params;
  const { irATab, volver } = useNavigation();

  const estudiante = useMemo(() => estudiantesRepo.obtenerEstudiante(estudianteId), [estudianteId]);
  const registro = useMemo(() => evaluacionesRepo.obtenerPorId(evaluacionId), [evaluacionId]);
  const otras = useMemo(() => evaluacionesRepo.listarPorEstudiante(estudianteId), [estudianteId]);

  if (!estudiante || !registro) return null;
  const { evaluacion, scores } = registro;

  const notaEstilo = nota(evaluacion.puntaje, evaluacion.puntaje_max, evaluacion.exigencia);
  const notaGeneral = promedio(otras.map((e) => ({ puntaje: e.puntaje, max: e.puntaje_max, exigenciaPct: e.exigencia })));
  const estilosEvaluados = ESTILOS.filter((e) => otras.some((ev) => ev.estilo === e));
  const off = official(scores);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={['bottom']}>
      <Header titulo="Resumen del estilo" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.notaCard}>
          <Text style={styles.eyebrow}>{estilo} · nota del estilo</Text>
          <Text style={styles.notaGrande}>{notaEstilo}</Text>
          <Text style={styles.contexto}>
            {evaluacion.puntaje} de {evaluacion.puntaje_max} puntos · {ESCALA_LABEL[evaluacion.escala]} · exigencia {evaluacion.exigencia}%
          </Text>
          <View style={styles.separador} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={styles.notaGeneralLabel}>Nota general del estudiante</Text>
            <Text style={styles.notaGeneralValor}>{notaGeneral}</Text>
          </View>
          <Text style={styles.promedioDetalle}>
            Promedio de {estilosEvaluados.join(' y ')}
            {evaluacion.incompleta ? ` · ${estilo} incompleta` : ''}
          </Text>
        </View>

        <View style={styles.detalleCard}>
          {CRITERIA.map((c, i) => {
            const valor = off[i];
            const dualKeys = DUAL[i];
            return (
              <View key={c.name} style={styles.detalleFila}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detalleNombre}>{c.name}</Text>
                  {dualKeys ? (
                    <Text style={styles.detalleDual}>
                      ida / vuelta {scores[dualKeys[0]] ?? '·'} / {scores[dualKeys[1]] ?? '·'}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.barraTrack}>
                  <View style={[styles.barraFill, { width: `${((valor ?? 0) / 3) * 100}%` }]} />
                </View>
                <Text style={styles.detalleValor}>{valor === null ? 'N/O' : valor}</Text>
              </View>
            );
          })}
          <Text style={styles.detallePie}>Sub acuático y break out se observan dos veces (ida y vuelta) y se consolidan al promedio.</Text>
        </View>

        {evaluacion.dirty === 1 && (
          <View style={styles.colaCard}>
            <Text style={styles.colaTitulo}>En cola para Google Sheets</Text>
            <Text style={styles.colaTexto}>
              Se subirá a «Evaluaciones Natación {evaluacion.asignatura} {new Date(evaluacion.evaluado_en).getFullYear()}» apenas haya conexión.
            </Text>
          </View>
        )}

        <View style={{ gap: 10 }}>
          <CtaButton titulo="Guardar y evaluar al siguiente" onPress={() => irATab('home', undefined)} tono="action" />
          <SecondaryButton titulo="Volver a corregir" onPress={volver} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 18, paddingBottom: 26, gap: 13 },
  notaCard: { backgroundColor: colors.navy, borderRadius: 15, padding: 20 },
  eyebrow: { fontFamily: fontFamily.barlow600, fontSize: 12.5, color: colors.onNavyEyebrow },
  notaGrande: { fontFamily: fontFamily.condensed700, fontSize: 52, color: '#fff' },
  contexto: { fontFamily: fontFamily.barlow400, fontSize: 12.5, color: colors.onNavyText },
  separador: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.18)', marginVertical: 16, paddingTop: 14 },
  notaGeneralLabel: { fontFamily: fontFamily.barlow600, fontSize: 12.5, color: colors.onNavyEyebrow },
  notaGeneralValor: { fontFamily: fontFamily.condensed700, fontSize: 29, color: '#fff' },
  promedioDetalle: { fontFamily: fontFamily.barlow400, fontSize: 12, color: colors.onNavyText, marginTop: 4 },
  detalleCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.1)',
    borderRadius: radius.card,
    paddingHorizontal: 14,
  },
  detalleFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22,48,91,.07)',
  },
  detalleNombre: { fontFamily: fontFamily.barlow500, fontSize: 14, color: colors.bodyText },
  detalleDual: { fontFamily: fontFamily.barlow400, fontSize: 10.5, color: colors.tertiaryText },
  barraTrack: { width: 66, height: 8, borderRadius: 100, backgroundColor: colors.barTrack, overflow: 'hidden' },
  barraFill: { height: 8, borderRadius: 100, backgroundColor: colors.action },
  detalleValor: { width: 30, textAlign: 'right', fontFamily: fontFamily.condensed700, fontSize: 15, color: colors.navy },
  detallePie: { fontFamily: fontFamily.barlow400, fontSize: 11, color: colors.tertiaryText, paddingVertical: 10 },
  colaCard: {
    backgroundColor: colors.amberWarnBg,
    borderWidth: 1,
    borderColor: 'rgba(224,169,60,.5)',
    borderRadius: radius.card,
    padding: 14,
    paddingHorizontal: 16,
    gap: 4,
  },
  colaTitulo: { fontFamily: fontFamily.barlow600, fontSize: 14, color: colors.navy },
  colaTexto: { fontFamily: fontFamily.barlow400, fontSize: 12.5, color: colors.earthText },
});
