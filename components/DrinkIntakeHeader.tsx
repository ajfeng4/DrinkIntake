import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { StyleSheet } from 'react-native';

const DrinkIntakeHeader = () => {
    return (
        <View style={styles.header}>
            <View>
                <ThemedText style={styles.headerSubtitle}>Stay hydrated!</ThemedText>
                <ThemedText style={styles.headerTitle}>Jane Doe</ThemedText>
            </View>
            <View style={styles.notificationIcon}>
                <TabBarIcon name="notifications-outline" color="#333333" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(60, 162, 245, 0.5)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#328DD8',
    },
    notificationIcon: {
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        padding: 10,
    },
});

export default DrinkIntakeHeader;
