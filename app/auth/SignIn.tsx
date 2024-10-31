import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { supabase } from '@/supabaseClient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';

type SignInScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignIn'>;

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedTab, setSelectedTab] = useState('email');
    const navigation = useNavigation<SignInScreenNavigationProp>();

    const handleSignin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            Alert.alert('Signin error', error.message);
        } else if (data?.user) {
            navigation.navigate('(tabs)');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Please sign in to access your water drinking records</Text>
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
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signupText}>Don't have an account? Sign up</Text>
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
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signupText}>Don't have an account? Sign up</Text>
                    </TouchableOpacity>
                </>
            )}
            {selectedTab === 'sso' && (
                <>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>Sign in with Apple</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>Sign in with WhatsApp</Text>
                    </TouchableOpacity>
                </>
            )}
            <View style={styles.rememberMeContainer}>
                <TouchableOpacity style={styles.checkbox}></TouchableOpacity>
                <Text style={styles.rememberMeText}>Remember Me</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSignin}>
                <Text style={styles.buttonText}>Login</Text>
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
        fontWeight: 'regular',
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
        borderColor: "#9D9D9D",
        width: 330,
    },
    socialButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'regular',
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        backgroundColor: '#328DD8',
        marginRight: 10,
    },
    rememberMeText: {
        fontSize: 14,
        color: '#9D9D9D',
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
        alignSelf: "center"
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
