import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';

const SchedulePage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchWorkouts();
  }, []);

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
      const response = await fetch('http://localhost:3000/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workoutId, userId: 'user123' }),
      });
      const data = await response.json();
      if (response.ok) {
        setErrorMessage('');
        fetchWorkouts();
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
        <Text style={styles.workoutTime}>{item.time}</Text>
      </View>
      <Text style={styles.workoutInfo}>Instructor: {item.instructor}</Text>
      <Text style={styles.workoutInfo}>Available: {item.capacity - item.attendees.length} / {item.capacity}</Text>
    </TouchableOpacity>
  );

  const markedDates = workouts.reduce((acc, workout) => {
    if (!acc[workout.date]) {
      acc[workout.date] = { marked: true, dotColor: '#007BFF' };
    }
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
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
      <Text style={styles.header}>Available Workouts for {selectedDate}</Text>
      <FlatList
        data={workouts.filter(workout => workout.date === selectedDate)}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
                <Text style={styles.modalInfo}>Date: {selectedWorkout.date}</Text>
                <Text style={styles.modalInfo}>Time: {selectedWorkout.time}</Text>
                <Text style={styles.modalInfo}>Available: {selectedWorkout.capacity - selectedWorkout.attendees.length} / {selectedWorkout.capacity}</Text>
                {errorMessage ? (
                  <Text style={styles.errorMessage}>{errorMessage}</Text>
                ) : null}
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => bookWorkout(selectedWorkout.id)}
                  disabled={loading}
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
  workoutTime: {
    fontSize: 16,
    color: '#007BFF',
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
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default SchedulePage;
