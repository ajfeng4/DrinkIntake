import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';
import { supabase } from '@/supabaseClient';

export default function Goals() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [startTime, setStartTime] = useState('08:00 PM');
    const [duration, setDuration] = useState(90);
    const [showNotifications, setShowNotifications] = useState(true);
    const [sound, setSound] = useState('Default');
    const [customVolume, setCustomVolume] = useState('');
    const [selectedGoal, setSelectedGoal] = useState('Set your daily goal');
    const [currentGoalId, setCurrentGoalId] = useState(null);

    // Get current user and their goal on component mount
    useEffect(() => {
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            console.log('Current User ID:', user.id);
            fetchCurrentGoal(user.id);
        }
    };

    // Fetch current goal
    const fetchCurrentGoal = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const currentGoal = data[0];
                setCurrentGoalId(currentGoal.id);
                setCustomVolume(currentGoal.volume.toString());
                setStartTime(currentGoal.start_time);
                setDuration(currentGoal.duration);
                setShowNotifications(currentGoal.show_notifications);
                setSound(currentGoal.sound);
            }
        } catch (error) {
            console.error('Error fetching current goal:', error);
        }
    };

    const handleVolumeChange = (volume: string) => {
        setCustomVolume(volume);
        setSelectedGoal(`Drink ${volume} ml a day`);
    };

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert('Error', 'Please login first');
            return;
        }

        if (!customVolume) {
            Alert.alert('Error', 'Please set a volume goal');
            return;
        }

        try {
            let result;
            const goalData = {
                user_id: user.id,
                volume: parseInt(customVolume),
                start_time: startTime,
                duration: duration,
                show_notifications: showNotifications,
                sound: sound,
                updated_at: new Date().toISOString(),
            };

            if (currentGoalId) {
                // Update existing goal
                result = await supabase
                    .from('goals')
                    .update(goalData)
                    .eq('id', currentGoalId);
            } else {
                // Insert new goal
                result = await supabase
                    .from('goals')
                    .insert([{
                        ...goalData,
                        created_at: new Date().toISOString(),
                    }]);
            }

            const { error } = result;
            if (error) throw error;

            Alert.alert(
                'Success', 
                currentGoalId ? 'Goal has been updated!' : 'Goal has been saved!'
            );
            router.back();
        } catch (error) {
            console.error('Error saving goal:', error.message);
            Alert.alert('Error', 'Failed to save goal');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <DrinkIntakeHeader />

                    <View style={styles.outerContainer}>
                        <View style={styles.option}>
                            <Text style={styles.goalLabel}>Set goal</Text>
                            <View style={styles.inputGroup}>
                                <Text style={styles.optionText}>Drink</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder=""
                                    keyboardType="numeric"
                                    value={customVolume}
                                    onChangeText={handleVolumeChange}
                                />
                                <Text style={styles.optionText}>ml a day</Text>
                            </View>
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
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
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
    outerContainer: {
        backgroundColor: '#f0f6ff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 50,
        marginTop: 30,
    },
    goalLabel: {
        fontSize: 18,
        color: '#328DD8',
        fontWeight: 'bold',
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
    input: {
        height: 30,
        borderColor: '#ccc',
        borderWidth: 1,
        width: 40,
        textAlign: 'center',
        borderRadius: 5,
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
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
