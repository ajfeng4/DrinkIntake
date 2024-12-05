import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

export default function RootLayout() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/auth/SignIn');
    }, []);

    return (
        <NavigationContainer>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="auth" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="TrackWaterIntake" />
            </Stack>
        </NavigationContainer>
    );
}
