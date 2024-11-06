import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity, Modal, Dimensions, TouchableWithoutFeedback, PanResponder } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; // Adjust the import path as needed
import CircularProgress from 'react-native-circular-progress-indicator';

type StatisticsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'statistics'>;
};

// Add these types at the top of the file
type BarData = {
  label: string;
  value: number;
  goal?: number;
  hour?: string;
};

// Add this type definition
type TimeRange = 'D' | 'W' | 'M' | '6M' | 'Y';

// Add this comprehensive dummy data
const waterIntakeData = {
  D: {
    data: [
      { label: '12 AM', value: 0 },
      { label: '1 AM', value: 0 },
      { label: '2 AM', value: 0 },
      { label: '3 AM', value: 0 },
      { label: '4 AM', value: 0 },
      { label: '5 AM', value: 0 },
      { label: '6 AM', value: 50 },
      { label: '7 AM', value: 150 },
      { label: '8 AM', value: 300 },
      { label: '9 AM', value: 200 },
      { label: '10 AM', value: 50 },
      { label: '11 AM', value: 0 },
      { label: '12 PM', value: 180 },
      { label: '1 PM', value: 250 },
      { label: '2 PM', value: 80 },
      { label: '3 PM', value: 50 },
      { label: '4 PM', value: 0 },
      { label: '5 PM', value: 0 },
      { label: '6 PM', value: 310 },
      { label: '7 PM', value: 120 },
      { label: '8 PM', value: 60 },
      { label: '9 PM', value: 0 },
      { label: '10 PM', value: 0 },
      { label: '11 PM', value: 0 },
    ],
    maxValue: 400,
    xAxisLabels: ['12 AM', '6', '12 PM', '6', '11'],
  },
  W: {
    data: [
      { label: 'Mon', value: 1500 },
      { label: 'Tue', value: 1800 },
      { label: 'Wed', value: 2100 },
      { label: 'Thu', value: 1600 },
      { label: 'Fri', value: 1900 },
      { label: 'Sat', value: 1200 },
      { label: 'Sun', value: 1400 },
    ],
    maxValue: 2500,
    xAxisLabels: ['Mon', 'Wed', 'Fri', 'Sun'],
  },
  M: {
    data: Array.from({ length: 30 }, (_, i) => ({
      label: `Oct ${i + 1}`,
      value: Math.floor(Math.random() * 2000) + 500,
    })),
    maxValue: 2500,
    xAxisLabels: ['1', '10', '20', '30'],
  },
  '6M': {
    data: Array.from({ length: 26 }, (_, i) => {
      const months = ['June', 'July', 'August', 'September', 'October', 'November'];
      const month = months[Math.floor(i/4)];
      const startDay = (i%4) * 7 + 1;
      const endDay = (i%4) * 7 + 7;
      return {
        label: `${month} ${startDay}-${endDay}`,
        value: Math.floor(Math.random() * 15000) + 5000,
      };
    }),
    maxValue: 20000,
    xAxisLabels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  },
  Y: {
    data: Array.from({ length: 12 }, (_, i) => ({
      label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      value: Math.floor(Math.random() * 50000) + 20000,
    })),
    maxValue: 70000,
    xAxisLabels: ['Jan', 'Mar', 'Jun', 'Sep', 'Dec'],
  },
};

interface WaterIntakeGraphProps {
  timeRange: TimeRange;
  onBarPress?: (index: number) => void;
  selectedBar?: number | null;
}

