import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/ui/Header';
import { CtaButton } from '../components/ui/Buttons';
import { SectionPicker, TextField } from '../components/ui/Form';
import { colors, fontFamily } from '../theme';
import { useAppState } from '../state/AppStateContext';
import { useNavigation } from '../navigation/NavigationContext';
import {
  CampoObligatorioError,
  EstudianteDuplicadoError,
  RutInvalidoError,
  crearEstudiante,
} from '../db/repositories/estudiantes';

export function NewStudentScreen() {
  const { sesion, tocarDb } = useAppState();
  const { volver } = useNavigation();

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [seccion, setSeccion] = useState(sesion.seccion);
  const [rut, setRut] = useState('');
  const [errorApellidos, setErrorApellidos] = useState<string | null>(null);
  const [errorRut, setErrorRut] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function onGuardar() {
    if (guardando) return;
    setErrorApellidos(null);
    setErrorRut(null);
    setGuardando(true);
    try {
      crearEstudiante({ nombre, apellidos, seccion, rut: rut || null });
      tocarDb();
      volver();
    } catch (e) {
      if (e instanceof CampoObligatorioError && e.campo === 'apellidos') {
        setErrorApellidos('Falta el apellido — se usa para ordenar la lista y evitar duplicados.');
      } else if (e instanceof RutInvalidoError) {
        setErrorRut(e.message);
      } else if (e instanceof EstudianteDuplicadoError) {
        setErrorRut(e.message);
      } else if (e instanceof CampoObligatorioError) {
        // nombre o sección — se maneja con el estilo por defecto del campo
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={['bottom']}>
      <Header titulo="Nuevo estudiante" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.nota}>Los datos quedan en el dispositivo al guardar. El nombre y la sección son obligatorios.</Text>

        <TextField label="Nombre" value={nombre} onChangeText={setNombre} placeholder="Nombre" autoCapitalize="words" />

        <TextField
          label="Apellidos"
          value={apellidos}
          onChangeText={setApellidos}
          placeholder="Apellido paterno y materno"
          autoCapitalize="words"
          error={errorApellidos ?? undefined}
        />

        <SectionPicker value={seccion} onChange={setSeccion} />

        <TextField
          label="RUT (opcional)"
          value={rut}
          onChangeText={setRut}
          placeholder="12.345.678-5"
          autoCapitalize="characters"
          keyboardType="default"
          error={errorRut ?? undefined}
          help={errorRut ? undefined : 'Se valida el dígito verificador antes de guardar.'}
        />

        <CtaButton titulo="Guardar estudiante" onPress={onGuardar} tono="action" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 26, gap: 16 },
  nota: { fontFamily: fontFamily.barlow400, fontSize: 13, color: colors.earthText },
});
