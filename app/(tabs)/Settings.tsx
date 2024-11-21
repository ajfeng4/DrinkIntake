import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons, MaterialIcons, Feather, AntDesign } from '@expo/vector-icons';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';

interface SettingOption {
    icon: JSX.Element;
    title: string;
    subtitle: string;
}

const settingsOptions: SettingOption[] = [
    {
        icon: <Ionicons name="person-circle-outline" size={30} color="#2782CC" />,
        title: 'User Profile',
        subtitle: 'Manage your user profile',
    },
    {
        icon: <MaterialIcons name="feedback" size={30} color="#2782CC" />,
        title: 'Send Feedback',
        subtitle: 'Let us know about your opinion!',
    },
    {
        icon: <Ionicons name="battery-half-outline" size={30} color="#2782CC" />,
        title: 'Device Battery',
        subtitle: 'Track the health of your device',
    },
    {
        icon: <Feather name="bar-chart" size={30} color="#2782CC" />,
        title: 'Device Statistics',
        subtitle: 'Track the stats of your device',
    },
    {
        icon: <AntDesign name="logout" size={30} color="#2782CC" />,
        title: 'Log Out',
        subtitle: 'End your session',
    },
    {
        icon: <Feather name="file-text" size={30} color="#2782CC" />,
        title: 'Terms of Service',
        subtitle: 'Check the TOS',
    },
];

const Settings = () => {
    const router = useRouter();
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/auth/SignIn');
    };

    const handleOptionPress = (title: string) => {
        if (title === 'Log Out') {
            setIsLogoutModalVisible(true);
        }
    };

    return (
        <View style={styles.container}>
            <DrinkIntakeHeader />
            {settingsOptions.map((option, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.option}
                    onPress={() => handleOptionPress(option.title)}
                >
                    {option.icon}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{option.title}</Text>
                        <Text style={styles.subtitle}>{option.subtitle}</Text>
                    </View>
                </TouchableOpacity>
            ))}
            <Modal
                transparent
                visible={isLogoutModalVisible}
                animationType="fade"
                onRequestClose={() => setIsLogoutModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Log Out</Text>
                        <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsLogoutModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.logoutButton]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.logoutButtonText}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
    },
    textContainer: {
        marginLeft: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#328DD8',
    },
    subtitle: {
        fontSize: 14,
        color: '#A0A0A0',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#328DD8',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: '#6c6c6c',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#A0A0A0',
    },
    logoutButton: {
        backgroundColor: '#2782CC',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default Settings;

