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
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';

export default function Goals() {
    const router = useRouter();
    const [repeatGoal, setRepeatGoal] = useState(1);
    const [startTime, setStartTime] = useState('08:00 PM');
    const [duration, setDuration] = useState(90);
    const [showNotifications, setShowNotifications] = useState(true);
    const [sound, setSound] = useState('Default');
    const [selectedGoal, setSelectedGoal] = useState('Drink 50 ml a week');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <DrinkIntakeHeader />

                <TouchableOpacity
                    style={styles.option}
                    onPress={() => setIsDropdownVisible(!isDropdownVisible)}
                >
                    <Text style={styles.optionText}>Select Goal</Text>
                    <Text style={styles.optionValue}>{selectedGoal}</Text>
                </TouchableOpacity>

                {isDropdownVisible && (
                    <View style={styles.dropdown}>
                        <TouchableOpacity
                            style={styles.dropdownOption}
                            onPress={() => {
                                setSelectedGoal('Drink 50 ml a week');
                                setIsDropdownVisible(false);
                            }}
                        >
                            <Text style={styles.dropdownOptionText}>Drink 50 ml a week</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.dropdownOption}
                            onPress={() => {
                                setSelectedGoal('Drink 100 ml a day');
                                setIsDropdownVisible(false);
                            }}
                        >
                            <Text style={styles.dropdownOptionText}>Drink 100 ml a day</Text>
                        </TouchableOpacity>
                    </View>
                )}

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
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={() => console.log('Submitted')}
                    >
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
    dropdown: {
        backgroundColor: 'rgba(240, 246, 255, 0.82)',
        borderRadius: 10,
        marginBottom: 20,
    },
    dropdownOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    dropdownOptionText: {
        color: '#328DD8',
        fontSize: 18,
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