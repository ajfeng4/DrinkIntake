import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, Feather, AntDesign } from '@expo/vector-icons';

export default function Settings() {
    return (
        <View style={styles.container}>
            {settingsOptions.map((option, index) => (
                <TouchableOpacity key={index} style={styles.option}>
                    {option.icon}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{option.title}</Text>
                        <Text style={styles.subtitle}>{option.subtitle}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const settingsOptions = [
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
});
