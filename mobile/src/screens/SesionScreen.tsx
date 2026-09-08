import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/ui/Header';
import { CtaButton } from '../components/ui/Buttons';
import { SectionPicker, TextField } from '../components/ui/Form';
import { colors, fontFamily } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useNavigation } from '../navigation/NavigationContext';

export function SesionScreen() {
  const { sesion, actualizarSesion } = useAppState();
  const { volver } = useNavigation();

  const [asignatura, setAsignatura] = useState(sesion.asignatura);
  const [seccion, setSeccion] = useState(sesion.seccion);
  const [lugar, setLugar] = useState(sesion.lugar);
  const [horario, setHorario] = useState(sesion.horario);
  const [estilos, setEstilos] = useState(sesion.estilos);

  function onListo() {
    actualizarSesion({ asignatura, seccion, lugar, horario, estilos });
    volver();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={['bottom']}>
      <Header titulo="Editar sesión" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.nota}>Estos datos encabezan cada evaluación y viajan con la fila a Sheets.</Text>

        <TextField label="Asignatura" value={asignatura} onChangeText={setAsignatura} />
        <SectionPicker value={seccion} onChange={setSeccion} />
        <TextField label="Lugar" value={lugar} onChangeText={setLugar} placeholder="Piscina UMCE" />
        <TextField label="Día y hora" value={horario} onChangeText={setHorario} placeholder="Miércoles 09:00 — 10:00" />
        <TextField label="Estilos de la sesión" value={estilos} onChangeText={setEstilos} placeholder="Crol y Espalda" />

        <CtaButton titulo="Listo" onPress={onListo} tono="action" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 26, gap: 15 },
  nota: { fontFamily: fontFamily.barlow400, fontSize: 13.5, color: colors.earthText },
});
