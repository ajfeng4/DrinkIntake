import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';
import { useRouter } from 'expo-router';

type ExploreScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'ExploreScreen'>;
};

export default function ExploreScreen({ navigation }: ExploreScreenProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.container}>
                <DrinkIntakeHeader />

                <Text style={styles.description}>
                    Welcome to the Drink Intake Project! Keep up the hydration and keep drinking and keep healthy!
                </Text>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ReviewGoals')}>
                    <Ionicons name="calendar-outline" size={24} color="white" />
                    <Text style={styles.buttonText}>Review Goals</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => router.push('/waterIntake')}>
                    <Ionicons name="water-outline" size={24} color="white" />
                    <Text style={styles.buttonText}>Track Your Water Intake</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/statistics')}>
                    <Ionicons name="stats-chart-outline" size={24} color="white" />
                    <Text style={styles.buttonText}>Water Intake Statistics</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('GoalScoreboard')}>
                    <Ionicons name="trophy-outline" size={24} color="white" />
                    <Text style={styles.buttonText}>Goal Scoreboard</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SearchPage')}>
                    <Ionicons name="search-outline" size={24} color="white" />
                    <Text style={styles.buttonText}>Search Page</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        backgroundColor: '#f2f8ff',
        padding: 20,
    },
    description: {
        fontSize: 16,
        color: '#6c6c6c',
        marginBottom: 30,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196f3',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
