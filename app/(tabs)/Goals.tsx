import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';

export default function Goals() {
    const router = useRouter();
    const [repeatGoal, setRepeatGoal] = useState(1);
    const [startTime, setStartTime] = useState('08:00 PM');
    const [duration, setDuration] = useState(90);
    const [showNotifications, setShowNotifications] = useState(true);
    const [sound, setSound] = useState('Default');
    const [selectedGoal, setSelectedGoal] = useState('Drink 50 ml a week');

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <DrinkIntakeHeader />

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedGoal}
                        style={styles.picker}
                        onValueChange={(itemValue: string) => setSelectedGoal(itemValue)}
                        itemStyle={{ color: '#328DD8' }}
                    >
                        <Picker.Item label="Drink 50 ml a week" value="Drink 50 ml a week" color="#328DD8" />
                        <Picker.Item label="Drink 100 ml a day" value="Drink 100 ml a day" color="#328DD8" />
                    </Picker>
                </View>

                <View style={styles.option}>
                    <Text style={styles.optionText}>Repeat goal</Text>
                    <Text style={styles.optionValue}>{repeatGoal} time</Text>
                </View>

                <View style={styles.option}>
                    <Text style={styles.optionText}>Start at</Text>
                    <Text style={styles.optionValue}>{startTime}</Text>
                </View>

                <View style={styles.option}>
                    <Text style={styles.optionText}>Duration</Text>
                    <Text style={styles.optionValue}>{duration} days</Text>
                </View>

                <View style={styles.option}>
                    <Text style={styles.optionText}>Show notifications</Text>
                    <Switch
                        value={showNotifications}
                        onValueChange={setShowNotifications}
                        thumbColor={showNotifications ? '#328DD8' : '#f4f3f4'}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                    />
                </View>

                <View style={styles.option}>
                    <Text style={styles.optionText}>Sound</Text>
                    <Text style={styles.optionValue}>{sound}</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={() => console.log('Submitted')}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
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
        padding: 20,
        backgroundColor: '#fff',
    },
    pickerContainer: {
        backgroundColor: 'rgba(240, 246, 255, 0.82)',
        borderRadius: 5,
        marginBottom: 20,
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#328DD8',
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(240, 246, 255, 0.82)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    optionText: {
        color: '#328DD8',
        fontSize: 18,
        fontWeight: 'bold',
    },
    optionValue: {
        color: '#328DD8',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        backgroundColor: 'rgba(240, 246, 255, 0.82)',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#328DD8',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#328DD8',
        fontSize: 18,
        fontWeight: 'bold',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
