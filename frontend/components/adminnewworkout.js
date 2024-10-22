import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Modal, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateWorkoutPage = () => {
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigation = useNavigation();

  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [ampm, setAmPm] = useState('AM');

  const handleCreateWorkout = async () => {
    if (!title || !instructor || !date || !time || !capacity) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          instructor,
          date,
          time,
          capacity: parseInt(capacity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
        // Clear input fields
        setTitle('');
        setInstructor('');
        setDate('');
        setTime('');
        setCapacity('');
        
        // Trigger a global refresh for both admin and user schedules
        if (global.refreshSchedules) {
          global.refreshSchedules();
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to create workout');
      }
    } catch (error) {
      console.error('Error creating workout:', error);
      Alert.alert('Error', 'Something went wrong while creating the workout');
    }
  };

  const handleDateSelect = (day) => {
    setDate(day.dateString);
    setShowCalendar(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const generateTimeOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(i.toString().padStart(2, '0'));
    }
    return options;
  };

  const hourOptions = generateTimeOptions(1, 12);
  const minuteOptions = generateTimeOptions(0, 59);

  const handleTimeSelect = () => {
    let formattedHours = parseInt(hours);
    if (ampm === 'PM' && formattedHours !== 12) {
      formattedHours += 12;
    } else if (ampm === 'AM' && formattedHours === 12) {
      formattedHours = 0;
    }
    const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${minutes}`;
    setTime(formattedTime);
    setShowTimePicker(false);
  };

  const renderScrollPicker = (options, value, setValue) => (
    <ScrollView style={styles.scrollPicker}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.scrollPickerItem, option === value && styles.selectedScrollPickerItem]}
          onPress={() => setValue(option)}
        >
          <Text style={[styles.scrollPickerText, option === value && styles.selectedScrollPickerText]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to AdminSchedule with the created workout's date
    navigation.navigate('AdminSchedule', { selectedDate: date });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New Workout</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Workout Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Instructor Name"
        value={instructor}
        onChangeText={setInstructor}
      />
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowCalendar(true)}>
        <Text style={styles.inputText}>{date ? formatDate(date) : 'Select Date'}</Text>
        <Ionicons name="calendar" size={24} color="#007BFF" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.inputText}>{time || 'Select Time'}</Text>
        <Ionicons name="time" size={24} color="#007BFF" />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Capacity"
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric"
      />
      <Button title="Create Workout" onPress={handleCreateWorkout} />

      <Modal visible={showCalendar} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{[date]: {selected: true, selectedColor: '#007BFF'}}}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#007BFF',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#007BFF',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#007BFF',
                selectedDotColor: '#ffffff',
                arrowColor: '#007BFF',
                monthTextColor: '#2d4150',
                indicatorColor: '#007BFF',
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowCalendar(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTimePicker} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <View style={styles.timePickerContent}>
              {renderScrollPicker(hourOptions, hours, setHours)}
              <Text style={styles.timeSeparator}>:</Text>
              {renderScrollPicker(minuteOptions, minutes, setMinutes)}
              <View style={styles.ampmPicker}>
                <TouchableOpacity
                  style={[styles.ampmButton, ampm === 'AM' && styles.selectedAmPm]}
                  onPress={() => setAmPm('AM')}
                >
                  <Text style={[styles.ampmText, ampm === 'AM' && styles.selectedAmPmText]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ampmButton, ampm === 'PM' && styles.selectedAmPm]}
                  onPress={() => setAmPm('PM')}
                >
                  <Text style={[styles.ampmText, ampm === 'PM' && styles.selectedAmPmText]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.timePickerButtons}>
              <TouchableOpacity style={styles.timePickerButton} onPress={handleTimeSelect}>
                <Text style={styles.timePickerButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowTimePicker(false)}>
                <Text style={styles.timePickerButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccessModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successModalText}>Workout created successfully!</Text>
            <TouchableOpacity style={styles.successModalButton} onPress={handleSuccessModalClose}>
              <Text style={styles.successModalButtonText}>View in Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 300,
  },
  timePickerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollPicker: {
    height: 150,
    width: 60,
  },
  scrollPickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedScrollPickerItem: {
    backgroundColor: '#f0f0f0',
  },
  scrollPickerText: {
    fontSize: 20,
  },
  selectedScrollPickerText: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  ampmPicker: {
    marginLeft: 20,
  },
  ampmButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedAmPm: {
    backgroundColor: '#007BFF',
  },
  ampmText: {
    fontSize: 16,
  },
  selectedAmPmText: {
    color: '#fff',
  },
  timePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  timePickerButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  timePickerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  successModalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  successModalButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateWorkoutPage;
