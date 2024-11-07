import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Attributes({ navigation }: any) {
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

    const toggleAttribute = (attribute: string) => {
        setSelectedAttributes((prev) =>
            prev.includes(attribute)
                ? prev.filter((attr) => attr !== attribute)
                : [...prev, attribute]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Let us get to know you!</Text>
            <Text style={styles.subtitle}>Please enter your attributes</Text>
            <View style={styles.attributeContainer}>
                {['18-21', '21-25', '25-30', '30-40'].map((range) => (
                    <TouchableOpacity
                        key={range}
                        style={[
                            styles.attributeButton,
                            selectedAttributes.includes(range) && styles.selectedButton,
                        ]}
                        onPress={() => toggleAttribute(range)}
                    >
                        <Text
                            style={[
                                styles.attributeText,
                                selectedAttributes.includes(range) && styles.selectedText,
                            ]}
                        >
                            {range}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('TermsOfService')}
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
    attributeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    attributeButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#6c6c6c',
        borderRadius: 20,
        margin: 5,
    },
    selectedButton: {
        backgroundColor: '#328DD8',
    },
    attributeText: {
        color: '#6c6c6c',
    },
    selectedText: {
        color: '#fff',
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
