import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';

export default function Profile() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <DrinkIntakeHeader />


                <View style={styles.profilePictureContainer}>
                    <Text style={styles.profilePictureText}>🙂</Text>
                </View>

                <Text style={styles.userDetails}>Jane Doe</Text>
                <Text style={styles.userDetails}>Female</Text>
                <Text style={styles.userDetails}>Rookie</Text>
                <Text style={styles.userDetails}>40 years old</Text>

                <Text style={styles.achievementsText}>Met Weekly Objectives 3x</Text>

                <TouchableOpacity
                    style={styles.editProfileButton}
                    onPress={() => console.log('Edit Profile')}
                >
                    <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>
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
        backgroundColor: 'white',
    },
    header: {
        marginTop: 20,
        marginBottom: 20,
    },
    greetingText: {
        fontSize: 16,
        color: '#328DD8',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 24,
        color: '#328DD8',
        fontWeight: 'bold',
        marginTop: 5,
    },
    profilePictureContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(240, 246, 255, 0.82)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        alignSelf: 'center',
    },
    profilePictureText: {
        fontSize: 60,
        color: '#328DD8',
    },
    userDetails: {
        fontSize: 18,
        color: '#328DD8',
        fontWeight: 'bold',
        marginTop: 10,
    },
    achievementsText: {
        fontSize: 16,
        color: '#328DD8',
        marginTop: 20,
    },
    editProfileButton: {
        backgroundColor: '#328DD8',
        padding: 15,
        borderRadius: 10,
        marginTop: 30,
        width: '60%',
        alignSelf: 'center',
        alignItems: 'center',
    },
    editProfileButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
