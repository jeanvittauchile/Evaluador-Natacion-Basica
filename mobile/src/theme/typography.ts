// Familias y tamaños tipográficos — README §"Design Tokens › Tipografía".
// Barlow para todo el texto de UI, Barlow Condensed para cifras grandes,
// eyebrows y labels en mayúsculas.

export const fontFamily = {
  barlow400: 'Barlow_400Regular',
  barlow500: 'Barlow_500Medium',
  barlow600: 'Barlow_600SemiBold',
  barlow700: 'Barlow_700Bold',
  condensed600: 'BarlowCondensed_600SemiBold',
  condensed700: 'BarlowCondensed_700Bold',
} as const;

export const fontsToLoad = {
  Barlow_400Regular: require('@expo-google-fonts/barlow/400Regular/Barlow_400Regular.ttf'),
  Barlow_500Medium: require('@expo-google-fonts/barlow/500Medium/Barlow_500Medium.ttf'),
  Barlow_600SemiBold: require('@expo-google-fonts/barlow/600SemiBold/Barlow_600SemiBold.ttf'),
  Barlow_700Bold: require('@expo-google-fonts/barlow/700Bold/Barlow_700Bold.ttf'),
  BarlowCondensed_600SemiBold: require('@expo-google-fonts/barlow-condensed/600SemiBold/BarlowCondensed_600SemiBold.ttf'),
  BarlowCondensed_700Bold: require('@expo-google-fonts/barlow-condensed/700Bold/BarlowCondensed_700Bold.ttf'),
};

/** RN usa letterSpacing en px; el README lo especifica en em (CSS), por eso se deriva del fontSize del texto puntual. */
export function tracking(fontSize: number, em: number): number {
  return fontSize * em;
}
