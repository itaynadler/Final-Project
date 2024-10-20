import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment'; // Install moment for date manipulation: npm install moment

const SchedulePage = () => {
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [selectedDay, setSelectedDay] = useState(moment().format('YYYY-MM-DD')); // Default selected day is today

  const startOfWeek = currentWeek.clone().startOf('week'); // Start of the current week
  const endOfWeek = currentWeek.clone().endOf('week'); // End of the current week

  // Generate an array of days in the current week
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(startOfWeek.clone().add(i, 'days'));
  }

  // Sample data for classes
  const classes = [
    {
      id: '1',
      date: '2024-10-20',
      time: '08:30',
      title: 'Hybrid Training',
      instructor: 'Omri Dan',
      booked: '17/18 Booked',
      imageUrl: 'https://via.placeholder.com/150',
      attendees: [{ name: 'User1' }, { name: 'User2' }, { name: 'User3' }],
    },
    {
      id: '2',
      date: '2024-21-10',
      time: '09:00',
      title: 'Yoga Vinyasa',
      instructor: 'Rani Solomon',
      booked: '20/24 Booked',
      imageUrl: 'https://via.placeholder.com/150',
      attendees: [{ name: 'User4' }, { name: 'User5' }],
    },
    {
      id: '3',
      date: '2024-22-10',
      time: '09:00',
      title: 'Mat Pilates',
      instructor: 'Maya Pelag',
      booked: 'The session is full, 0 waitlist',
      imageUrl: 'https://via.placeholder.com/150',
      attendees: [{ name: 'User6' }],
    },
    {
      id: '4',
      date: '2024-09-09',
      time: '10:30',
      title: 'Hybrid Training',
      instructor: 'Omri Dan',
      booked: '15/18 Booked',
      imageUrl: 'https://via.placeholder.com/150',
      attendees: [{ name: 'User7' }, { name: 'User8' }],
    },
  ];

  // Filter classes based on the selected day
  const filteredClasses = classes.filter((cls) => cls.date === selectedDay);

  // Function to render each class item
  const renderClassItem = ({ item }) => (
    <View style={styles.classContainer}>
      <View style={styles.classInfo}>
        <Text style={styles.classTime}>{item.time}</Text>
        <View style={styles.classDetails}>
          <Text style={styles.classTitle}>
            {item.title} <Icon name="heart-outline" size={16} />
          </Text>
          <Text style={styles.classInstructor}>{item.instructor}</Text>
          <Text style={styles.classBooked}>{item.booked}</Text>
        </View>
      </View>
    </View>
  );

  const goToPreviousWeek = () => {
    setCurrentWeek((prev) => prev.clone().subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    setCurrentWeek((prev) => prev.clone().add(1, 'week'));
  };

  const selectDay = (day) => {
    setSelectedDay(day.format('YYYY-MM-DD'));
  };

  return (
    <View style={styles.container}>
      {/* Week navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity onPress={goToPreviousWeek}>
          <Icon name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.weekText}>
          {startOfWeek.format('MMM DD')} - {endOfWeek.format('MMM DD, YYYY')}
        </Text>
        <TouchableOpacity onPress={goToNextWeek}>
          <Icon name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Days of the week */}
      <View style={styles.weekContainer}>
        {weekDays.map((day) => (
          <TouchableOpacity key={day.format('YYYY-MM-DD')} style={styles.dayContainer} onPress={() => selectDay(day)}>
            <View style={[
              styles.dateCircle,
              selectedDay === day.format('YYYY-MM-DD') && styles.selectedDateCircle
            ]}>
              <Text style={[styles.dayText, selectedDay === day.format('YYYY-MM-DD') && styles.selectedDayText]}>
                {day.format('ddd')}
              </Text>
              <Text style={[styles.dateText, selectedDay === day.format('YYYY-MM-DD') && styles.selectedDateText]}>
                {day.format('D')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* FlatList to display the classes */}
      <FlatList
        data={filteredClasses}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id}
        style={styles.classList}
        ListEmptyComponent={<Text style={styles.noClassesText}>No classes scheduled for this day.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 180
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  weekText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dateCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectedDateCircle: {
    backgroundColor: '#007BFF', // Blue circle for selected date
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  selectedDayText: {
    color: '#fff', // White text for selected day
  },
  selectedDateText: {
    color: '#fff', // White text for selected date
    fontWeight: 'bold',
  },
  classContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 30,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  classInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -20
  },
  classTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 20,
    
  },
  classDetails: {
    flex: 1,
  },
  classTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  classInstructor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10
  },
  classBooked: {
    fontSize: 14,
    color: '#999',
  },
  classList: {
    marginTop: 10,
  },
  noClassesText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});

export default SchedulePage;
