import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminSchedulePage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchWorkouts();
      global.refreshSchedules = fetchWorkouts;

      return () => {
        global.refreshSchedules = null;
      };
    }, [])
  );

  useEffect(() => {
    if (route.params?.selectedDate) {
      setSelectedDate(route.params.selectedDate);
    }
  }, [route.params?.selectedDate]);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('http://3.91.21.194:3000/workouts');
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      Alert.alert('Error', 'Failed to fetch workouts. Please try again.');
    }
  };

  const deleteWorkout = async (workoutId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://3.91.21.194:3000/workouts/${workoutId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        Alert.alert('Success', 'Workout deleted successfully');
        fetchWorkouts(); 
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to delete workout');
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      Alert.alert('Error', 'Failed to delete workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.workoutTime}>{item.time}</Text>
      </View>
      <Text style={styles.workoutInfo}>Instructor: {item.instructor}</Text>
      <Text style={styles.workoutInfo}>Spots: {item.attendees.length} / {item.capacity}</Text>
    </TouchableOpacity>
  );

  const markedDates = workouts.reduce((acc, workout) => {
    const date = moment(workout.date).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = { marked: true, dotColor: '#007BFF' };
    }
    return acc;
  }, {});

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

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Schedule</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
                <Text style={styles.modalInfo}>Date: {moment(selectedWorkout.date).format('YYYY-MM-DD')}</Text>
                <Text style={styles.modalInfo}>Time: {selectedWorkout.time}</Text>
                <Text style={styles.modalInfo}>Spots: {selectedWorkout.attendees.length} / {selectedWorkout.capacity}</Text>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteWorkout(selectedWorkout._id)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Delete Workout</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
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
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    marginTop: 15,
    width: '100%',
  },
  deleteButtonText: {
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
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#7d8a9a',
  },
});

export default AdminSchedulePage;
