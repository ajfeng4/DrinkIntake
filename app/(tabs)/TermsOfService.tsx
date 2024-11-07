import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function TermsOfService({ navigation }: any) {
    const [isChecked, setIsChecked] = useState(false);

    const toggleCheckbox = () => setIsChecked(!isChecked);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Let us get to know you!</Text>
            <Text style={styles.subtitle}>You're almost there, one more form!</Text>
            <View style={styles.termsTitleContainer}>
                <Text style={styles.termsTitle}>Terms and Conditions</Text>
                <View style={styles.underline} />
            </View>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.termsText}>
                    By using this application, you agree to comply with and be bound by the following terms and conditions. All data provided through this platform is for informational purposes only and is subject to change without notice. You acknowledge that any reliance on such information is at your own risk. Unauthorized reproduction, distribution, or use of this application and its contents is strictly prohibited. The application reserves the right to suspend or terminate access at its sole discretion for any misuse or violation of these terms.
                </Text>
            </ScrollView>
            <View style={styles.checkboxContainer}>
                <TouchableOpacity
                    style={[
                        styles.checkbox,
                        isChecked && styles.checkboxChecked,
                    ]}
                    onPress={toggleCheckbox}
                />
                <Text style={styles.checkboxLabel}>Agree to terms and conditions</Text>
            </View>
            <TouchableOpacity
                style={[styles.button, { opacity: isChecked ? 1 : 0.5 }]}
                disabled={!isChecked}
                onPress={() => navigation.navigate('Explore')}
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
        marginBottom: 20,
    },
    termsTitleContainer: {
        marginBottom: 10,
        alignItems: 'flex-start',
    },
    termsTitle: {
        fontSize: 16,
        color: '#9D9D9D',
        marginBottom: 5,
    },
    underline: {
        width: 140,
        height: 1,
        backgroundColor: '#9D9D9D',
    },
    scrollView: {
        maxHeight: 150,
        marginBottom: 20,
    },
    termsText: {
        fontSize: 14,
        color: '#9D9D9D',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#6c6c6c',
        backgroundColor: '#fff',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#328DD8',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#6c6c6c',
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