const WaterIntakeGraph: React.FC<WaterIntakeGraphProps> = ({
  timeRange,
  onBarPress,
  selectedBar,
}) => {
  const data = waterIntakeData[timeRange];
  const barWidth = timeRange === 'D' ? 8 : 
                   timeRange === 'W' ? 20 :
                   timeRange === 'M' ? 8 :
                   timeRange === '6M' ? 8 : 16;
  const barSpacing = timeRange === 'D' ? 4 : 
                     timeRange === 'W' ? 8 :
                     timeRange === 'M' ? 4 :
                     timeRange === '6M' ? 4 : 6;

  // Add this function to handle outside touches
  const handleOutsidePress = () => {
    if (selectedBar !== null) {
      onBarPress?.(null);
    }
  };

  return (
    <TouchableOpacity onPress={handleOutsidePress}>
      <View style={styles.graphContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <ThemedText style={styles.axisLabel}>{data.maxValue}</ThemedText>
          <ThemedText style={styles.axisLabel}>{Math.round(data.maxValue * 0.66)}</ThemedText>
          <ThemedText style={styles.axisLabel}>{Math.round(data.maxValue * 0.33)}</ThemedText>
          <ThemedText style={styles.axisLabel}>0</ThemedText>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.barsContainer,
            { width: (barWidth + barSpacing) * data.data.length + 40 }
          ]}
        >
          {/* Grid lines */}
          <View style={styles.gridLines}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>

          {/* Bars */}
          <View style={styles.barsWrapper}>
            {data.data.map((item, index) => {
              const barHeight = Math.max((item.value / data.maxValue) * 200, 1);
              const isSelected = selectedBar === index;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => onBarPress?.(index)}
                  style={[
                    styles.barTouch,
                    { width: barWidth, marginHorizontal: barSpacing/2 }
                  ]}
                >
                  <View style={[
                    styles.bar,
                    { 
                      height: barHeight,
                      backgroundColor: isSelected ? '#328DD8' : '#A1CEDC'
                    }
                  ]} />
                </TouchableOpacity>
              );
            })}

            {/* Tooltip and vertical indicator */}
            {selectedBar !== null && (
              <>
                {/* Vertical indicator line */}
                <View style={[
                  styles.verticalIndicator,
                  {
                    left: selectedBar * (barWidth + barSpacing) + barWidth / 2,
                    top: 0,
                    height: '100%',
                  }
                ]} />

                {/* Tooltip */}
                <View style={[
                  styles.tooltipContainer,
                  {
                    left: selectedBar * (barWidth + barSpacing) - 50,
                    top: -20,
                  }
                ]}>
                  <View style={styles.tooltip}>
                    <ThemedText style={styles.tooltipValue}>
                      {data.data[selectedBar].value}ml
                    </ThemedText>
                    <ThemedText style={styles.tooltipTime}>
                      {data.data[selectedBar].label}
                    </ThemedText>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* X-axis labels */}
          <View style={styles.xAxisLabels}>
            {data.xAxisLabels.map((label, index) => (
              <ThemedText key={index} style={styles.xAxisLabel}>
                {label}
              </ThemedText>
            ))}
          </View>
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
};

