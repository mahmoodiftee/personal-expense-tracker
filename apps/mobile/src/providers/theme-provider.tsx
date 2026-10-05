import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, useColorScheme as useSystemColorScheme, View } from 'react-native';
import { colorScheme as nativeWindColorScheme } from 'nativewind';

import { palettes, type Palette } from '@/lib/palette';
import { STORAGE_KEYS } from '@/lib/storage-keys';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  /** Concrete colors for Skia charts, icons and navigator options. */
  palette: Palette;
  setPreference: (value: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEYS.themePreference).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
      setHydrated(true);
    });
  }, []);

  const resolved: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  useEffect(() => {
    if (!hydrated) return;
    // NativeWind class strategy remounts `.dark:root` CSS variables from this.
    // Android's AppearanceModule rejects null, so always pass a concrete scheme.
    if (preference === 'system') {
      nativeWindColorScheme.set('system');
      Appearance.setColorScheme(resolved);
    } else {
      nativeWindColorScheme.set(preference);
      Appearance.setColorScheme(preference);
    }
  }, [hydrated, preference, resolved]);

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value);
    void AsyncStorage.setItem(STORAGE_KEYS.themePreference, value);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, palette: palettes[resolved], setPreference }),
    [preference, resolved, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View className="flex-1 bg-background">{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
