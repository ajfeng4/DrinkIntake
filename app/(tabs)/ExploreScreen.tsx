import React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                { paddingTop: insets.top, paddingBottom: insets.bottom },
            ]}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <DrinkIntakeHeader />

                <Text style={styles.description}>
                    Welcome to the Drink Intake Project! Keep up the hydration and keep drinking and keep healthy!
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/Goals')}
                >
                    <Ionicons name="calendar-outline" size={40} color="#328DD8" />
                    <Text style={styles.buttonText}>Review Goals</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/TrackWaterIntake')}
                >
                    <Ionicons name="water-outline" size={40} color="#328DD8" />
                    <Text style={styles.buttonText}>Track Your Water Intake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/WaterIntakeStatistics')}
                >
                    <Ionicons name="stats-chart-outline" size={40} color="#328DD8" />
                    <Text style={styles.buttonText}>Water Intake Statistics</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/WaterIntakeStatistics')}
                >
                    <Ionicons name="trophy-outline" size={40} color="#328DD8" />
                    <Text style={styles.buttonText}>Goal Scoreboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/WaterIntakeStatistics')}
                >
                    <Ionicons name="search-outline" size={40} color="#328DD8" />
                    <Text style={styles.buttonText}>Search Page</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/WaterIntakeStatistics')}
                >
                    <Feather name="alert-circle" size={40} color="#328DD8" />
                    <Text style={styles.buttonText}>Historical Alerts</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/Settings')}
                >
                    <AntDesign name="setting" size={40} color="#328DD8" />
                    <Text style={styles.buttonText}>User Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/WaterIntakeStatistics')}
                >
                    <SimpleLineIcons name="cup" size={40} color="#328DD8" />
                    <Text style={styles.buttonText}>Current Water Intake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/VoiceRecorder')}
                >
                    <SimpleLineIcons name="microphone" size={40} color="#328DD8" />
                    <Text style={styles.buttonText}>Voice Recordings</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    description: {
        fontSize: 16,
        color: '#6c6c6c',
        marginBottom: 30,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(240, 246, 255, 0.82)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: 'center',
        height: 100,
    },
    buttonText: {
        color: '#328DD8',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
