import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/supabaseClient';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { Asset } from 'expo-asset';

interface SpectrogramData {
    data: number[][];
    sampleRate: number;
}

const extractSpectrogram = async (audioBuffer: ArrayBuffer): Promise<tf.Tensor> => {
    return tf.tidy(() => {
        try {
            // Debug input buffer
            console.log('Audio buffer size:', audioBuffer.byteLength);
            
            // Convert buffer to Float32Array
            const view = new DataView(audioBuffer);
            const audioData = new Float32Array(Math.floor(audioBuffer.byteLength / 2));
            
            // Debug first few samples
            console.log('First few raw samples:', 
                view.getInt16(0, true),
                view.getInt16(2, true),
                view.getInt16(4, true)
            );
            
            // Convert 16-bit PCM to float32 [-1, 1]
            for (let i = 0; i < audioBuffer.byteLength - 1; i += 2) {
                const sample = view.getInt16(i, true);
                audioData[i / 2] = sample / 32768.0;
            }

            // Debug normalized audio data
            console.log('First few normalized samples:', 
                audioData[0],
                audioData[1],
                audioData[2]
            );

            // Create tensor from audio data
            let y = tf.tensor1d(audioData);
            console.log('Initial audio tensor shape:', y.shape);
            console.log('Audio tensor stats:', {
                min: y.min().dataSync()[0],
                max: y.max().dataSync()[0],
                mean: y.mean().dataSync()[0]
            });

            // Ensure exactly 2 seconds at 16kHz (32000 samples)
            if (y.shape[0] > 32000) {
                y = y.slice([0], [32000]);
            } else if (y.shape[0] < 32000) {
                const padding = tf.zeros([32000 - y.shape[0]]);
                y = tf.concat([y, padding]);
            }

            console.log('Padded audio tensor shape:', y.shape);

            // Create mel spectrogram
            const frameLength = 2048;
            const hopLength = 512;
            const fftSize = 2048;
            const nMels = 128;

            // Compute STFT
            const stft = tf.signal.stft(
                y,
                frameLength,
                hopLength,
                fftSize,
                tf.hannWindow
            );
            console.log('STFT shape:', stft.shape);
            
            // Debug STFT values
            const stftData = stft.dataSync();
            console.log('STFT stats:', {
                hasNaN: stftData.some(x => isNaN(x)),
                firstFew: stftData.slice(0, 3)
            });

            // Convert to power spectrogram with safe operations
            const magnitudeSpec = tf.abs(stft);
            const powerSpec = tf.square(magnitudeSpec);
            
            // Debug power spectrogram
            console.log('Power spectrogram shape:', powerSpec.shape);
            const powerSpecData = powerSpec.dataSync();
            console.log('Power spectrogram stats:', {
                hasNaN: powerSpecData.some(x => isNaN(x)),
                min: Math.min(...powerSpecData),
                max: Math.max(...powerSpecData)
            });

            // Ensure no zeros before log operation
            const epsilon = tf.scalar(1e-6);
            const safePowerSpec = tf.maximum(powerSpec, epsilon);

            // Convert to mel scale with safe operations
            const melSpec = tf.image.resizeBilinear(
                safePowerSpec.expandDims(-1),
                [nMels, 63]
            );
            console.log('Mel spectrogram shape:', melSpec.shape);

            // Add small offset and take log with safe operations
            const offset = tf.scalar(1e-6);
            const stabilizedMelSpec = tf.add(melSpec, offset);
            const logMelSpec = tf.log(stabilizedMelSpec);
            
            // Debug log-mel spectrogram
            const logMelData = logMelSpec.dataSync();
            console.log('Log-mel spectrogram stats:', {
                hasNaN: logMelData.some(x => isNaN(x)),
                min: Math.min(...logMelData),
                max: Math.max(...logMelData),
                mean: logMelData.reduce((a, b) => a + b, 0) / logMelData.length
            });

            // Clip values to avoid extreme ranges
            const clippedLogMel = tf.clipByValue(logMelSpec, -20, 0);

            // Normalize to [0, 1] range
            const minVal = clippedLogMel.min();
            const maxVal = clippedLogMel.max();
            const normalizedSpec = tf.div(
                tf.sub(clippedLogMel, minVal),
                tf.sub(maxVal, minVal)
            );

            // Debug normalized spectrogram
            const normalizedData = normalizedSpec.dataSync();
            console.log('Normalized spectrogram stats:', {
                hasNaN: normalizedData.some(x => isNaN(x)),
                min: Math.min(...normalizedData),
                max: Math.max(...normalizedData),
                mean: normalizedData.reduce((a, b) => a + b, 0) / normalizedData.length
            });

            // Reshape and add batch dimension
            const reshapedSpec = normalizedSpec.reshape([128, 63, 1]);
            const finalTensor = reshapedSpec.expandDims(0);

            // Final validation
            const finalData = finalTensor.dataSync();
            console.log('Final tensor stats:', {
                shape: finalTensor.shape,
                hasNaN: finalData.some(x => isNaN(x)),
                min: Math.min(...finalData),
                max: Math.max(...finalData),
                mean: finalData.reduce((a, b) => a + b, 0) / finalData.length
            });

            if (finalData.some(x => isNaN(x))) {
                throw new Error('NaN values detected in final tensor');
            }

            return finalTensor;
        } catch (error) {
            console.error('Error in extractSpectrogram:', error);
            throw error;
        }
    });
};

const CONFIDENCE_THRESHOLD = 0.6; // Adjust this value based on your needs

