import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/ui/Header';
import { CtaButton } from '../components/ui/Buttons';
import { colors, fontFamily } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useNavigation } from '../navigation/NavigationContext';
import { estudiantesRepo, reporteRepo } from '../db';
import { ESTILOS } from '../domain/rubric';
import { sheetsClient } from '../services/sheets';

const INICIALES: Record<string, string> = { Crol: 'C', Espalda: 'E', Pecho: 'P', Mariposa: 'M' };

export function ReporteScreen() {
  const { sesion, dbTick } = useAppState();
  const { navegar } = useNavigation();
  const [exportando, setExportando] = useState(false);

  const estudiantes = useMemo(
    () => estudiantesRepo.listarEstudiantes(sesion.seccion),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sesion.seccion, dbTick]
  );
  const filas = useMemo(
    () => reporteRepo.matrizSeccion(estudiantes, sesion.seccion),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [estudiantes, sesion.seccion, dbTick]
  );
  const resumen = useMemo(() => reporteRepo.resumenSeccion(filas), [filas]);

  async function onExportar() {
    setExportando(true);
    try {
      await sheetsClient.regenerarReporte(
        sesion.asignatura,
        sesion.seccion,
        filas.map((f) => ({
          estudiante: `${f.estudiante.apellidos}, ${f.estudiante.nombre}`,
          crol: f.notaPorEstilo.Crol ?? null,
          espalda: f.notaPorEstilo.Espalda ?? null,
          pecho: f.notaPorEstilo.Pecho ?? null,
          mariposa: f.notaPorEstilo.Mariposa ?? null,
          notaGeneral: f.notaGeneral === '—' ? null : f.notaGeneral,
          estilosEvaluados: f.estilosEvaluados,
        }))
      );
      Alert.alert('Reporte exportado', 'La hoja «Reporte de notas» se actualizó en Google Sheets.');
    } catch {
      Alert.alert('No se pudo exportar', 'Se reintentará automáticamente cuando haya conexión.');
    } finally {
      setExportando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={[]}>
      <Header titulo="Reporte de notas" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.promedioCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={styles.eyebrowOnNavy}>Promedio de la sección</Text>
              <Text style={styles.promedioValor}>{resumen.promedioSeccion}</Text>
            </View>
            <View>
              <Text style={styles.promedioLinea}>
                {resumen.conNota} de {resumen.total} estudiantes con nota
              </Text>
              <Text style={styles.promedioLinea}>{resumen.pruebasRegistradas} pruebas de 50 m registradas</Text>
            </View>
          </View>
          <View style={styles.metricasRow}>
            <View>
              <Text style={styles.metricaLabel}>Bajo 4,0</Text>
              <Text style={styles.metricaValorRojo}>{resumen.bajoExigencia}</Text>
            </View>
            <View>
              <Text style={styles.metricaLabel}>Sin evaluar</Text>
              <Text style={styles.metricaValorBlanco}>{resumen.sinEvaluar}</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.headerEstudiante}>Estudiante</Text>
          {ESTILOS.map((e) => (
            <Text key={e} style={styles.headerCelda}>
              {INICIALES[e]}
            </Text>
          ))}
          <Text style={[styles.headerCelda, { width: 42 }]}>Gen.</Text>
        </View>

        {filas.map((f) => (
          <Pressable
            key={f.estudiante.id}
            style={styles.fila}
            onPress={() => navegar('style', { estudianteId: f.estudiante.id })}
          >
            <Text style={styles.nombre} numberOfLines={1}>
              {f.estudiante.apellidos}, {f.estudiante.nombre}
            </Text>
            {ESTILOS.map((e) => {
              const v = f.notaPorEstilo[e];
              const num = v ? parseFloat(v.replace(',', '.')) : null;
              return (
                <View
                  key={e}
                  style={[styles.celda, num === null ? styles.celdaVacia : num < 4 ? styles.celdaRoja : styles.celdaNeutra]}
                >
                  <Text style={[styles.celdaTexto, num === null ? styles.celdaTextoVacio : num < 4 ? styles.celdaTextoRojo : styles.celdaTextoNeutro]}>
                    {v ?? '·'}
                  </Text>
                </View>
              );
            })}
            <View style={{ width: 42, alignItems: 'center' }}>
              <Text
                style={[
                  styles.generalTexto,
                  f.notaGeneral === '—'
                    ? styles.generalVacio
                    : parseFloat(f.notaGeneral.replace(',', '.')) < 4
                    ? styles.generalRojo
                    : styles.generalVerde,
                ]}
              >
                {f.notaGeneral}
              </Text>
            </View>
          </Pressable>
        ))}

        <Text style={styles.leyenda}>
          C Crol · E Espalda · P Pecho · M Mariposa — nota 1,0–7,0 según la escala y exigencia configuradas. El punto (·)
          indica que el estilo aún no se evalúa.
        </Text>

        <CtaButton titulo={exportando ? 'Exportando…' : 'Exportar reporte a Google Sheets'} onPress={onExportar} tono="action" />
        <Text style={styles.pie}>Se genera una hoja «Reporte de notas» con esta matriz completa (no incremental).</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 26, gap: 13 },
  promedioCard: { backgroundColor: colors.navy, borderRadius: 14, padding: 17, paddingHorizontal: 18 },
  eyebrowOnNavy: { fontFamily: fontFamily.barlow600, fontSize: 12, color: colors.onNavyEyebrow },
  promedioValor: { fontFamily: fontFamily.condensed700, fontSize: 42, color: '#fff' },
  promedioLinea: { fontFamily: fontFamily.barlow400, fontSize: 12.5, color: colors.onNavyText, textAlign: 'right' },
  metricasRow: {
    flexDirection: 'row',
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,.18)',
    marginTop: 12,
    paddingTop: 10,
  },
  metricaLabel: {
    fontFamily: fontFamily.condensed600,
    fontSize: 9.5,
    textTransform: 'uppercase',
    color: colors.onNavyEyebrow,
  },
  metricaValorRojo: { fontFamily: fontFamily.condensed700, fontSize: 17, color: colors.redOnRedTextAlt2 },
  metricaValorBlanco: { fontFamily: fontFamily.condensed700, fontSize: 17, color: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 4 },
  headerEstudiante: {
    flex: 1,
    fontFamily: fontFamily.condensed700,
    fontSize: 9.5,
    textTransform: 'uppercase',
    color: colors.tertiaryText,
  },
  headerCelda: { width: 38, textAlign: 'center', fontFamily: fontFamily.condensed700, fontSize: 11, color: colors.action },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.1)',
    borderRadius: 11,
    padding: 8,
    paddingLeft: 11,
    paddingRight: 6,
  },
  nombre: { flex: 1, fontFamily: fontFamily.barlow600, fontSize: 13.5, color: colors.navy },
  celda: { width: 38, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  celdaNeutra: { backgroundColor: colors.reportCellBg },
  celdaRoja: { backgroundColor: colors.redBg },
  celdaVacia: { backgroundColor: 'transparent' },
  celdaTexto: { fontFamily: fontFamily.condensed700, fontSize: 15 },
  celdaTextoNeutro: { color: colors.bodyText },
  celdaTextoRojo: { color: colors.red },
  celdaTextoVacio: { color: colors.faintText },
  generalTexto: { fontFamily: fontFamily.condensed700, fontSize: 19 },
  generalVerde: { color: colors.green },
  generalRojo: { color: colors.red },
  generalVacio: { color: colors.faintText },
  leyenda: { fontFamily: fontFamily.barlow400, fontSize: 11.5, color: colors.tertiaryText },
  pie: { fontFamily: fontFamily.barlow400, fontSize: 11.5, color: colors.tertiaryText, textAlign: 'center' },
});
