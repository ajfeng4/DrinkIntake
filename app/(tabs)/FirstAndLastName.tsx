import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

export default function FirstAndLastName({ navigation }: any) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Let us get to know you!</Text>
            <Text style={styles.subtitle}>Please enter your information, so we can build you a plan!</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.input}
                />
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Attributes')}
            >
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
        fontSize: 16,
        color: '#6c6c6c',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 30,
    },
    input: {
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#6c6c6c',
        marginBottom: 20,
        paddingVertical: 5,
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
        fontSize: 18,
    },
});
