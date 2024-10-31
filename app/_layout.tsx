import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn('Error preventing splash screen auto-hide:', err);
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null indicates loading
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setIsAuthenticated(true);
          router.replace('/(tabs)');
        } else {
          setIsAuthenticated(false);
          router.replace('/auth');
        }
      } catch (error) {
        console.error('Error checking authentication token:', error);
        setIsAuthenticated(false);
        router.replace('/auth');
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    if (fontsLoaded) {
      checkAuthentication();
    }
  }, [fontsLoaded, router]);

  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {(!fontsLoaded || isAuthenticated === null) && (
              <Stack.Screen
                  name="loading"
                  options={{
                    headerShown: false,
                  }}
              />
          )}

          {isAuthenticated && (
              <>
                <Stack.Screen
                    name="(tabs)"
                    options={{
                      headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="+not-found"
                    options={{
                      headerShown: false,
                    }}
                />
              </>
          )}

          {!isAuthenticated && (
              <>
                <Stack.Screen
                    name="auth"
                    options={{
                      headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="+not-found"
                    options={{
                      headerShown: false,
                    }}
                />
              </>
          )}
        </Stack>
      </ThemeProvider>
  );
}
