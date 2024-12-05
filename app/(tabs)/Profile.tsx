import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';
import { supabase } from '@/supabaseClient';

interface UserProfile {
    first_name: string;
    last_name: string;
    gender: string;
    age: number;
    weight: string;
    height: string;
    pregnancy: string;
}

export default function Profile() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data.user) {
                console.error('Error fetching user:', error?.message || 'No user found');
                return;
            }
            const userId = data.user.id;
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (profileError) {
                console.error('Error fetching profile:', profileError.message);
                return;
            }
            setProfile(profileData);
        };
        fetchProfile();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <DrinkIntakeHeader />

                <View style={styles.profilePictureContainer}>
                    <Text style={styles.profilePictureText}>🙂</Text>
                </View>

                {profile && (
                    <>
                        <Text style={styles.Name}>{`${profile.first_name} ${profile.last_name}`}</Text>
                        <Text style={styles.userDetails}>{profile.gender}</Text>
                        <Text style={styles.userDetails}>{profile.weight}</Text>
                        <Text style={styles.userDetails}>{profile.age} years old</Text>
                        <Text style={styles.userDetails}>{profile.height}</Text>
                        {profile.pregnancy !== 'None' && (
                            <Text style={styles.userDetails}>{`Pregnancy: ${profile.pregnancy}`}</Text>
                        )}
                    </>
                )}

                <Text style={styles.achievementsText}>Met Weekly Objectives 3x</Text>

                <TouchableOpacity
                    style={styles.editProfileButton}
                    onPress={() => router.push('/ExploreScreen')}
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
        marginTop: 30,
        marginBottom: 10,
        alignSelf: 'center',
    },
    profilePictureText: {
        fontSize: 60,
        color: '#328DD8',
    },
    userDetails: {
        fontSize: 12,
        color: '#328DD8',
        fontWeight: 'semibold',
        marginTop: 2,
        alignSelf: 'center',
    },
    Name: {
        fontSize: 26,
        color: '#328DD8',
        fontWeight: 'semibold',
        marginTop: 2,
        alignSelf: 'center',
    },
    achievementsText: {
        fontSize: 16,
        color: '#328DD8',
        marginTop: 100,
        marginBottom: 100,
        alignSelf: 'center',
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
