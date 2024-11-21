import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/auth/SignIn');
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="TrackWaterIntake" />
        </Stack>
    );
}
