import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="SignIn" options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" options={{ headerShown: false }} />
            <Stack.Screen name="FirstAndLastName" options={{ headerShown: false }} />
            <Stack.Screen name="Attributes" options={{ headerShown: false }} />
            <Stack.Screen name="TermsOfService" options={{ headerShown: false }} />
        </Stack>
    );
}