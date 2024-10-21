import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CreateWorkoutPage = () => {
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const navigation = useNavigation();

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
        Alert.alert('Success', 'Workout created successfully');
        // Clear input fields
        setTitle('');
        setInstructor('');
        setDate('');
        setTime('');
        setCapacity('');

        // Refresh the AdminSchedulePage
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create New Workout</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Time (HH:MM)"
        value={time}
        onChangeText={setTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Capacity"
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric"
      />
      <Button title="Create Workout" onPress={handleCreateWorkout} />
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
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});

export default CreateWorkoutPage;
