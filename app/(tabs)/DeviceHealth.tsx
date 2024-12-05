import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';

export default function DeviceHealth() {
    const logs = [
        { id: 1, time: '9/10/2024 5:31 PM', message: 'System diagnostics failed', icon: <MaterialIcons name="cancel" size={24} color="#E74C3C" />, color: '#FDEDEC' },
        { id: 2, time: '9/10/2024 5:25 PM', message: 'System failed to startup', icon: <MaterialIcons name="cancel" size={24} color="#E74C3C" />, color: '#FDEDEC' },
        { id: 3, time: '9/10/2024 5:15 PM', message: 'Device not detected', icon: <Ionicons name="wifi" size={24} color="#E74C3C" />, color: '#FDEDEC' },
        { id: 4, time: '9/10/2024 5:15 PM', message: 'Scan ran, device detected', icon: <Ionicons name="wifi" size={24} color="#27AE60" />, color: '#E8F6F3' },
        { id: 5, time: '9/10/2024 5:05 PM', message: 'System startup successful', icon: <MaterialIcons name="check-circle" size={24} color="#27AE60" />, color: '#E8F6F3' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <DrinkIntakeHeader />
                {logs.map((log) => {
                    const textColor = log.color === '#FDEDEC' ? '#E74C3C' : '#27AE60';
                    return (
                        <View key={log.id} style={[styles.logItem, { backgroundColor: log.color }]}>
                            <View style={styles.logIcon}>{log.icon}</View>
                            <View style={styles.logText}>
                                <Text style={[styles.logTime, { color: textColor }]}>{log.time}</Text>
                                <Text style={[styles.logMessage, { color: textColor }]}>{log.message}</Text>
                            </View>
                        </View>
                    );
                })}
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Configure Connection</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 15,
        borderRadius: 10,
    },
    logIcon: {
        marginRight: 10,
    },
    logText: {
        flex: 1,
    },
    logTime: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    logMessage: {
        fontSize: 14,
    },
    button: {
        backgroundColor: '#328DD8',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 20,
        width: 250,

    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
