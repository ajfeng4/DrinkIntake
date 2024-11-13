import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/supabaseClient';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

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

    const stopRecordingInProgress = useRef(false);
    const [recordingProgress, setRecordingProgress] = useState(0);

    useEffect(() => {
        let progressInterval: NodeJS.Timeout;
        
        if (isRecording) {
            setRecordingProgress(0);
            progressInterval = setInterval(() => {
                setRecordingProgress(prev => {
                    const newProgress = prev + 0.05;
                    if (newProgress >= 1) {
                        clearInterval(progressInterval);
                        return 1;
                    }
                    return newProgress;
                });
            }, 100);
        } else {
            setRecordingProgress(0);
        }

        return () => {
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        };
    }, [isRecording]);

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

    const recordAndClassify = async (): Promise<void> => {
        try {
            // Request permissions
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                throw new Error('Permission not granted');
            }
    
            // Configure audio
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
    
            // Setup recording options (matching Python parameters)
            const recordingOptions: Audio.RecordingOptions = {
                android: {
                    extension: '.wav',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WAV,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 256000,
                },
                ios: {
                    extension: '.wav',
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 256000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
                },
            };
    
            // Start recording
            console.log('Recording...');
            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(recordingOptions);
            await recording.startAsync();
    
            // Wait for 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));
    
            // Stop recording
            await recording.stopAndUnloadAsync();
            console.log('Recording complete.');
    
            const uri = recording.getURI();
            if (!uri) throw new Error('No URI for recording');
            console.log('Audio saved to:', uri);
            
            // Send the recorded file to the Flask API
            const formData = new FormData();
            formData.append('file', {
                uri,
                type: 'audio/wav',
                name: 'recording.wav'
            });

            try {
                const response = await fetch('https://shining-serval-destined.ngrok-free.app/drinkintake/api/classify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData
                });
            
                // Check if the response was successful
                if (!response.ok) {
                    console.error(`Error: ${response.status} ${response.statusText}`);
                    return;
                }
            
                // Parse the JSON response
                const { result, confidence } = await response.json();
                console.log('Predicted class:', result, 'Confidence:', confidence);
            
            } catch (error) {
                // Log any errors that occur during fetch
                console.error('Failed to fetch the API:', error);
            }
            
            if (uri && user) {
                const fileName = `${user.id}/${Date.now()}.wav`;
                console.log('File name:', fileName);
    
                // Read the file content
                const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
                
                // Convert to ArrayBuffer
                const buffer = Buffer.from(fileContent, 'base64');
                
                // Upload using the raw buffer
                const { error: uploadError } = await supabase.storage
                    .from('recordings')
                    .upload(fileName, buffer.buffer, {
                        contentType: 'audio/wav',
                        upsert: false,
                    });
    
                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    return;
                }
    
                console.log('File uploaded successfully');
                console.log('Inserting recording into database for user ID:', user.id);
                
                const { data, error: insertError } = await supabase
                    .from('recordings')
                    .insert([{ user_id: user.id, file_url: fileName, prediction_class: result}]);
    
                if (insertError) {
                    console.error('Error inserting recording:', insertError);
                    return;
                }
                
                console.log('Recording inserted successfully:', data);
                fetchRecordings();
            }
        } catch (error) {
            console.error('Error in recordAndClassify:', error);
            throw error;
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

    // Button handler
    const handlePress = async () => {
        if (isRecording) {
            setIsRecording(false);  // Stop recording state
            return;
        }
    
        // Start recording and classification process
        setIsRecording(true);  // Update state to indicate recording is in progress
        try {
            await recordAndClassify();  // Call the function to record and classify
        } catch (error) {
            console.error('Error recording and classifying:', error);
        } finally {
            setIsRecording(false);  // Reset state after classification is complete
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.container}>
                <View style={styles.recordingContainer}>
                    <TouchableOpacity
                        style={[styles.button, isRecording && styles.buttonRecording]}
                        onPress={handlePress}
                        disabled={stopRecordingInProgress.current || recordingProgress >= 1}
                    >
                        <Ionicons
                            name={isRecording ? "stop-circle" : "mic-circle"}
                            size={40}
                            color={isRecording ? "#6c6c6c" : "#328DD8"}
                        />
                        <Text style={styles.buttonText}>
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </Text>
                    </TouchableOpacity>
                </View>

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