export default function StatisticsScreen({ navigation }: StatisticsScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedView, setSelectedView] = useState('Day');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const dropdownRef = useRef(null);

  // Daily goal stats
  const dailyGoal = 2000;
  const currentIntake = 1200;

  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      dropdownRef.current.measure((fx, fy, width, height, px, py) => {
        setDropdownLayout({ x: px, y: py + height, width, height });
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
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

  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

  // Sample data for the bar graph
  const barData: BarData[] = [
    { label: 'Mon', value: 1200, goal: 2000 },
    { label: 'Tue', value: 1800, goal: 2000 },
    { label: 'Wed', value: 2100, goal: 2000 },
    { label: 'Thu', value: 1600, goal: 2000 },
    { label: 'Fri', value: 1900, goal: 2000 },
    { label: 'Sat', value: 1500, goal: 2000 },
    { label: 'Sun', value: 1700, goal: 2000 },
  ];

  const maxValue = Math.max(...barData.map(item => Math.max(item.value, item.goal || 0)));

  // Sample data for the hourly graph
  const hourlyData: BarData[] = [
    { label: '12 AM', hour: '12 AM', value: 0 },
    { label: '6', hour: '6', value: 2 },
    { label: '7', hour: '7', value: 3 },
    { label: '8', hour: '8', value: 31 },
    { label: '9', hour: '9', value: 20 },
    { label: '10', hour: '10', value: 4 },
    { label: '12 PM', hour: '12 PM', value: 18 },
    { label: '1', hour: '1', value: 25 },
    { label: '2', hour: '2', value: 8 },
    { label: '3', hour: '3', value: 5 },
    { label: '6', hour: '6', value: 31 },
    { label: '7', hour: '7', value: 12 },
    { label: '8', hour: '8', value: 6 },
  ];

  const [timeRange, setTimeRange] = useState<TimeRange>('D');

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
              {weeklyData.map((item, index) => (
                <View key={index} style={styles.dayContainer}>
                  <View style={[styles.dayIndicator, item.completed && styles.dayCompleted]}>
                    {item.completed && (
                      <TabBarIcon name="checkmark" color="#FFF" size={16} />
                    )}
                  </View>
                  <ThemedText style={styles.dayText}>{item.day}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* <View style={styles.intakeSection}>
          <ThemedText style={styles.intakeTitle}>Current Intake</ThemedText>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity onPress={toggleDropdown} style={styles.dropdown} ref={dropdownRef}>
              <ThemedText style={styles.dropdownText}>{selectedView}</ThemedText>
              <TabBarIcon name="chevron-down-outline" size={16} color="#A1CEDC" />
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.detailsButton}>
          <ThemedText style={styles.detailsButtonText}>Details</ThemedText>
        </View> */}

        {/* Time range selector */}
        <View style={styles.timeRangeSelector}>
          {(['D', 'W', 'M', '6M', 'Y'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range)}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive
              ]}
            >
              <ThemedText style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive
              ]}>
                {range}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

          <WaterIntakeGraph
            timeRange={timeRange}
            onBarPress={setSelectedBarIndex}
          selectedBar={selectedBarIndex}
        />
      </ScrollView>

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
  chartContainer: {
    marginTop: 20,
    marginBottom: 20,
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
  tooltipContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1000,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#328DD8',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  tooltipText: {
    color: '#328DD8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  graphSection: {
    marginBottom: 100,
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
  graphWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 10,
    marginVertical: 10,
    overflow: 'hidden',
  },
  verticalLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: 'rgba(50, 141, 216, 0.5)',
  },
  activePoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#328DD8',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  tooltipContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1000,
  },
  tooltip: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#328DD8',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipValue: {
    color: '#328DD8',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tooltipLabel: {
    color: '#6C757D',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  draggableDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#328DD8',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dotIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#328DD8',
    shadowColor: "transparent",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    elevation: 0,
  },
  miniTooltip: {
    position: 'absolute',
    padding: 4,
    borderRadius: 4,
    width: 60,
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#328DD8',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  miniTooltipText: {
    color: '#328DD8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  barGraphContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'flex-end',
    minHeight: 250,
  },
  barColumn: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  bar: {
    width: '100%',
    borderRadius: 2, // Smaller border radius for thinner bars
    backgroundColor: '#328DD8',
  },
  goalLine: {
    position: 'absolute',
    width: 44,
    height: 2,
    backgroundColor: '#328DD8',
    borderRadius: 1,
  },
  valueLabel: {
    position: 'absolute',
    top: -25,
    backgroundColor: '#328DD8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  valueLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  barLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  selectedBarLabel: {
    color: '#328DD8',
    fontWeight: '600',
  },
  graphContainer: {
    height: 280,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginBottom: 80,
  },
  yAxisLabels: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginRight: 5,
    marginLeft: -30,
    position: 'relative',
  },
  axisLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  barsContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  barsWrapper: {
    flexDirection: 'row',
    marginLeft: 40,
    // alignItems: 'flex-end',
    // height: 200,
  },
  barTouch: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  tooltip: {
    position: 'absolute',
    zIndex: 1000,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  tooltipTime: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
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
    borderTopColor: 'white',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#8E8E93',
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
  verticalIndicator: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#8E8E93',
    opacity: 0.5,
    zIndex: 10,
  },
  tooltipContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 100,
    zIndex: 1000,
  },
  tooltip: {
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  tooltipValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  tooltipTime: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
});
export default StatisticsScreen;
