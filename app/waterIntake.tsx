import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const WaterIntakeScreen = () => {
  const insets = useSafeAreaInsets();
  const [hydrationPercentage, setHydrationPercentage] = useState(60);
  const [dropOpacity] = useState(new Animated.Value(0));
  const [dropSize] = useState(new Animated.Value(1));
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.spring(dropSize, {
        toValue: 1 + (hydrationPercentage / 100) * 0.5,
        useNativeDriver: true,
      }),
      Animated.timing(dropOpacity, {
        toValue: hydrationPercentage > 0 ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [hydrationPercentage]);

  const getHydrationStatus = () => {
    if (hydrationPercentage === 0) return 'Unhydrated';
    if (hydrationPercentage >= 90) return 'Fully Hydrated';
    if (hydrationPercentage >= 70) return 'Well Hydrated';
    if (hydrationPercentage >= 50) return 'Hydrated';
    if (hydrationPercentage >= 30) return 'Slightly Dehydrated';
    return 'Dehydrated';
  };

  const getRecommendationText = () => {
    if (hydrationPercentage === 0) return 'You need to drink 20ml for hydration!';
    if (hydrationPercentage >= 90) return 'You are currently hydrated!';
    const amountTodrink = Math.round((100 - hydrationPercentage) * 2);
    return `We recommend you drink ${amountTodrink}ml of water`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: "",
          headerBackTitle: " ",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
        }}
      >
        <DrinkIntakeHeader />

        <View style={styles.waterDropContainer}>
          <Animated.View style={[
            styles.waterDropWrapper,
            { 
              transform: [{ scale: dropSize }],
              opacity: dropOpacity
            }
          ]}>
            <Image
              source={require('../assets/images/water-drop.png')}
              style={styles.waterDrop}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <View style={styles.hydrationInfoContainer}>
          <ThemedText style={styles.hydrationLabel}>Your current hydration</ThemedText>
          <View style={styles.hydrationPercentageContainer}>
            <ThemedText style={[
              styles.hydrationPercentage,
              hydrationPercentage === 0 && styles.hydrationPercentageRed
            ]}>
              {hydrationPercentage}%
            </ThemedText>
            <ThemedText style={styles.hydrationStatus}>{getHydrationStatus()}</ThemedText>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${hydrationPercentage}%` }]} />
          </View>
        </View>

        <View style={[
          styles.recommendationContainer,
          hydrationPercentage >= 90 && styles.recommendationContainerGreen,
          hydrationPercentage === 0 && styles.recommendationContainerRed
        ]}>
          <ThemedText style={styles.recommendationText}>
            {getRecommendationText()}
          </ThemedText>
          {hydrationPercentage >= 90 ? (
            <TabBarIcon name="checkmark-circle" color="#FFF" size={20} />
          ) : hydrationPercentage === 0 ? (
            <TabBarIcon name="close-circle" color="#FFF" size={20} />
          ) : null}
        </View>

        <TouchableOpacity style={styles.reviewGoalsButton}>
          <ThemedText style={styles.reviewGoalsText}>Review Goals</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
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
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconContainer: {
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFF0F6',
  },
  waterDropContainer: {
    height: 200,  // Fixed height to maintain space
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  waterDropWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterDrop: {
    width: '100%',
    height: '100%',
  },
  hydrationInfoContainer: {
    marginBottom: 30,
  },
  hydrationLabel: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 10,
  },
  hydrationPercentageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hydrationPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#328DD8',
  },
  hydrationPercentageRed: {
    color: '#E74C3C',
  },
  hydrationStatus: {
    fontSize: 14,
    color: '#6C757D',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#328DD8',
    borderRadius: 5,
  },
  recommendationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#328DD8',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recommendationContainerGreen: {
    backgroundColor: '#4CAF50',
  },
  recommendationContainerRed: {
    backgroundColor: '#E74C3C',
  },
  recommendationText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
    textAlign: 'center',
  },
  reviewGoalsButton: {
    backgroundColor: '#328DD8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  reviewGoalsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WaterIntakeScreen;
