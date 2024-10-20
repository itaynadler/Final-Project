import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const CreateWorkoutPage = () => {
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleCreateWorkout = async () => {
    if (!title || !instructor || !date || !time) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/createWorkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          instructor,
          date,
          time,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Workout created successfully');
        // Clear input fields
        setTitle('');
        setInstructor('');
        setDate('');
        setTime('');
      } else {
        Alert.alert('Error', 'Failed to create workout');
      }
    } catch (error) {
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
