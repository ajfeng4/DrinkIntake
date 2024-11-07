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
        fontSize: 18,
    },
});
