import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/ui/Header';
import { Avatar } from '../components/ui/Avatar';
import { colors, fontFamily, radius, tracking } from '../theme';
import { useNavigation } from '../navigation/NavigationContext';
import { colaSyncRepo, estudiantesRepo, evaluacionesRepo } from '../db';
import { ESTILOS, ROWS, type Estilo } from '../domain/rubric';
import { nota, promedio } from '../domain/calculo';
import type { ParamsPorPantalla } from '../navigation/types';

function formatearFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
}

export function StyleScreen({ params }: { params: ParamsPorPantalla['style'] }) {
  const { estudianteId } = params;
  const { navegar } = useNavigation();

  const estudiante = useMemo(() => estudiantesRepo.obtenerEstudiante(estudianteId), [estudianteId]);
  const evaluadas = useMemo(() => evaluacionesRepo.listarPorEstudiante(estudianteId), [estudianteId]);

  if (!estudiante) return null;

  const notaGeneral = evaluadas.length
    ? promedio(evaluadas.map((e) => ({ puntaje: e.puntaje, max: e.puntaje_max, exigenciaPct: e.exigencia })))
    : '—';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={['bottom']}>
      <Header titulo="Estilo a evaluar" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.ficha}>
          <Avatar nombre={estudiante.nombre} apellidos={estudiante.apellidos} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={styles.fichaNombre}>
              {estudiante.apellidos}, {estudiante.nombre}
            </Text>
            <Text style={styles.fichaDetalle}>
              {estudiante.seccion} · {evaluadas.length} de {ESTILOS.length} estilos evaluados
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.fichaNota}>{notaGeneral}</Text>
            <Text style={styles.fichaLabel}>General</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>Elige el estilo a evaluar</Text>

        {ESTILOS.map((estilo) => {
          // listarPorEstudiante ya trae la evaluación más reciente por estilo,
          // sea un borrador en curso o una ya cerrada.
          const ev = evaluadas.find((e) => e.estilo === estilo);
          const cerrada = ev ? colaSyncRepo.fueEncolada(ev.id) : false;

          let estado: string;
          if (!ev) {
            estado = 'Pendiente';
          } else if (cerrada) {
            estado = `50 m evaluados el ${formatearFecha(ev.evaluado_en)} · ${ev.puntaje} pts`;
          } else {
            const completadas = evaluacionesRepo.obtenerObservaciones(ev.id).filter((o) => o.puntaje !== null).length;
            estado = `En curso · ${completadas} de ${ROWS.length} observaciones`;
          }

          const notaEstilo = ev ? nota(ev.puntaje, ev.puntaje_max, ev.exigencia) : '—';
          const puntajeTxt = ev ? `${ev.puntaje}/${ev.puntaje_max}` : '';

          return (
            <Pressable
              key={estilo}
              style={styles.tarjeta}
              onPress={() => navegar('eval', { estudianteId, estilo: estilo as Estilo })}
            >
              <View style={styles.barraLateral} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tarjetaNombre}>{estilo}</Text>
                <Text style={styles.tarjetaEstado}>{estado}</Text>
              </View>
              {ev ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.tarjetaNota}>{notaEstilo}</Text>
                  <Text style={styles.tarjetaPuntaje}>{puntajeTxt}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 26, gap: 12 },
  ficha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.12)',
    borderRadius: radius.card,
    padding: 14,
  },
  fichaNombre: { fontFamily: fontFamily.barlow600, fontSize: 17, color: colors.navy },
  fichaDetalle: { fontFamily: fontFamily.barlow400, fontSize: 12.5, color: colors.tertiaryText, marginTop: 2 },
  fichaNota: { fontFamily: fontFamily.condensed700, fontSize: 24, color: colors.green },
  fichaLabel: { fontFamily: fontFamily.barlow400, fontSize: 10, color: colors.tertiaryText },
  eyebrow: {
    fontFamily: fontFamily.condensed700,
    fontSize: 10,
    letterSpacing: tracking(10, 0.16),
    textTransform: 'uppercase',
    color: colors.tertiaryText,
    marginTop: 2,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.12)',
    borderRadius: radius.card,
    padding: 16,
  },
  barraLateral: { width: 5, height: 42, borderRadius: 100, backgroundColor: colors.action },
  tarjetaNombre: { fontFamily: fontFamily.barlow600, fontSize: 19, color: colors.navy },
  tarjetaEstado: { fontFamily: fontFamily.barlow400, fontSize: 12.5, color: colors.tertiaryText, marginTop: 2 },
  tarjetaNota: { fontFamily: fontFamily.condensed700, fontSize: 23, color: colors.navy },
  tarjetaPuntaje: { fontFamily: fontFamily.barlow400, fontSize: 11, color: colors.tertiaryText },
});
