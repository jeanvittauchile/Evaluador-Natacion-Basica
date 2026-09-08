import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { Header } from '../components/ui/Header';
import { Avatar } from '../components/ui/Avatar';
import { colors, fontFamily, radius } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useNavigation } from '../navigation/NavigationContext';
import { estudiantesRepo, evaluacionesRepo, type Estudiante } from '../db';
import { ESTILOS } from '../domain/rubric';
import { promedio } from '../domain/calculo';

type Filtro = 'seccion' | 'pendientes' | 'sin-subir';

export function StudentsScreen() {
  const { sesion, dbTick } = useAppState();
  const { navegar } = useNavigation();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('seccion');

  const estudiantes = useMemo(
    () => estudiantesRepo.listarEstudiantes(filtro === 'seccion' ? sesion.seccion : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sesion.seccion, filtro, dbTick]
  );

  const filas = useMemo(() => {
    return estudiantes
      .map((e) => {
        const evals = evaluacionesRepo.listarPorEstudiante(e.id);
        const tieneDirty = evals.some((ev) => ev.dirty === 1);
        return { estudiante: e, evals, tieneDirty };
      })
      .filter((f) => {
        if (filtro === 'pendientes' && f.evals.length > 0) return false;
        if (filtro === 'sin-subir' && !f.tieneDirty) return false;
        if (busqueda.trim()) {
          const q = busqueda.trim().toLowerCase();
          const hay = `${f.estudiante.nombre} ${f.estudiante.apellidos} ${f.estudiante.seccion}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estudiantes, filtro, busqueda]);

  const chips: { key: Filtro; label: string }[] = [
    { key: 'seccion', label: `${sesion.seccion} · ${estudiantesRepo.contarPorSeccion(sesion.seccion)}` },
    { key: 'pendientes', label: 'Pendientes' },
    { key: 'sin-subir', label: 'Sin subir' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={[]}>
      <Header titulo={`${sesion.seccion} · Gen. 2026`} />
      <View style={styles.buscador}>
        <Search size={16} color={colors.tertiaryText} />
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por nombre o sección"
          placeholderTextColor={colors.tertiaryText}
          style={styles.buscadorInput}
        />
      </View>
      <FlatList
        data={filas}
        keyExtractor={(f) => f.estudiante.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={styles.filtrosRow}>
            {chips.map((c) => {
              const activo = filtro === c.key;
              return (
                <Pressable key={c.key} onPress={() => setFiltro(c.key)} style={[styles.chip, activo && styles.chipActivo]}>
                  <Text style={[styles.chipText, activo && styles.chipTextActivo]}>{c.label}</Text>
                </Pressable>
              );
            })}
          </View>
        }
        renderItem={({ item }) => <FilaEstudiante estudiante={item.estudiante} evaluados={item.evals.length} notaGeneral={
          item.evals.length ? promedio(item.evals.map((e) => ({ puntaje: e.puntaje, max: e.puntaje_max, exigenciaPct: e.exigencia }))) : '—'
        } onPress={() => navegar('style', { estudianteId: item.estudiante.id })} />}
        ListFooterComponent={
          <Pressable style={styles.agregar} onPress={() => navegar('new', undefined)}>
            <Text style={styles.agregarText}>+ Agregar estudiante a la sección</Text>
          </Pressable>
        }
      />
    </SafeAreaView>
  );
}

function FilaEstudiante({
  estudiante,
  evaluados,
  notaGeneral,
  onPress,
}: {
  estudiante: Estudiante;
  evaluados: number;
  notaGeneral: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.fila} onPress={onPress}>
      <Avatar nombre={estudiante.nombre} apellidos={estudiante.apellidos} />
      <View style={{ flex: 1 }}>
        <Text style={styles.filaNombre}>
          {estudiante.apellidos}, {estudiante.nombre}
        </Text>
        <Text style={styles.filaDetalle}>{evaluados ? `${evaluados} de ${ESTILOS.length}` : 'Sin evaluaciones'}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.filaNota}>{notaGeneral}</Text>
        <Text style={styles.filaLabel}>{evaluados ? 'General' : 'Pendiente'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.14)',
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buscadorInput: { flex: 1, fontFamily: fontFamily.barlow400, fontSize: 14.5, color: colors.navy },
  lista: { padding: 20, paddingTop: 10, gap: 10 },
  filtrosRow: { flexDirection: 'row', gap: 8, marginBottom: 2, paddingBottom: 8 },
  chip: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.16)',
    borderRadius: 100,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  chipActivo: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontFamily: fontFamily.barlow600, fontSize: 12.5, color: '#28374F' },
  chipTextActivo: { color: '#fff' },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(22,48,91,.1)',
    borderRadius: 13,
    padding: 13,
    paddingHorizontal: 14,
  },
  filaNombre: { fontFamily: fontFamily.barlow600, fontSize: 15.5, color: colors.navy },
  filaDetalle: { fontFamily: fontFamily.barlow400, fontSize: 12, color: colors.tertiaryText, marginTop: 2 },
  filaNota: { fontFamily: fontFamily.condensed700, fontSize: 21, color: colors.navy },
  filaLabel: { fontFamily: fontFamily.condensed600, fontSize: 9.5, textTransform: 'uppercase', color: colors.tertiaryText },
  agregar: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(22,48,91,.32)',
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  agregarText: { fontFamily: fontFamily.barlow600, fontSize: 14.5, color: colors.linkText },
});
