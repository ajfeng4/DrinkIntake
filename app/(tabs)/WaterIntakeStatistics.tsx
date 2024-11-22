import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity, Modal, Dimensions, TouchableWithoutFeedback, PanResponder, Text, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types'; // Adjust the import path as needed
import CircularProgress from 'react-native-circular-progress-indicator';
import { supabase } from '@/supabaseClient';
import { CartesianChart, Bar, useChartPressState } from "victory-native";
import { Circle, useFont, vec } from "@shopify/react-native-skia";
import { LinearGradient, Text as SKText } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";

type StatisticsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'WaterIntakeStatistics'>;
};

const inter = require("../../assets/fonts/roboto-bold.ttf");


const processHistogramData = (data) => {
  // Create an array of 24 zeros initially
  const hourlyData = Array(24).fill(0);

  // Count occurrences for each hour
  data.forEach((record) => {
    if (record.created_at) { // Check if created_at exists
      const hour = new Date(record.created_at).getHours();
      console.log('Processing record:', record.created_at, 'Hour:', hour); // Debug log
      if (hour >= 0 && hour < 24) {
        hourlyData[hour]++;
      }
    }
  });

  console.log('Final hourly data:', hourlyData); // Debug log
  return hourlyData;
};

export default function StatisticsScreen({ navigation }: StatisticsScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedView, setSelectedView] = useState('Day');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const dropdownRef = useRef(null);

  // Daily goal stats
  const dailyGoal = 4;
  const [currentIntake, setCurrentIntake] = useState(0);

  const [timeSpan, setTimeSpan] = useState('day'); // 'day', 'week', 'month', 'year'
  const [graphData, setGraphData] = useState<number[]>([]);

  // Add this state to store daily completions
  const [weeklyCompletions, setWeeklyCompletions] = useState(Array(7).fill(false));

  useEffect(() => {
    fetchTodaySwallowingCount();
  }, []);
  
  // Add this useEffect to fetch and check daily completions
  useEffect(() => {
    const fetchWeeklyCompletions = async () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const { data, error } = await supabase
        .from('recordings')
        .select('created_at, prediction_class')
        .eq('prediction_class', 'Swallowing')
        .gte('created_at', startOfWeek.toISOString())
        .lt('created_at', new Date().toISOString());

      if (error) {
        console.error('Error fetching weekly data:', error);
        return;
      }

      // Group swallows by day and check against daily goal
      const completions = Array(7).fill(false);
      data.forEach(record => {
        const day = new Date(record.created_at).getDay();
        const dayCount = data.filter(r => 
          new Date(r.created_at).getDay() === day
        ).length;
        completions[day] = dayCount >= dailyGoal;
      });

      setWeeklyCompletions(completions);
    };

    fetchWeeklyCompletions();
  }, [dailyGoal]);

  const fetchTodaySwallowingCount = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('recordings')
        .select('prediction_class')
        .eq('prediction_class', 'Swallowing')
        .gte('created_at', today.toISOString())
        .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());
        
      console.log('Raw Supabase data:', data)

      if (error) {
        console.error('Error fetching swallowing count:', error);
        return;
      }

      // Count the number of Swallowing predictions
      const swallowingCount = data.length;
      console.log('Swallowing count:', swallowingCount);
      setCurrentIntake(swallowingCount);
    } catch (error) {
      console.error('Error in fetchTodaySwallowingCount:', error);
    }
  };

  const selectOption = (option: string) => {
    setSelectedView(option);
    setIsDropdownOpen(false);
  };

  // Add this after the existing imports
  const weeklyData = [
    { day: 'Mon', completed: true },
    { day: 'Tue', completed: true },
    { day: 'Wed', completed: true },
    { day: 'Thu', completed: false },
    { day: 'Fri', completed: true },
    { day: 'Sat', completed: false },
    { day: 'Sun', completed: false },
  ];
  
  useEffect(() => {
    console.log('graphData updated:', graphData);
  }, [graphData]);

  useEffect(() => {
    fetchData();
  }, [timeSpan]);

  const fetchData = async () => {
    try {
      const today = new Date();
      let startDate = new Date();
      
      switch (timeSpan) {
        case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(today.getDate() - today.getDay());
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      }
  
      const { data, error } = await supabase
        .from('recordings')
        .select('created_at')
        .eq('prediction_class', 'Swallowing')
        .gte('created_at', startDate.toISOString())
        .lt('created_at', new Date().toISOString());
  
      if (error) throw error;
      
      const processedData = processHistogramData(data || [], timeSpan);
      setGraphData(processedData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setGraphData([]);
    }
  };
  
  const processHistogramData = (data, timeSpan) => {
    switch (timeSpan) {
      case 'day':
        // Create an array of 24 zeros for hours
        const hourlyData = Array(24).fill(0);
        data.forEach((record) => {
          const date = new Date(record.created_at);
          const hour = date.getHours();
          hourlyData[hour]++;
        });
        return hourlyData;
  
      case 'week':
        // Create an array of 7 zeros for days of week
        const weeklyData = Array(7).fill(0);
        data.forEach((record) => {
          const date = new Date(record.created_at);
          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
          weeklyData[dayOfWeek]++;
        });
        return weeklyData;
  
      case 'month':
        // Create an array of 12 zeros for months
        const monthlyData = Array(12).fill(0);
        data.forEach((record) => {
          const date = new Date(record.created_at);
          const month = date.getMonth(); // 0 = January, 11 = December
          monthlyData[month]++;
        });
        return monthlyData;
    }
  };
  
  // Update the format label function to handle different time spans
const formatAxisLabel = (value: number, timeSpan: string) => {
  switch (timeSpan) {
    case 'day':
      // Format hours (0-23)
      const hour = value;
      if (hour === 0) return '12am';
      if (hour === 12) return '12pm';
      return hour < 12 ? `${hour}am` : `${hour - 12}pm`;

    case 'week':
      // Format days of week
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[value];

    case 'month':
      // Format months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[value];

    default:
      return value.toString();
    }
  };

  const font = useFont(inter, 12);
  const toolTipFont = useFont(inter, 24);
  const colorMode = useColorScheme();
  const { state, isActive } = useChartPressState({
    x: 0,
    y: { intake: 0 },
  });
  
  // Debug logs for state
  console.log("Chart Press State:", {
    isActive,
    x: state.x,
    y: state.y,
    raw: state
  });

  const isDark = colorMode === "dark";
  console.log("Original graphData:", graphData);
  
  // Add default data if graphData is empty
  const defaultData = Array(24).fill(0);
  const safeData = graphData?.length ? graphData : defaultData;
  
  // Debug log to check the transformed data
  const transformedData = safeData.map((value, index) => ({
    hour: index,
    intake: Math.max(0, Number(value) || 0),
  }));
  console.log("Transformed Data:", transformedData);

  const value = useDerivedValue(() => {
    const rawValue = state.y.intake?.value?.value;
    const index = state.x.value?.value;
    
    console.log("Touch interaction:", {
      rawValue,
      index,
      data: transformedData?.[Math.round(index)]
    });

    // Get the actual data point value
    const dataPoint = transformedData?.[Math.round(index)];
    const intakeValue = dataPoint?.intake ?? 0;

    return `${intakeValue} ml`;
  }, [state, transformedData]);

  const textYPosition = useDerivedValue(() => {
    console.log("Y Position Derivation:", {
      intakePosition: state.y.intake?.position?.value,
    });
    return state.y.intake.position.value - 15;
  }, [value]);

  const textXPosition = useDerivedValue(() => {
    console.log("X Position Derivation:", {
      xPosition: state.x?.position?.value,
      tooltipWidth: toolTipFont?.measureText(value.value)?.width,
    });
    if (!toolTipFont) {
      return 0;
    }
    return (
      state.x.position.value - toolTipFont.measureText(value.value).width / 2
    );
  }, [value, toolTipFont]);

  // Calculate safe maximum value
  const maxValue = Math.max(...safeData.map(value => Number(value) || 0));

  const yAxisMax = maxValue === 0 ? 4 : Math.ceil(maxValue * 1.2);

  if (!font) {
    return null; // Wait for font to load
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
        }}
      >
        <DrinkIntakeHeader />
        <View style={styles.progressSection}>
          <CircularProgress
            value={currentIntake}
            radius={80}
            duration={2000}
            progressValueColor={'#328DD8'}
            maxValue={dailyGoal}
            title={'ml'}
            titleColor={'#328DD8'}
            titleStyle={{ fontWeight: 'bold' }}
            activeStrokeColor={'#328DD8'}
            inActiveStrokeColor={'#EFF0F6'}
            inActiveStrokeOpacity={0.5}
            inActiveStrokeWidth={6}
            activeStrokeWidth={12}
            subtitle={'Daily Goal'}
            subtitleStyle={{ color: '#6C757D' }}
          />
          <View style={styles.goalInfoContainer}>
            <View style={styles.goalInfo}>
              <ThemedText style={styles.goalLabel}>Current</ThemedText>
              <ThemedText style={styles.goalValue}>{currentIntake}ml</ThemedText>
            </View>
            <View style={styles.goalDivider} />
            <View style={styles.goalInfo}>
              <ThemedText style={styles.goalLabel}>Target</ThemedText>
              <ThemedText style={styles.goalValue}>{dailyGoal}ml</ThemedText>
            </View>
          </View>
          <View style={styles.weeklyTrackerContainer}>
            <ThemedText style={styles.weeklyTitle}>Water required per day</ThemedText>
            <View style={styles.weeklyDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <View key={index} style={styles.dayContainer}>
                  <View style={[styles.dayIndicator, weeklyCompletions[index] && styles.dayCompleted]}>
                    {weeklyCompletions[index] && (
                      <TabBarIcon name="checkmark" color="#FFF" size={16} />
                    )}
                  </View>
                  <ThemedText style={styles.dayText}>{day}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.timeRangeSelector}>
          {['day', 'week', 'month'].map((span) => (
            <TouchableOpacity
              key={span}
              style={[styles.timeRangeButton, timeSpan === span && styles.timeRangeButtonActive]}
              onPress={() => setTimeSpan(span)}
            >
              <Text style={[styles.timeRangeText, timeSpan === span && styles.timeRangeTextActive]}>
                {span.charAt(0).toUpperCase() + span.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.graphSection}>
          <ThemedText style={styles.graphTitle}>Drinking Pattern</ThemedText>
          <View style={styles.chartContainer}>
            <CartesianChart
              data={transformedData}
              xKey="hour"
              yKeys={["intake"]}
              domain={{ 
                x: timeSpan === 'day' ? 
                  [-3, safeData.length+1] : // More space for day view
                  [-1, safeData.length],  // Less space for week/month
                y: [0, yAxisMax],
              }}
              axisOptions={{
                font,
                formatXLabel: (value) => {
                  console.log('X-Axis Label Value:', value, 'TimeSpan:', timeSpan);
                  if (timeSpan === 'month') {
                    // Only show labels for specific values: 0, 3, 6, 9
                    const exactValue = Number(value.toFixed(1)); // Handle floating point precision
                    if (exactValue === 0) return 'Jan';
                    if (exactValue === 2) return 'Mar';
                    if (exactValue === 4) return 'May';
                    if (exactValue === 6) return 'Jul';
                    if (exactValue === 8) return 'Sep';
                    if (exactValue === 10) return 'Nov';
                    return '';
                  }
                  
                  if (timeSpan === 'week') {
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const index = Math.round(value);
                    // Only show label if it's a valid index
                    return index >= 0 && index < days.length ? days[index] : '';
                  }
                  
                  let normalizedValue;
                  switch(timeSpan) {
                    case 'week':
                      normalizedValue = Math.min(Math.max(Math.round(value), 0), 6);
                      break;
                    default:
                      normalizedValue = Math.round(value);
                  }
                  return formatAxisLabel(normalizedValue, timeSpan);
                },
                formatYLabel: (value) => {
                  console.log('Y-Axis Label Value:', value, 'TimeSpan:', timeSpan);
                  // Only show "0 ml" once at the bottom
                  if (value === 0) return '0 ml';
                  return `${value.toFixed(1)} ml`;
                },
                lineColor: isDark ? "#71717a" : "#d4d4d8",
                labelColor: isDark ? "white" : "black",
                tickCount: { 
                  x: timeSpan === 'week' ? 7 : // Exactly 7 ticks for week view
                    timeSpan === 'month' ? 12 : 
                    timeSpan === 'year' ? 12 : 6, 
                  y: 6
                },
              }}
              dimensions={{
                width: Dimensions.get('window').width - 40,
                height: 250
              }}
              chartPressState={state}
            >
              {({ points, chartBounds }) => {
                if (!points?.intake) return null;
                return (
                  <>
                    <Bar
                      points={points.intake}
                      chartBounds={chartBounds}
                      animate={{ type: "timing", duration: 1000 }}
                      roundedCorners={{
                        topLeft: 10,
                        topRight: 10,
                      }}
                      barWidth={((chartBounds.right - chartBounds.left) / (safeData.length + 2)) * 0.6}
                    >
                      <LinearGradient
                        start={vec(0, 0)}
                        end={vec(0, 400)}
                        colors={["#328DD8", "#328DD850"]}
                      />
                    </Bar>

                    {(() => {
                      console.log('Checking tooltip state:', { isActive, state });
                      return isActive ? (
                        <>
                          {console.log('Tooltip is active:', { 
                            value: value.value,
                            position: {
                              x: textXPosition.value,
                              y: textYPosition.value
                            },
                            state 
                          })}
                          <SKText
                            font={toolTipFont}
                            color={isDark ? "white" : "black"}
                            x={textXPosition}
                            y={textYPosition}
                            text={value}
                          />
                          <Circle
                            cx={state.x.position}
                            cy={state.y.intake.position}
                            r={8}
                            color={"#328DD8"}
                            opacity={0.8}
                          />
                        </>
                      ) : null;
                    })()}
                  </>
                );
              }}
            </CartesianChart>
          </View>
        </View>

        <Modal
          visible={isDropdownOpen}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsDropdownOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsDropdownOpen(false)}
          >
            <View style={[styles.dropdownMenu, {
              position: 'absolute',
              top: dropdownLayout.y,
              left: dropdownLayout.x,
              width: dropdownLayout.width,
            }]}>
              <TouchableOpacity onPress={() => selectOption('Day')}>
                <ThemedText style={styles.dropdownMenuItem}>Day</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectOption('Hourly')}>
                <ThemedText style={styles.dropdownMenuItem}>Hourly</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
    padding: 16,
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
  intakeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  intakeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#328DD8',
  },
  detailsButton: {
    backgroundColor: '#328DD8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#328DD8',
    borderRadius: 5,
    padding: 14,
    minWidth: 80,
  },
  dropdownText: {
    fontSize: 16,
    marginRight: 5,
    color: '#328DD8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownMenuItem: {
    fontSize: 16,
    padding: 10,
    color: '#328DD8',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  horizontalTimeLabel: {
    width: 50,
    fontSize: 12,
    color: '#328DD8',
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  horizontalBar: {
    height: '100%',
    backgroundColor: '#328DD8',
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  lineTimeLabel: {
    width: 50,
    fontSize: 14,
    color: '#328DD8',
  },
  graphContainer: {
    height: 280,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginBottom: 80,
  },
  barBackground: {
    width: '80%',
    height: '100%',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  verticalBar: {
    width: '100%',
    backgroundColor: '#328DD8',
    borderRadius: 8,
  },
  verticalTimeLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#328DD8',
  },
  graphSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  chartContainer: {
    height: 300,
    paddingTop: 10,
    paddingHorizontal: -40,
    flex: 1,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#328DD8',
    marginBottom: 16,
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goalInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    width: '100%',
  },
  goalInfo: {
    flex: 1,
    alignItems: 'center',
  },
  goalDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#DEE2E6',
    marginHorizontal: 15,
  },
  goalLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#328DD8',
  },
  weeklyTrackerContainer: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  weeklyTitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 12,
  },
  weeklyDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF0F6',
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCompleted: {
    backgroundColor: '#328DD8',
  },
  dayText: {
    fontSize: 12,
    color: '#6C757D',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  timeRangeText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  timeRangeTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  chartScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltip: {
    position: 'absolute',
    top: -30,
    backgroundColor: 'rgba(50, 141, 216, 0.9)',
    padding: 8,
    borderRadius: 6,
    zIndex: 1,
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  tooltipContent: {
    backgroundColor: '#2C3E50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
  },
  tooltipValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2C3E50',
    marginTop: -1,
  },
});
export default StatisticsScreen;
