import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StatisticsScreen = () => {
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

  const icons = ['list-outline', 'pulse-outline', 'bar-chart-outline', 'stats-chart-outline'];

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
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.headerSubtitle}>Stay hydrated!</ThemedText>
            <ThemedText style={styles.headerTitle}>Jane Doe</ThemedText>
          </View>
          <View style={styles.notificationIcon}>
            <TabBarIcon name="notifications-outline" color="#333333" />
          </View>
        </View>
        
        <View style={styles.iconRow}>
          {icons.map((icon, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconContainer}
              onPress={() => setSelectedIcon(icon)}
            >
              <TabBarIcon
                name={icon as any}
                color={selectedIcon === icon ? '#328DD8' : '#000'}
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
        
        {/* Placeholder for the intake chart */}
        <ThemedView style={styles.chartPlaceholder}>
          <ThemedText>Intake chart goes here</ThemedText>
        </ThemedView>
        
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
    backgroundColor: 'white', // or your app's background color
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(60, 162, 245, 0.5)', // 50% transparent #3CA2F5
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
  daySelector: {
    fontSize: 16,
    color: '#328DD8',
  },
  chartPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
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
});

export default StatisticsScreen;
