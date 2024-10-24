import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const drinkIntakes = [
    { date: '9/10/2024', time: '5:31 PM', amount: 'Drank 300ml of water' },
    { date: '9/10/2024', time: '5:20 PM', amount: 'Drank 300ml of water' },
    { date: '9/10/2024', time: '5:10 PM', amount: 'Drank 300ml of water' },
    { date: '9/10/2024', time: '5:00 PM', amount: 'Drank 300ml of water' },
    { date: '9/10/2024', time: '4:11 PM', amount: 'Drank 300ml of water' },
];

export default function HomeScreen() {
    const insets = useSafeAreaInsets();

    const renderDrinkIntake = ({ item }: { item: { date: string, time: string, amount: string } }) => (
        <View style={styles.intakeItem}>
            <TabBarIcon name="happy-outline" color="#328DD8" size={40} />
            <View style={styles.intakeText}>
                <Text style={styles.intakeTime}>{`${item.date} ${item.time}`}</Text>
                <Text style={styles.intakeAmount}>{item.amount}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
            {/* Use FlatList for scrolling and rendering the entire content */}
            <FlatList
                ListHeaderComponent={<DrinkIntakeHeader />}
                data={drinkIntakes}
                renderItem={renderDrinkIntake}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.container}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    intakeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(240, 246, 255, 0.82)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    intakeText: {
        marginLeft: 15,
    },
    intakeTime: {
        fontSize: 16,
        color: '#328DD8',
        fontWeight: 'bold',
    },
    intakeAmount: {
        fontSize: 14,
        color: '#328DD8',
    },
});
