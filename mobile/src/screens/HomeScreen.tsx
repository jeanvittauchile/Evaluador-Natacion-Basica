import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, List as ListIcon } from 'lucide-react-native';
import { Header } from '../components/ui/Header';
import { Avatar } from '../components/ui/Avatar';
import { PrimaryButton } from '../components/ui/Buttons';
import { ProgressBar } from '../components/ui/Form';
import { colors, fontFamily, radius, tracking } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useNavigation } from '../navigation/NavigationContext';
import { colaSyncRepo, estudiantesRepo, evaluacionesRepo } from '../db';
import { ESTILOS } from '../domain/rubric';
import { nota } from '../domain/calculo';

export function HomeScreen() {
  const { sesion, dbTick } = useAppState();
  const { navegar, irATab } = useNavigation();

  const estudiantes = useMemo(
    () => estudiantesRepo.listarEstudiantes(sesion.seccion),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sesion.seccion, dbTick]
  );

  const porEstudiante = useMemo(
    () => estudiantes.map((e) => ({ estudiante: e, evals: evaluacionesRepo.listarPorEstudiante(e.id) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [estudiantes, dbTick]
  );

  const total = estudiantes.length;
  const evaluados = porEstudiante.filter((p) => p.evals.length > 0).length;
  const pendientes = total - evaluados;

  const siguiente = porEstudiante.find((p) => p.evals.length < ESTILOS.length);
  const siguienteEstilo = siguiente ? ESTILOS.find((s) => !siguiente.evals.some((e) => e.estilo === s)) : undefined;

  const pendientesSubir = colaSyncRepo.contarPendientes() + colaSyncRepo.contarFallidos();
  const recientes = useMemo(() => evaluacionesRepo.listarRecientes(3), [dbTick]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={[]}>
      <Header titulo="Sesión de hoy" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.sesionCard}>
          <View style={styles.sesionRowTop}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.eyebrowOnNavy}>Sesión activa</Text>
                <Pressable onPress={() => navegar('sesion', undefined)} style={styles.editarBtn}>
                  <Text style={styles.editarBtnText}>Editar</Text>
                </Pressable>
              </View>
              <Text style={styles.asignatura}>{sesion.asignatura}</Text>
              <Text style={styles.sesionLinea}>
                {sesion.seccion} · {sesion.lugar}
              </Text>
              <Text style={styles.sesionLinea}>
                {sesion.horario} · {sesion.estilos}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.contador}>
                {evaluados}
                <Text style={styles.contadorDen}>/{total}</Text>
              </Text>
              <Text style={styles.contadorLabel}>Evaluados</Text>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <ProgressBar progreso={total ? evaluados / total : 0} />
          </View>
          <View style={styles.sesionPie}>
            <Text style={styles.pieTexto}>Ritmo: 2 min 40 s por estudiante</Text>
            <Text style={styles.pieTexto}>
              {pendientes} estudiantes · {pendientes * 3} min restantes
            </Text>
          </View>
        </View>

        <PrimaryButton
          titulo="Continuar evaluación"
          subtitulo={siguiente ? `${siguiente.estudiante.nombre} ${siguiente.estudiante.apellidos} · ${siguienteEstilo}` : 'Todos los estudiantes evaluados'}
          chevron
          onPress={() => (siguiente ? navegar('style', { estudianteId: siguiente.estudiante.id }) : irATab('students', undefined))}
        />

        <View style={styles.accesosRow}>
          <Pressable style={styles.acceso} onPress={() => navegar('new', undefined)}>
            <Plus size={20} color={colors.action} />
            <Text style={styles.accesoLabel}>Nuevo estudiante</Text>
          </Pressable>
          <Pressable style={styles.acceso} onPress={() => irATab('rubric', undefined)}>
            <ListIcon size={20} color={colors.action} />
            <Text style={styles.accesoLabel}>Rúbrica</Text>
          </Pressable>
        </View>

        {pendientesSubir > 0 && (
          <View style={styles.pendientesCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.pendientesTitulo}>Pendientes de subir</Text>
              <Text style={styles.pendientesContador}>{pendientesSubir}</Text>
            </View>
            <Text style={styles.pendientesTexto}>
              Se subirán a «Evaluaciones Natación {sesion.asignatura} {new Date().getFullYear()}» apenas haya conexión.
            </Text>
          </View>
        )}

        {recientes.length > 0 && (
          <View>
            <Text style={styles.eyebrow}>Últimas evaluaciones</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {recientes.map((ev) => {
                const est = estudiantesRepo.obtenerEstudiante(ev.estudiante_id);
                if (!est) return null;
                const subido = colaSyncRepo.fueEncolada(ev.id) && ev.dirty === 0;
                return (
                  <View key={ev.id} style={styles.recienteFila}>
                    <Avatar nombre={est.nombre} apellidos={est.apellidos} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recienteNombre}>
                        {est.apellidos}, {est.nombre}
                      </Text>
                      <Text style={styles.recienteDetalle}>
                        {ev.estilo} · {ev.puntaje} pts · {subido ? 'subido' : 'en cola'}
                      </Text>
                    </View>
                    <Text style={styles.recienteNota}>{nota(ev.puntaje, ev.puntaje_max, ev.exigencia)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 26, gap: 14 },
  sesionCard: { backgroundColor: colors.navy, borderRadius: 14, padding: 18, paddingHorizontal: 20 },
  sesionRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrowOnNavy: {
    fontFamily: fontFamily.condensed700,
    fontSize: 10,
    letterSpacing: tracking(10, 0.16),
    textTransform: 'uppercase',
    color: colors.onNavyEyebrow,
  },
  editarBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.35)',
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  editarBtnText: { fontFamily: fontFamily.barlow600, fontSize: 10.5, color: colors.onActionChip },
  asignatura: { fontFamily: fontFamily.barlow600, fontSize: 21, color: '#fff', marginTop: 6 },
  sesionLinea: { fontFamily: fontFamily.barlow400, fontSize: 13, color: colors.onNavyText, marginTop: 2 },
  contador: { fontFamily: fontFamily.condensed700, fontSize: 30, color: '#fff' },
  contadorDen: { fontSize: 17, color: colors.onNavyEyebrow },
  contadorLabel: { fontFamily: fontFamily.barlow400, fontSize: 11, color: colors.onNavyText },
  sesionPie: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  pieTexto: { fontFamily: fontFamily.barlow500, fontSize: 11.5, color: colors.onNavyText },
  accesosRow: { flexDirection: 'row', gap: 12 },
  acceso: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.18)',
    borderRadius: 14,
    padding: 15,
    paddingHorizontal: 14,
    gap: 8,
  },
  accesoLabel: { fontFamily: fontFamily.barlow600, fontSize: 14, color: colors.navy },
  pendientesCard: {
    backgroundColor: colors.amberWarnBg,
    borderWidth: 1,
    borderColor: 'rgba(224,169,60,.5)',
    borderRadius: 14,
    padding: 15,
    paddingHorizontal: 17,
    gap: 4,
  },
  pendientesTitulo: { fontFamily: fontFamily.barlow600, fontSize: 14, color: colors.navy },
  pendientesContador: { fontFamily: fontFamily.barlow700, fontSize: 15, color: colors.red },
  pendientesTexto: { fontFamily: fontFamily.barlow400, fontSize: 12.5, color: colors.earthText },
  eyebrow: {
    fontFamily: fontFamily.condensed700,
    fontSize: 10,
    letterSpacing: tracking(10, 0.16),
    textTransform: 'uppercase',
    color: colors.tertiaryText,
  },
  recienteFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.1)',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 14,
  },
  recienteNombre: { fontFamily: fontFamily.barlow600, fontSize: 14.5, color: colors.navy },
  recienteDetalle: { fontFamily: fontFamily.barlow400, fontSize: 12, color: colors.tertiaryText, marginTop: 2 },
  recienteNota: { fontFamily: fontFamily.condensed700, fontSize: 19, color: colors.green },
});