const getClassification = (probability: number) => {
    if (probability > (1 - CONFIDENCE_THRESHOLD)) {
        return "NotSwallowing";
    } else if (probability < CONFIDENCE_THRESHOLD) {
        return "Swallowing";
    } else {
        return "Uncertain";
    }
};

const predictAudioClass = async (
    uri: string,
    model: tf.LayersModel
): Promise<{ result: string; prediction: number }> => {
    try {
        // Load audio file
        const response = await fetch(uri);
        const audioBuffer = await response.arrayBuffer();
        
        // Extract spectrogram
        const spectrogram = await extractSpectrogram(audioBuffer);
        console.log('Spectrogram shape:', spectrogram.shape);
        
        // Debug spectrogram values
        const spectrogramData = await spectrogram.data();
        console.log('Input spectrogram stats:', {
            min: Math.min(...spectrogramData),
            max: Math.max(...spectrogramData),
            mean: spectrogramData.reduce((a, b) => a + b, 0) / spectrogramData.length
        });

        // Make prediction with tf.tidy for memory management
        const prediction = tf.tidy(() => {
            const pred = model.predict(spectrogram) as tf.Tensor;
            // Apply sigmoid activation using tf.sigmoid
            return tf.sigmoid(pred);
        });
        
        const predictionValue = (await prediction.data())[0];
        const result = getClassification(predictionValue);
        
        console.log('Prediction details:', {
            probability: predictionValue,
            class: result,
            confidence: Math.abs(0.5 - predictionValue) * 2 // Scale to 0-1
        });

        // Cleanup
        tf.dispose([spectrogram, prediction]);

        return {
            result,
            prediction: predictionValue
        };
    } catch (error) {
        console.error('Error in predictAudioClass:', error);
        throw error;
    }
};

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
    const [model, setModel] = useState<tf.LayersModel | null>(null);

    const stopRecordingInProgress = useRef(false);
    const [recordingTimeout, setRecordingTimeout] = useState<NodeJS.Timeout | null>(null);

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

    useEffect(() => {
        const loadModel = async () => {
            try {
                console.log('Starting model loading...');
                await tf.ready();
                console.log('TF Ready');

                // Define model paths
                const modelJSON = require('../../assets/tfjs_model/model.json');
                const weights = [
                    require('../../assets/tfjs_model/group1-shard1of4.bin'),
                    require('../../assets/tfjs_model/group1-shard2of4.bin'),
                    require('../../assets/tfjs_model/group1-shard3of4.bin'),
                    require('../../assets/tfjs_model/group1-shard4of4.bin')
                ];

                // Log model structure
                console.log('Model JSON structure:', JSON.stringify(modelJSON.modelTopology.model_config.config.layers[0], null, 2));
                console.log('Weight files loaded:', weights.length);

                // Try loading with explicit input layer configuration
                const customModelJSON = {
                    ...modelJSON,
                    modelTopology: {
                        ...modelJSON.modelTopology,
                        model_config: {
                            ...modelJSON.modelTopology.model_config,
                            config: {
                                ...modelJSON.modelTopology.model_config.config,
                                layers: [
                                    {
                                        class_name: "InputLayer",
                                        config: {
                                            batch_input_shape: [null, 128, 63, 1],
                                            dtype: "float32",
                                            sparse: false,
                                            name: "input_layer"
                                        }
                                    },
                                    ...modelJSON.modelTopology.model_config.config.layers.slice(1)
                                ]
                            }
                        }
                    }
                };

                // Load the model
                const loadedModel = await tf.loadLayersModel(
                    bundleResourceIO(customModelJSON, weights),
                    { strict: false }
                );

                // Compile the model with the correct loss function name
                loadedModel.compile({
                    optimizer: 'adam',
                    loss: 'binaryCrossentropy',
                    metrics: ['accuracy']
                });

                console.log('Model loaded successfully');
                loadedModel.summary();
                setModel(loadedModel);

            } catch (error) {
                console.error('Error loading model:', error);
                if (error instanceof Error) {
                    console.error('Error message:', error.message);
                    console.error('Error stack:', error.stack);
                }
            }
        };

        loadModel();
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

    const recordAndClassify = async (model: tf.LayersModel): Promise<void> => {
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
    
            // Wait for 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
    
            // Stop recording
            await recording.stopAndUnloadAsync();
            console.log('Recording complete.');
    
            const uri = recording.getURI();
            if (!uri) throw new Error('No URI for recording');
            console.log('Audio saved to:', uri);
    
            // Classify the recording
            const { result, prediction } = await predictAudioClass(uri, model);
            console.log('Predicted class:', result, 'Confidence:', prediction);
            
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
                    .insert([{ user_id: user.id, file_url: fileName }]);
    
                if (insertError) {
                    console.error('Error inserting recording:', insertError);
                    return;
                }
                
                console.log('Recording inserted successfully:', data);
                fetchRecordings();
            }
    
            return { result, prediction };
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

    const handleRecordAndClassify = async () => {
        if (!model) {
            console.error('Model not loaded');
            return;
        }

        setIsRecording(true);
        try {
            const result = await recordAndClassify(model);
            // Handle the result (e.g., update UI)
            console.log('Classification result:', result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsRecording(false);
        }
    };

    // Button handler
    const handlePress = async () => {
        if (isRecording) {
            setIsRecording(false);
            return;
        }

        if (!model) {
            console.error('Model not loaded');
            return;
        }

        try {
            await handleRecordAndClassify();
        } catch (error) {
            console.error('Recording failed:', error);
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

