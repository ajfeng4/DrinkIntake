import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/supabaseClient';

export default function Attributes({ navigation }: any) {
    const [selectedAttributes, setSelectedAttributes] = useState<{
        ageRange: string;
        weight: string;
        height: string;
        pregnancy: string;
    }>({
        ageRange: '',
        weight: '',
        height: '',
        pregnancy: '',
    });

    const toggleAttribute = (category: 'ageRange' | 'weight' | 'height' | 'pregnancy', attribute: string) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [category]: prev[category] === attribute ? '' : attribute,
        }));
    };

    const handleContinue = async () => {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) {
            console.error('Error fetching user:', userError?.message || 'No user found');
            Alert.alert('Error', 'Unable to fetch user information.');
            return;
        }

        const userId = data.user.id;

        const { error } = await supabase.from('profiles').upsert({
            id: userId,
            ...selectedAttributes,
        });

        if (error) {
            console.error('Error saving attributes:', error.message);
            Alert.alert('Error', 'Failed to save your attributes.');
        } else {
            navigation.navigate('TermsOfService');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Let us get to know you!</Text>
            <Text style={styles.subtitle}>Please enter your attributes</Text>

            <View style={styles.attributeGroup}>
                <Text style={styles.groupLabel}>Age Range</Text>
                <View style={styles.underline} />
                <View style={styles.attributeContainer}>
                    {['18-21', '21-25', '25-30', '30-40'].map((range) => (
                        <TouchableOpacity
                            key={range}
                            style={[
                                styles.attributeButton,
                                selectedAttributes.ageRange === range && styles.selectedButton,
                            ]}
                            onPress={() => toggleAttribute('ageRange', range)}
                        >
                            <Text
                                style={[
                                    styles.attributeText,
                                    selectedAttributes.ageRange === range && styles.selectedText,
                                ]}
                            >
                                {range}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.attributeGroup}>
                <Text style={styles.groupLabel}>Weight</Text>
                <View style={styles.underline} />
                <View style={styles.attributeContainer}>
                    {['80-100', '100-120', '120-150', '150-200'].map((weight) => (
                        <TouchableOpacity
                            key={weight}
                            style={[
                                styles.attributeButton,
                                selectedAttributes.weight === weight && styles.selectedButton,
                            ]}
                            onPress={() => toggleAttribute('weight', weight)}
                        >
                            <Text
                                style={[
                                    styles.attributeText,
                                    selectedAttributes.weight === weight && styles.selectedText,
                                ]}
                            >
                                {weight}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.attributeGroup}>
                <Text style={styles.groupLabel}>Height</Text>
                <View style={styles.underline} />
                <View style={styles.attributeContainer}>
                    {['Lower-4\'0', '4\'0-5\'0', '5\'0-6\'0', '6\'0-Higher'].map((height) => (
                        <TouchableOpacity
                            key={height}
                            style={[
                                styles.attributeButton,
                                selectedAttributes.height === height && styles.selectedButton,
                            ]}
                            onPress={() => toggleAttribute('height', height)}
                        >
                            <Text
                                style={[
                                    styles.attributeText,
                                    selectedAttributes.height === height && styles.selectedText,
                                ]}
                            >
                                {height}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.attributeGroup}>
                <Text style={styles.groupLabel}>Pregnancy</Text>
                <View style={styles.underline} />
                <View style={styles.attributeContainer}>
                    {['None', '0w-5w', '5w-12w', '12w-16w'].map((pregnancy) => (
                        <TouchableOpacity
                            key={pregnancy}
                            style={[
                                styles.attributeButton,
                                selectedAttributes.pregnancy === pregnancy && styles.selectedButton,
                            ]}
                            onPress={() => toggleAttribute('pregnancy', pregnancy)}
                        >
                            <Text
                                style={[
                                    styles.attributeText,
                                    selectedAttributes.pregnancy === pregnancy && styles.selectedText,
                                ]}
                            >
                                {pregnancy}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
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
        marginBottom: 20,
    },
    attributeGroup: {
        marginBottom: 20,
    },
    groupLabel: {
        fontSize: 16,
        color: '#6c6c6c',
        textAlign: 'center',
        marginBottom: 5,
    },
    underline: {
        width: '100%',
        height: 1,
        backgroundColor: '#6c6c6c',
        marginBottom: 10,
    },
    attributeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    attributeButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#6c6c6c',
        borderRadius: 20,
        margin: 5,
        minWidth: 70,
        alignItems: 'center',
    },
    selectedButton: {
        backgroundColor: '#328DD8',
    },
    attributeText: {
        color: '#6c6c6c',
        fontSize: 10,
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
        fontSize: 14,
    },
});
