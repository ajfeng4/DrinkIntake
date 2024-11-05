import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/supabaseClient';
import * as FileSystem from 'expo-file-system';

const VoiceRecorder: React.FC = () => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordings, setRecordings] = useState<{ uri: string, id: string }[]>([]);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
    const [playbackProgress, setPlaybackProgress] = useState<number>(0);
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
    const [totalSeconds, setTotalSeconds] = useState<number>(0);
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const initializeUser = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error fetching session:', error);
            } else {
                setUser(session?.user ?? null);
                console.log('Authenticated User:', session?.user);
            }
        };

        initializeUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            console.log('Auth State Changed - User:', session?.user);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (user) {
            console.log('Fetching recordings for user ID:', user.id);
            fetchRecordings();
        }
    }, [user]);

    useEffect(() => {
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access microphone is required!');
            }
            console.log('Microphone permission status:', status);
        })();
    }, []);

    const fetchRecordings = async () => {
        const { data, error } = await supabase
            .from('recordings')
            .select('id, file_url')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching recordings:', error);
            return;
        }
        if (data) {
            const recordingsData = data.map((recording: any) => ({
                uri: supabase.storage.from('recordings').getPublicUrl(recording.file_url).data.publicUrl,
                id: recording.id,
            }));
            setRecordings(recordingsData);
            console.log('Fetched Recordings:', recordingsData);
        }
    };

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access microphone is required!');
                return;
            }
            console.log('Starting recording...');
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync({
                android: {
                    extension: '.m4a',
                    outputFormat: 2,
                    audioEncoder: 3,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    audioQuality: 127,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {
                    mimeType: 'audio/webm',
                    bitsPerSecond: 128000,
                },
            });
            await newRecording.startAsync();
            setRecording(newRecording);
            setIsRecording(true);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        try {
            if (!recording) return;
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            console.log('Recording stopped. URI:', uri);
            if (uri && user) {
                const fileName = `${user.id}/${Date.now()}.m4a`;
                console.log('File name:', fileName);
                const fileInfo = await FileSystem.getInfoAsync(uri);
                const file = {
                    uri: uri,
                    name: fileName,
                    type: 'audio/m4a',
                };
                const response = await fetch(uri);
                const blob = await response.blob();
                console.log('Uploading file:', fileName);
                const { error: uploadError } = await supabase.storage.from('recordings').upload(fileName, blob, {
                    cacheControl: '3600',
                    upsert: false,
                });
                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    return;
                }
                console.log('File uploaded successfully');

                console.log('Inserting recording into database for user ID:', user.id);
                const { data, error: insertError } = await supabase.from('recordings').insert([
                    { user_id: user.id, file_url: fileName },
                ]);
                if (insertError) {
                    console.error('Error inserting recording:', insertError);
                    return;
                }
                console.log('Recording inserted successfully:', data);
                fetchRecordings();
            }
            setRecording(null);
            setIsRecording(false);
            console.log('Recording state reset');
        } catch (error) {
            console.error('Failed to stop recording', error);
        }
    };

    const playSound = async (uri: string, id: string) => {
        try {
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                setCurrentPlayingId(null);
                setPlaybackProgress(0);
                setElapsedSeconds(0);
                setTotalSeconds(0);
                console.log('Unloaded previous sound');
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true },
                (status) => {
                    if (status.isLoaded) {
                        if (status.durationMillis) {
                            setTotalSeconds(Math.floor(status.durationMillis / 1000));
                        }
                        if (status.isPlaying && status.durationMillis) {
                            setPlaybackProgress(status.positionMillis / status.durationMillis);
                            setElapsedSeconds(Math.floor(status.positionMillis / 1000));
                        }
                        if (status.didJustFinish) {
                            setCurrentPlayingId(null);
                            setPlaybackProgress(0);
                            setElapsedSeconds(0);
                            setTotalSeconds(0);
                            console.log('Playback finished');
                        }
                    }
                }
            );
            setSound(newSound);
            setCurrentPlayingId(id);
            console.log('Playing sound:', uri);
        } catch (error) {
            console.error('Failed to play sound', error);
        }
    };

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
                setCurrentPlayingId(null);
                setPlaybackProgress(0);
                setElapsedSeconds(0);
                setTotalSeconds(0);
                console.log('Sound unloaded');
            }
            : undefined;
    }, [sound]);

    const renderItem = ({ item, index }: { item: { uri: string, id: string }, index: number }) => (
        <View style={styles.recordingItem}>
            <Text style={styles.recordingText}>Recording {recordings.length - index}</Text>
            <TouchableOpacity style={styles.playButton} onPress={() => playSound(item.uri, item.id)}>
                <Ionicons name="play-circle" size={40} color="#328DD8" />
            </TouchableOpacity>
            {currentPlayingId === item.id && (
                <>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${playbackProgress * 100}%` }]} />
                    </View>
                    <Text style={styles.timeTracker}>{formatTime(elapsedSeconds)} / {formatTime(totalSeconds)}</Text>
                </>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={isRecording ? stopRecording : startRecording}
                >
                    <Ionicons
                        name={isRecording ? "stop-circle" : "mic-circle"}
                        size={40}
                        color="#328DD8"
                    />
                    <Text style={styles.buttonText}>
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Text>
                </TouchableOpacity>

                <FlatList
                    data={recordings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text style={styles.noRecordings}>No recordings available.</Text>}
                    style={styles.recordingsList}
                />
            </View>
        </SafeAreaView>
    );
};

export default VoiceRecorder;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(240, 246, 255, 0.82)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: 'center',
        height: 100,
        width: '100%',
    },
    buttonText: {
        color: '#328DD8',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    recordingsList: {
        width: '100%',
    },
    recordingItem: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(240, 246, 255, 0.82)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        width: '100%',
    },
    recordingText: {
        fontSize: 16,
        color: '#328DD8',
        marginBottom: 10,
    },
    playButton: {
        padding: 5,
        alignSelf: 'flex-end',
    },
    progressBarContainer: {
        height: 10,
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        marginTop: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#328DD8',
    },
    timeTracker: {
        marginTop: 5,
        fontSize: 14,
        color: '#328DD8',
        alignSelf: 'flex-end',
    },
    noRecordings: {
        fontSize: 16,
        color: '#6c6c6c',
        textAlign: 'center',
        marginTop: 20,
    },
});


