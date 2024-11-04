import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VoiceRecorder: React.FC = () => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordings, setRecordings] = useState<{ uri: string, id: string }[]>([]);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access microphone is required!');
            }
        })();
    }, []);

    const startRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access microphone is required!');
                return;
            }

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
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        try {
            if (!recording) return;
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            if (uri) {
                setRecordings(prev => [...prev, { uri, id: Date.now().toString() }]);
            }
            setRecording(null);
            setIsRecording(false);
        } catch (error) {
            console.error('Failed to stop recording', error);
        }
    };

    const playSound = async (uri: string) => {
        try {
            const { sound } = await Audio.Sound.createAsync({ uri });
            setSound(sound);
            await sound.playAsync();
        } catch (error) {
            console.error('Failed to play sound', error);
        }
    };

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const renderItem = ({ item, index }: { item: { uri: string, id: string }, index: number }) => (
        <View style={styles.recordingItem}>
            <Text style={styles.recordingText}>Recording {recordings.length - index}</Text>
            <TouchableOpacity style={styles.playButton} onPress={() => playSound(item.uri)}>
                <Ionicons name="play-circle" size={40} color="#328DD8" />
            </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(240, 246, 255, 0.82)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    recordingText: {
        fontSize: 16,
        color: '#328DD8',
    },
    playButton: {
        padding: 5,
    },
    noRecordings: {
        fontSize: 16,
        color: '#6c6c6c',
        textAlign: 'center',
        marginTop: 20,
    },
});

