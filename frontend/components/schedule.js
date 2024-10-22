import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const SchedulePage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
      global.refreshSchedules = fetchWorkouts;

      return () => {
        global.refreshSchedules = null;
      };
    }, [])
  );

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('http://localhost:3000/workouts');
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setErrorMessage('Failed to fetch workouts. Please try again.');
    }
  };

  const bookWorkout = async (workoutId) => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { id: userId } = JSON.parse(userData);

      const response = await fetch('http://localhost:3000/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workoutId, userId }),
      });
      const data = await response.json();
      if (response.ok) {
        setErrorMessage('');
        setSuccessMessage(data.message);
        fetchWorkouts(); // Refresh workouts to update spots
        setTimeout(() => {
          setSuccessMessage('');
          setModalVisible(false);
        }, 2000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error booking workout:', error);
      setErrorMessage('Failed to book workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter workouts based on selected date
  const filteredWorkouts = workouts.filter(workout => 
    moment(workout.date).format('YYYY-MM-DD') === selectedDate
  );

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity
      style={styles.workoutItem}
      onPress={() => {
        setSelectedWorkout(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutTitle}>{item.title}</Text>
        <Text style={styles.workoutInfo}>Time: {item.time}</Text>
      </View>
      <Text style={styles.workoutInfo}>Instructor: {item.instructor}</Text>
      <Text style={styles.workoutInfo}>
        Spots Available: {item.capacity - item.attendees.length} / {item.capacity}
      </Text>
    </TouchableOpacity>
  );

  const markedDates = workouts.reduce((acc, workout) => {
    const date = moment(workout.date).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = { marked: true, dotColor: '#007BFF' };
    }
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: '#007BFF',
          },
        }}
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
      <Text style={styles.header}>Workouts for {formatDate(selectedDate)}</Text>
      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>No workouts scheduled for this date.</Text>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedWorkout && (
              <>
                <Text style={styles.modalTitle}>{selectedWorkout.title}</Text>
                <Text style={styles.modalInfo}>Instructor: {selectedWorkout.instructor}</Text>
                <Text style={styles.modalInfo}>Date: {formatDate(selectedWorkout.date)}</Text>
                <Text style={styles.modalInfo}>Time: {selectedWorkout.time}</Text>
                <Text style={styles.modalInfo}>
                  Spots Available: {selectedWorkout.capacity - selectedWorkout.attendees.length} / {selectedWorkout.capacity}
                </Text>
                
                {errorMessage ? (
                  <View style={[styles.messageContainer, styles.errorContainer]}>
                    <Ionicons name="alert-circle" size={24} color="#dc3545" />
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  </View>
                ) : null}
                {successMessage ? (
                  <View style={[styles.messageContainer, styles.successContainer]}>
                    <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                    <Text style={styles.successMessage}>{successMessage}</Text>
                  </View>
                ) : null}
                
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => bookWorkout(selectedWorkout._id)}
                  disabled={loading || successMessage !== ''}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.bookButtonText}>Book</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible(false);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
    color: '#2d4150',
  },
  listContainer: {
    paddingBottom: 20,
  },
  workoutItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
  },
  workoutInfo: {
    fontSize: 14,
    color: '#7d8a9a',
    marginBottom: 4,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d4150',
  },
  modalInfo: {
    fontSize: 16,
    marginBottom: 8,
    color: '#7d8a9a',
  },
  bookButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    marginTop: 15,
    width: '100%',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    marginTop: 10,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  errorMessage: {
    color: '#721c24',
    marginLeft: 10,
    fontSize: 16,
  },
  successMessage: {
    color: '#155724',
    marginLeft: 10,
    fontSize: 16,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#7d8a9a',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  successContainer: {
    backgroundColor: '#d4edda',  // Light green background for success messages
    borderColor: '#c3e6cb',
  },
});

export default SchedulePage;
