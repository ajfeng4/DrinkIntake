import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, FlatList, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useRouter } from 'expo-router';
import { supabase } from '@/supabaseClient';

type AlertItem = {
    date: string;
    time: string;
    message: string;
};

const alerts: AlertItem[] = [
    { date: '9/10/2024', time: '4:11 PM', message: 'Drink 300ml water' },
    { date: '9/9/2024', time: '4:11 PM', message: 'Drink 300ml water' },
    { date: '9/8/2024', time: '4:11 PM', message: 'Drink 300ml water' },
    { date: '9/7/2024', time: '4:11 PM', message: 'Drink 300ml water' },
    { date: '9/6/2024', time: '4:11 PM', message: 'Drink 300ml water' },
    { date: '9/5/2024', time: '4:11 PM', message: 'Drink 300ml water' },
];

const DrinkIntakeHeader = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('Jane Doe');
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('id', user.id)
                    .single();
                if (data) {
                    setName(`${data.first_name} ${data.last_name}`);
                }
            }
        };
        fetchProfile();
    }, []);

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    const openSettings = () => {
        router.push('/Settings');
    };

    const renderAlert = ({ item }: { item: AlertItem }) => (
        <View style={styles.alertItem}>
            <TabBarIcon name="water-outline" color="#328DD8" />
            <View style={styles.alertText}>
                <Text style={styles.alertDate}>{`${item.date} ${item.time}`}</Text>
                <Text style={styles.alertMessage}>{item.message}</Text>
            </View>
        </View>
    );

    return (
        <View>
            <View style={styles.header}>
                <View>
                    <ThemedText style={styles.headerSubtitle}>Stay hydrated!</ThemedText>
                    <ThemedText style={styles.headerTitle}>{name}</ThemedText>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.settingsIcon} onPress={openSettings}>
                        <TabBarIcon name="settings-outline" color="#333333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.notificationIcon} onPress={toggleModal}>
                        <TabBarIcon name="notifications-outline" color="#333333" />
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={toggleModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                            <TabBarIcon name="close" color="#333333" />
                        </TouchableOpacity>
                        <ThemedText style={styles.modalTitle}>Current Alerts</ThemedText>
                        <FlatList
                            data={alerts}
                            renderItem={renderAlert}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        <TouchableOpacity onPress={toggleModal}>
                            <Text style={styles.moreAlerts}>More Alerts</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    headerButtons: {
        flexDirection: 'row',
    },
    settingsIcon: {
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        padding: 10,
        marginRight: 10,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        width: '80%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#328DD8',
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    alertText: {
        marginLeft: 10,
    },
    alertDate: {
        fontSize: 16,
        color: '#328DD8',
    },
    alertMessage: {
        fontSize: 14,
        color: '#666666',
    },
    moreAlerts: {
        color: '#328DD8',
        marginTop: 10,
        textDecorationLine: 'underline',
    },
});

export default DrinkIntakeHeader;

