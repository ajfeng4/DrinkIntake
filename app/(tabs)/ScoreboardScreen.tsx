import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';

const scoreboardData = [
    { name: 'Alex Thompson', goalsmet: '25 Goals Met', rank: 1, change: '1=' },
    { name: 'Sarah Chen', goalsmet: '23 Goals Met', rank: 2, change: '3↑' },
    { name: 'Mike Johnson', goalsmet: '21 Goals Met', rank: 3, change: '1↓' },
    { name: 'Emma Davis', goalsmet: '19 Goals Met', rank: 4, change: '2↑' },
    { name: 'James Wilson', goalsmet: '18 Goals Met', rank: 5, change: '1↓' },
    { name: 'Lisa Anderson', goalsmet: '17 Goals Met', rank: 6, change: '2↑' },
    { name: 'David Kim', goalsmet: '15 Goals Met', rank: 7, change: '1=' },
    { name: 'Rachel Brown', goalsmet: '14 Goals Met', rank: 8, change: '3↓' },
    { name: 'Chris Martinez', goalsmet: '12 Goals Met', rank: 9, change: '2↑' },
    { name: 'Sophie Taylor', goalsmet: '11 Goals Met', rank: 10, change: '1↓' },
].sort((a, b) => a.rank - b.rank); // Sort by rank (ascending order)

export default function ScoreboardScreen() {
    const insets = useSafeAreaInsets();

    const renderScoreboardItem = ({ item }: { item: { name: string, goalsmet: string, rank: number, change: string } }) => (
        <View style={styles.scoreItem}>
            <View style={styles.leftContent}>
                <TabBarIcon name="happy-outline" color="#328DD8" size={40} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.goalsText}>{item.goalsmet}</Text>
                </View>
            </View>
            <View style={styles.rightContent}>
                <View style={styles.statsColumn}>
                    <Text style={styles.statsLabel}>Rank</Text>
                    <Text style={styles.statsValue}>{item.rank}</Text>
                </View>
                <View style={styles.statsColumn}>
                    <Text style={styles.statsLabel}>Change</Text>
                    <Text style={[styles.statsValue, styles.changeValue]}>{item.change}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
            <FlatList
                ListHeaderComponent={<DrinkIntakeHeader />}
                data={scoreboardData}
                renderItem={renderScoreboardItem}
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
    scoreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F0F6FF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userInfo: {
        marginLeft: 15,
    },
    userName: {
        fontSize: 16,
        color: '#328DD8',
        fontWeight: '600',
    },
    goalsText: {
        fontSize: 14,
        color: '#328DD8',
        opacity: 0.8,
    },
    rightContent: {
        flexDirection: 'row',
        gap: 20,
    },
    statsColumn: {
        alignItems: 'center',
    },
    statsLabel: {
        fontSize: 12,
        color: '#328DD8',
        opacity: 0.8,
    },
    statsValue: {
        fontSize: 14,
        color: '#328DD8',
        fontWeight: '600',
    },
    changeValue: {
        color: '#4CAF50',
    },
}); 