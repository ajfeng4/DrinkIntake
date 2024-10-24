import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity, Modal, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import DrinkIntakeHeader from '@/components/DrinkIntakeHeader';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; // Adjust the import path as needed

// Updated dummy data for Day and Hourly views
const dummyData = {
  Day: {
    list: [
      { time: 'M', value: 300 },
      { time: 'T', value: 500 },
      { time: 'W', value: 200 },
      { time: 'T', value: 350 },
      { time: 'F', value: 400 },
    ],
    bar: [
      { time: 'M', value: 250 },
      { time: 'T', value: 400 },
      { time: 'W', value: 300 },
      { time: 'T', value: 250 },
      { time: 'F', value: 350 },
    ],
    line: {
      labels: ["M", "T", "W", "T", "F"],
      data: [250, 400, 300, 250, 350],
    },
  },
  Hourly: {
    list: [
      { time: '1PM', value: 100 },
      { time: '2PM', value: 150 },
      { time: '3PM', value: 200 },
      { time: '4PM', value: 180 },
      { time: '5PM', value: 220 },
    ],
    bar: [
      { time: '1pm', value: 100 },
      { time: '2pm', value: 150 },
      { time: '3pm', value: 200 },
      { time: '4pm', value: 180 },
      { time: '5pm', value: 220 },
    ],
    line: {
      labels: ["1pm", "2pm", "3pm", "4pm", "5pm"],
      data: [100, 150, 200, 180, 220],
    },
  },
};

