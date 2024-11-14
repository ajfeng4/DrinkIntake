import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/supabaseClient';
import { useNavigation } from '@react-navigation/native';

export default function FirstAndLastName() {
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleContinue = async () => {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) {
            console.error('Error fetching user:', userError?.message || 'No user found');
            Alert.alert('Error', 'Unable to fetch user information.');
            return;
        }

        const userId = data.user.id;
        console.log("Authenticated user ID:", userId);

        const { error } = await supabase.from('profiles').insert({
            id: userId,
            first_name: firstName,
            last_name: lastName,
        });

        if (error) {
            console.error('Error saving user data:', error.message);
            Alert.alert('Error', 'Failed to save your information.');
        } else {
            navigation.navigate('Attributes');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Let us get to know you!</Text>
            <Text style={styles.subtitle}>Please enter your information, so we can build you a plan!</Text>
            <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.labelUnderline} />
                </View>
                <TextInput
                    placeholder=""
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.input}
                />
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.labelUnderline} />
                </View>
                <TextInput
                    placeholder=""
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.input}
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        color: '#328DD8',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 12,
        color: '#328DD8',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 30,
    },
    labelContainer: {
        marginBottom: 5,
    },
    label: {
        fontSize: 12,
        color: '#9D9D9D',
        marginBottom: 5,
    },
    labelUnderline: {
        width: 80,
        height: 1,
        backgroundColor: '#9D9D9D',
        marginBottom: 10,
    },
    input: {
        fontSize: 12,
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#9D9D9D',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#328DD8',
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: 'center',
        alignSelf: 'center',
        width: 200,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
    },
});
