import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

const AdminSchedulePage = () => {
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [selectedDay, setSelectedDay] = useState(moment().format('YYYY-MM-DD'));
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetchWorkouts();
  }, [selectedDay]);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/workouts?date=${selectedDay}`);
      const data = await response.json();
      if (response.ok) {
        setWorkouts(data);
      } else {
        Alert.alert('Error', 'Failed to fetch workouts');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while fetching workouts');
    }
  };

  const renderWorkoutItem = ({ item }) => (
    <View style={styles.workoutContainer}>
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutTime}>{item.time}</Text>
        <View style={styles.workoutDetails}>
          <Text style={styles.workoutTitle}>{item.title} <Icon name="fitness-outline" size={16} /></Text>
          <Text style={styles.workoutInstructor}>{item.instructor}</Text>
          <Text style={styles.workoutBooked}>{item.booked}</Text>
        </View>
      </View>
      <Image source={{ uri: item.imageUrl }} style={styles.workoutImage} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Schedule</Text>
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id}
        style={styles.workoutList}
      />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  workoutContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutDetails: {
    marginTop: 5,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutInstructor: {
    fontSize: 14,
    color: '#666',
  },
  workoutBooked: {
    fontSize: 14,
    color: '#007BFF',
  },
  workoutImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginLeft: 10,
  },
});

export default AdminSchedulePage;
