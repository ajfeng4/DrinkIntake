import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#FFFFFF99',
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: '#2782CC',
                    borderRadius: 15,
                    height: 80,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 5,
                },
                tabBarLabelStyle: {
                    marginBottom: 5,
                },
                tabBarIconStyle: {
                    marginBottom: 5,
                },
            }}
        >
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="statistics"
                options={{
                    title: 'Statistics',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'water' : 'water-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="VoiceRecorder"
                options={{
                    title: 'Voice Recorder',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'mic' : 'mic-outline'} color={color} />
                    ),
                    tabBarButton: () => null,
                }}
            />
            <Tabs.Screen
                name="FirstAndLastName"
                options={{
                    title: 'Name',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
                    ),
                    tabBarStyle: { display: 'none' },
                    tabBarButton: () => null,
                }}

            />
            <Tabs.Screen
                name="Attributes"
                options={{
                    title: 'Attributes',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'list' : 'list-outline'} color={color} />
                    ),
                    tabBarStyle: { display: 'none' },
                    tabBarButton: () => null,
                }}
            />
            <Tabs.Screen
                name="TermsOfService"
                options={{
                    title: 'Terms',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'document' : 'document-outline'} color={color} />
                    ),
                    tabBarStyle: { display: 'none' },
                    tabBarButton: () => null,
                }}
            />
        </Tabs>
    );
}
