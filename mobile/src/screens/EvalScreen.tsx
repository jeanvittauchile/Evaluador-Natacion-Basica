import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/ui/Header';
import { CtaButton } from '../components/ui/Buttons';
import { ScoreButton } from '../components/ui/ScoreButton';
import { colors, fontFamily, radius, tracking } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useNavigation } from '../navigation/NavigationContext';
import { estudiantesRepo, evaluacionesRepo, type Evaluacion } from '../db';
import { CRITERIA, ROWS, type ObsKey } from '../domain/rubric';
import { nota, type Puntaje1a3, type Scores } from '../domain/calculo';
import { triggerSync } from '../services/sync/worker';
import type { ParamsPorPantalla } from '../navigation/types';

const NIVELES: { valor: Puntaje1a3; label: string; color: string }[] = [
  { valor: 1, label: 'No log.', color: colors.red },
  { valor: 2, label: 'Median.', color: colors.amber },
  { valor: 3, label: 'Logrado', color: colors.green },
];

export function EvalScreen({ params }: { params: ParamsPorPantalla['eval'] }) {
  const { estudianteId, estilo } = params;
  const { sesion, config, tocarDb, setEstadoSync } = useAppState();
  const { navegar, volver } = useNavigation();

  const estudiante = useMemo(() => estudiantesRepo.obtenerEstudiante(estudianteId), [estudianteId]);
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [scores, setScores] = useState<Scores>({});
  const [open, setOpen] = useState<ObsKey | null>(null);

  useEffect(() => {
    const borrador = evaluacionesRepo.obtenerOCrearBorrador(estudianteId, estilo, sesion, config.escala, config.exigencia);
    setEvaluacion(borrador.evaluacion);
    setScores(borrador.scores);
    tocarDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estudianteId, estilo]);

  if (!evaluacion || !estudiante) return null;

  const completadas = Object.keys(scores).length;
  const total = ROWS.length;
  const notaParcial = nota(evaluacion.puntaje, evaluacion.puntaje_max, evaluacion.exigencia);
  const incompleta = evaluacion.incompleta === 1;

  function onPuntaje(key: ObsKey, valor: Puntaje1a3) {
    const actualizada = evaluacionesRepo.guardarPuntaje(evaluacion!.id, key, valor);
    setEvaluacion(actualizada);
    setScores((s) => ({ ...s, [key]: valor }));
    tocarDb();
    if (config.auto_avance) setOpen(null);
  }

  function onToggleIncompleta() {
    const actualizada = evaluacionesRepo.setIncompleta(evaluacion!.id, !incompleta);
    setEvaluacion(actualizada);
    tocarDb();
  }

  function onCerrar() {
    const puedeCompletar = incompleta || completadas === total;
    if (!puedeCompletar) return;
    evaluacionesRepo.cerrarEvaluacion(evaluacion!.id);
    tocarDb();
    triggerSync(setEstadoSync);
    navegar('summary', { estudianteId, estilo, evaluacionId: evaluacion!.id });
  }

  const ctaTexto = incompleta
    ? `Cerrar prueba incompleta · nota ${notaParcial}`
    : completadas === total
    ? `Cerrar evaluación · nota ${notaParcial}`
    : `Faltan ${total - completadas} observaciones`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={['bottom']}>
      <Header titulo="Evaluación en terreno" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.contextBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contextTitle}>
              {estudiante.nombre} {estudiante.apellidos} · 50 m {estilo}
            </Text>
            <Text style={styles.contextSub}>
              {completadas} de {total} observaciones · nota parcial {notaParcial}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.puntajeGrande}>
              {evaluacion.puntaje}
              <Text style={styles.puntajeMax}>/{evaluacion.puntaje_max}</Text>
            </Text>
            <Text style={styles.puntajeLabel}>Puntaje</Text>
          </View>
        </View>

        {!incompleta ? (
          <Pressable onPress={onToggleIncompleta} style={styles.incompletaBtn}>
            <Text style={styles.incompletaBtnText}>Marcar prueba incompleta (no terminó los 50 m)</Text>
          </Pressable>
        ) : (
          <View style={styles.incompletaCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.incompletaTitulo}>Prueba incompleta</Text>
              <Pressable onPress={onToggleIncompleta}>
                <Text style={styles.deshacer}>Deshacer</Text>
              </Pressable>
            </View>
            <Text style={styles.incompletaTexto}>
              Se registraron {completadas} de {total} observaciones. La nota se calcula sobre el puntaje máximo observado.
            </Text>
          </View>
        )}

        <View style={styles.colHeaderRow}>
          <Text style={styles.colHeaderLabel}>Criterio · toca para ver la rúbrica</Text>
          <View style={styles.colHeaderNums}>
            {NIVELES.map((n) => (
              <Text key={n.valor} style={[styles.colHeaderNum, { color: n.color }]}>
                {n.label}
              </Text>
            ))}
          </View>
        </View>

        {ROWS.map((row, i) => {
          const mostrarFase = i === 0 || row.group !== ROWS[i - 1].group;
          const criterio = CRITERIA[row.criterioIndex];
          const abierta = open === row.key;
          const valorActual = scores[row.key];
          return (
            <React.Fragment key={row.key}>
              {mostrarFase && (
                <View style={styles.faseHeader}>
                  <Text style={styles.faseNombre}>{row.group}</Text>
                  <View style={styles.faseLinea} />
                  <Text style={styles.faseDist}>{row.dist}</Text>
                </View>
              )}
              <View style={styles.fila}>
                <View style={styles.filaContenido}>
                  <Pressable style={{ flex: 1 }} onPress={() => setOpen(abierta ? null : row.key)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.criterioNombre}>{criterio.name}</Text>
                      {row.tag ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{row.tag}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.criterioWhere}>{row.where}</Text>
                  </Pressable>
                  <View style={styles.scoreRow}>
                    {NIVELES.map((n) => (
                      <ScoreButton
                        key={n.valor}
                        valor={n.valor}
                        seleccionado={valorActual === n.valor}
                        onPress={(v) => onPuntaje(row.key, v)}
                      />
                    ))}
                  </View>
                </View>
                {abierta && (
                  <View style={styles.rubricaDesplegada}>
                    {(['d1', 'd2', 'd3'] as const).map((d, idx) => (
                      <View key={d} style={styles.rubricaLinea}>
                        <View style={[styles.rubricaBox, { backgroundColor: NIVELES[idx].color }]}>
                          <Text style={styles.rubricaBoxText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.rubricaDesc}>{criterio[d]}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>

      <View style={styles.ctaContainer}>
        <CtaButton titulo={ctaTexto} onPress={onCerrar} />
        <Text style={styles.ctaNota}>Guardado local automático en cada toque.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 14, paddingHorizontal: 16, paddingBottom: 20, gap: 7 },
  contextBar: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.12)',
    borderRadius: radius.card,
    padding: 11,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  contextTitle: { fontFamily: fontFamily.barlow600, fontSize: 15.5, color: colors.navy },
  contextSub: { fontFamily: fontFamily.barlow400, fontSize: 11.5, color: colors.tertiaryText, marginTop: 2 },
  puntajeGrande: { fontFamily: fontFamily.condensed700, fontSize: 22, color: colors.navy },
  puntajeMax: { fontSize: 13, color: colors.tertiaryText },
  puntajeLabel: { fontFamily: fontFamily.barlow400, fontSize: 10, color: colors.tertiaryText },
  incompletaBtn: {
    borderWidth: 1,
    borderColor: 'rgba(180,85,63,.45)',
    borderStyle: 'dashed',
    borderRadius: 11,
    padding: 10,
    alignItems: 'center',
    marginBottom: 5,
  },
  incompletaBtnText: { fontFamily: fontFamily.barlow600, fontSize: 12.5, color: colors.red },
  incompletaCard: {
    backgroundColor: colors.redAlertBg,
    borderWidth: 1,
    borderColor: 'rgba(180,85,63,.45)',
    borderRadius: radius.card,
    padding: 12,
    paddingHorizontal: 14,
    marginBottom: 5,
    gap: 4,
  },
  incompletaTitulo: { fontFamily: fontFamily.barlow600, fontSize: 13.5, color: colors.redAlertDark },
  deshacer: { fontFamily: fontFamily.barlow600, fontSize: 12, color: colors.redAlertDark, textDecorationLine: 'underline' },
  incompletaTexto: { fontFamily: fontFamily.barlow400, fontSize: 12, color: colors.redAlertDarker },
  colHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  colHeaderLabel: {
    fontFamily: fontFamily.condensed600,
    fontSize: 9.5,
    letterSpacing: tracking(9.5, 0.08),
    textTransform: 'uppercase',
    color: colors.tertiaryText,
    flex: 1,
  },
  colHeaderNums: { flexDirection: 'row', gap: 7 },
  colHeaderNum: { width: 52, textAlign: 'center', fontFamily: fontFamily.condensed600, fontSize: 9.5 },
  faseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 2 },
  faseNombre: {
    fontFamily: fontFamily.condensed700,
    fontSize: 10,
    letterSpacing: tracking(10, 0.14),
    textTransform: 'uppercase',
    color: colors.action,
  },
  faseLinea: { flex: 1, height: 1, backgroundColor: 'rgba(22,48,91,.14)' },
  faseDist: { fontFamily: fontFamily.condensed600, fontSize: 10, color: colors.tertiaryText },
  fila: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.1)',
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  filaContenido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    padding: 6,
    paddingLeft: 12,
    paddingRight: 8,
  },
  criterioNombre: { fontFamily: fontFamily.barlow600, fontSize: 14.5, color: colors.navy },
  criterioWhere: { fontFamily: fontFamily.barlow400, fontSize: 11, color: colors.tertiaryText, marginTop: 2 },
  badge: { backgroundColor: colors.badgeBg, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  badgeText: {
    fontFamily: fontFamily.condensed700,
    fontSize: 9,
    letterSpacing: tracking(9, 0.1),
    textTransform: 'uppercase',
    color: colors.linkText,
  },
  scoreRow: { flexDirection: 'row', gap: 7 },
  rubricaDesplegada: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(22,48,91,.08)',
    backgroundColor: colors.rubricBg,
    padding: 11,
    paddingHorizontal: 12,
    gap: 8,
  },
  rubricaLinea: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  rubricaBox: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  rubricaBoxText: { fontFamily: fontFamily.condensed700, fontSize: 12, color: '#fff' },
  rubricaDesc: { flex: 1, fontFamily: fontFamily.barlow400, fontSize: 12.5, color: colors.earthTextAlt },
  ctaContainer: { padding: 16, paddingTop: 10 },
  ctaNota: { fontFamily: fontFamily.barlow400, fontSize: 12, color: colors.tertiaryText, textAlign: 'center', marginTop: 8 },
});
