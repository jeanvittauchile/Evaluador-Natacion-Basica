import React from 'react';
import { View } from 'react-native';
import { useNavigation } from './NavigationContext';
import { TabBar } from '../components/ui/TabBar';
import { HomeScreen } from '../screens/HomeScreen';
import { SesionScreen } from '../screens/SesionScreen';
import { StudentsScreen } from '../screens/StudentsScreen';
import { NewStudentScreen } from '../screens/NewStudentScreen';
import { StyleScreen } from '../screens/StyleScreen';
import { EvalScreen } from '../screens/EvalScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { ReporteScreen } from '../screens/ReporteScreen';
import { RubricScreen } from '../screens/RubricScreen';

const TAB_SCREENS = new Set(['home', 'students', 'reporte', 'rubric']);

export function Router() {
  const { current } = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {current.screen === 'home' && <HomeScreen />}
        {current.screen === 'sesion' && <SesionScreen />}
        {current.screen === 'students' && <StudentsScreen />}
        {current.screen === 'new' && <NewStudentScreen />}
        {current.screen === 'style' && <StyleScreen params={current.params} />}
        {current.screen === 'eval' && <EvalScreen params={current.params} />}
        {current.screen === 'summary' && <SummaryScreen params={current.params} />}
        {current.screen === 'reporte' && <ReporteScreen />}
        {current.screen === 'rubric' && <RubricScreen />}
      </View>
      {TAB_SCREENS.has(current.screen) && <TabBar />}
    </View>
  );
}
