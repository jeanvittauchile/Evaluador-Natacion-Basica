import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, Table, List } from 'lucide-react-native';
import { colors, fontFamily } from '../../theme';
import { useNavigation } from '../../navigation/NavigationContext';
import type { ScreenName } from '../../navigation/types';

const TABS: { screen: ScreenName; label: string; Icon: typeof Home }[] = [
  { screen: 'home', label: 'Inicio', Icon: Home },
  { screen: 'students', label: 'Estudiantes', Icon: Users },
  { screen: 'reporte', label: 'Reporte', Icon: Table },
  { screen: 'rubric', label: 'Rúbrica', Icon: List },
];

export function TabBar() {
  const insets = useSafeAreaInsets();
  const { current, irATab } = useNavigation();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 9 }]}>
      {TABS.map(({ screen, label, Icon }) => {
        const activo = current.screen === screen;
        const color = activo ? colors.navy : colors.tertiaryText;
        return (
          <Pressable
            key={screen}
            onPress={() => irATab(screen, undefined as never)}
            android_ripple={{ color: 'rgba(22,48,91,.08)' }}
            style={styles.tab}
          >
            <Icon size={17} color={color} strokeWidth={2.25} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(22,48,91,.12)',
    paddingTop: 9,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 44,
  },
  label: {
    fontFamily: fontFamily.barlow600,
    fontSize: 10.5,
  },
});
