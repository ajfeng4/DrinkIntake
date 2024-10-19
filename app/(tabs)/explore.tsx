import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type ExploreScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'ExploreScreen'>;
};

export default function ExploreScreen({ navigation }: ExploreScreenProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.hydratedText}>Stay hydrated!</Text>
                <Text style={styles.userName}>Jane Doe</Text>
                <Ionicons name="notifications-outline" size={24} color="black" style={styles.notificationIcon} />
            </View>
            <Text style={styles.description}>
                Welcome to the Drink Intake Project! Keep up the hydration and keep drinking and keep healthy!
            </Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ReviewGoals')}>
                <Ionicons name="calendar-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Review Goals</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TrackWaterIntake')}>
                <Ionicons name="water-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Track Your Water Intake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('WaterIntakeStatistics')}>
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f8ff',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    hydratedText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#82b1ff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0d47a1',
    },
    notificationIcon: {
        marginLeft: 'auto',
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