// Placeholder components for different graph types
const ListView = ({ selectedView }) => {
  const intakeData = dummyData[selectedView].list;
  const maxValue = Math.max(...intakeData.map(item => item.value));
  const [selectedBar, setSelectedBar] = useState(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  const handleBarPress = (index) => {
    setSelectedBar(selectedBar === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        onScroll={(event) => {
          setScrollOffset(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        {intakeData.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => handleBarPress(index)}
            activeOpacity={0.7}
          >
            <View style={styles.row}>
              <ThemedText style={styles.horizontalTimeLabel}>{item.time}</ThemedText>
              <View style={styles.barContainer}>
                <View style={[styles.horizontalBar, { width: `${(item.value / maxValue) * 100}%` }]} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedBar !== null && (
        <View style={[
          styles.tooltipContainer, 
          { 
            left: Math.max(10, (intakeData[selectedBar].value / maxValue) * (screenWidth - 120)-10),
            top: selectedBar * 45 - 15
          }
        ]}>
          <View style={styles.tooltip}>
            <ThemedText style={styles.tooltipText}>{intakeData[selectedBar].value} ml</ThemedText>
          </View>
          <View style={styles.tooltipArrow} />
        </View>
      )}
    </View>
  );
};

const BarGraph = ({ selectedView }) => {
  const intakeData = dummyData[selectedView].bar;
  const maxValue = Math.max(...intakeData.map(item => item.value));
  const screenWidth = Dimensions.get('window').width;
  const barWidth = (screenWidth - 80) / intakeData.length; // Adjusted for padding
  const [selectedBar, setSelectedBar] = useState(null);

  const handleBarPress = (index) => {
    setSelectedBar(selectedBar === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.graphContainer}>
        {intakeData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.barWrapper, { width: barWidth }]}
            onPress={() => handleBarPress(index)}
            activeOpacity={0.7}
          >
            <View style={styles.barBackground}>
              <View 
                style={[
                  styles.verticalBar, 
                  { height: `${(item.value / maxValue) * 100}%` }
                ]} 
              />
            </View>
            <ThemedText style={styles.verticalTimeLabel}>{item.time}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      {selectedBar !== null && (
        <View style={[
          styles.tooltipContainer, 
          { 
            left: selectedBar * barWidth + (barWidth / 2)-20, // Centered on the bar
            bottom: (intakeData[selectedBar].value / maxValue) * 200 + 60 // Adjusted for graph height
          }
        ]}>
          <View style={styles.tooltip}>
            <ThemedText style={styles.tooltipText}>{intakeData[selectedBar].value} ml</ThemedText>
          </View>
          <View style={styles.tooltipArrow} />
        </View>
      )}
    </View>
  );
};

const LineGraph = ({ selectedView }) => {
  const screenWidth = Dimensions.get("window").width;
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0 });

  const data = {
    labels: dummyData[selectedView].line.labels,
    datasets: [
      {
        data: dummyData[selectedView].line.data,
        color: (opacity = 1) => `rgba(50, 141, 216, ${opacity})`, // Blue color
        strokeWidth: 2
      }
    ]
  };

  const handleDataPointClick = (data: any) => {
    setTooltipPos({
      x: data.x,
      y: data.y,
      visible: true,
      value: data.value
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => setTooltipPos({ ...tooltipPos, visible: false })}>
      <View style={{ 
        backgroundColor: 'white', 
        borderRadius: 16, 
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 0,
        paddingRight: 16,
        marginVertical: 8 
      }}>
        <LineChart
          data={data}
          width={screenWidth}
          height={280}
          chartConfig={{
            backgroundColor: "white",
            backgroundGradientFrom: "white",
            backgroundGradientTo: "white",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(50, 141, 216, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#328DD8"
            },
            propsForBackgroundLines: {
              strokeDasharray: "",
              stroke: "#E7E7E7",
              strokeWidth: 1
            },
            propsForVerticalLabels: {
              fontSize: 10,
              rotation: 0,
              offset: 10,
            },
            propsForHorizontalLabels: {
              fontSize: 10,
            },
            formatYLabel: (value) => `${value} ml`, // Add 'ml' to Y-axis labels
          }}
          bezier
          style={{
            borderRadius: 16,
            marginLeft: -40,
          }}
          withInnerLines={true}
          withOuterLines={false}
          yAxisLabel=""
          yAxisSuffix=" ml" // Add 'ml' suffix to Y-axis values
          yAxisInterval={1}
          fromZero={true}
          segments={4}
          onDataPointClick={handleDataPointClick}
          decorator={() => {
            return tooltipPos.visible ? (
              <View style={{
                position: 'absolute',
                top: tooltipPos.y - 30,
                left: tooltipPos.x - 30,
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 5,
                borderWidth: 1,
                borderColor: '#328DD8',
              }}>
                <ThemedText style={{ color: '#328DD8', fontWeight: 'bold' }}>
                  {tooltipPos.value} ml
                </ThemedText>
              </View>
            ) : null;
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

type StatisticsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'statistics'>;
};

export default function StatisticsScreen({ navigation }: StatisticsScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedView, setSelectedView] = useState('Day');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const dropdownRef = useRef(null);
  const [selectedIcon, setSelectedIcon] = useState('list-outline');

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

  const icons = [
    { name: 'list-outline', component: ListView },
    { name: 'pulse-outline', component: LineGraph },
    { name: 'bar-chart-outline', component: BarGraph },
  ];

  const SelectedGraph = icons.find(icon => icon.name === selectedIcon)?.component || ListView;

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

        <View style={styles.iconRow}>
          {icons.map((icon, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconContainer}
              onPress={() => setSelectedIcon(icon.name)}
            >
              <TabBarIcon
                name={icon.name as any}
                color={selectedIcon === icon.name ? '#328DD8' : '#000'}
                size={24}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.intakeSection}>
          <ThemedText style={styles.intakeTitle}>Current Intake</ThemedText>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity onPress={toggleDropdown} style={styles.dropdown} ref={dropdownRef}>
              <ThemedText style={styles.dropdownText}>{selectedView}</ThemedText>
              <TabBarIcon name="chevron-down-outline" size={16} color="#A1CEDC" />
            </TouchableOpacity>
          </View>
        </View>

        <SelectedGraph selectedView={selectedView} />

        <View style={styles.detailsButton}>
          <ThemedText style={styles.detailsButtonText}>Details</ThemedText>
        </View>
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
    marginBottom: 20,
    marginTop: 20,
  },
  barWrapper: {
    alignItems: 'center',
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
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#328DD8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});
export default StatisticsScreen;
