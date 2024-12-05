import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedTab, setSelectedTab] = useState('email');
    const router = useRouter();

    const handleSignup = async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            Alert.alert('Signup error', error.message);
        } else if (data?.user) {
            Alert.alert('Signup successful!', 'Please check your email for verification.');
            router.replace('/FirstAndLastName');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Please sign up to create your account</Text>
            <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setSelectedTab('email')}>
                    <Text style={selectedTab === 'email' ? styles.selectedTab : styles.tab}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab('phone')}>
                    <Text style={selectedTab === 'phone' ? styles.selectedTab : styles.tab}>Phone Number</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab('sso')}>
                    <Text style={selectedTab === 'sso' ? styles.selectedTab : styles.tab}>Single Sign On</Text>
                </TouchableOpacity>
            </View>
            {selectedTab === 'email' && (
                <>
                    <TextInput
                        placeholder="Enter your Email"
                        placeholderTextColor="#6c6c6c"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#6c6c6c"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={() => router.push('/auth/SignIn')}>
                        <Text style={styles.signupText}>Already have an account? Sign In</Text>
                    </TouchableOpacity>
                </>
            )}
            {selectedTab === 'phone' && (
                <>
                    <TextInput
                        placeholder="Enter your Phone Number"
                        placeholderTextColor="#6c6c6c"
                        style={styles.input}
                        keyboardType="phone-pad"
                    />
                    <TouchableOpacity onPress={() => router.push('/auth/SignIn')}>
                        <Text style={styles.signupText}>Already have an account? Sign In</Text>
                    </TouchableOpacity>
                </>
            )}
            {selectedTab === 'sso' && (
                <>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>Sign up with Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>Sign up with Apple</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>Sign up with WhatsApp</Text>
                    </TouchableOpacity>
                </>
            )}
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 30,
        fontWeight: 'normal',
        textAlign: 'center',
        color: '#328DD8',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#328DD8',
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    tab: {
        marginHorizontal: 10,
        fontSize: 12,
        color: '#328DD8',
        paddingBottom: 5,
    },
    selectedTab: {
        marginHorizontal: 10,
        fontSize: 12,
        color: '#328DD8',
        borderBottomWidth: 2,
        borderBottomColor: '#328DD8',
        paddingBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        fontSize: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#6c6c6c',
        marginVertical: 10,
    },
    socialButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: 10,
        borderWidth: 0.5,
        borderColor: '#9D9D9D',
        width: 330,
    },
    socialButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'normal',
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: 'center',
        marginVertical: 10,
        borderWidth: 0.5,
        borderColor: '#9D9D9D',
        width: 200,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#328DD8',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupText: {
        fontSize: 12,
        color: '#328DD8',
        textAlign: 'left',
    },
});
