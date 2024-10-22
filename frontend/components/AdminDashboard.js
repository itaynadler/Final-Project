import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminDashboard = () => {
  const [workoutOnlyClients, setWorkoutOnlyClients] = useState(0);
  const [workoutAndVideoClients, setWorkoutAndVideoClients] = useState(0);
  const [message, setMessage] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const response = await fetch('http://localhost:3000/clients');
      const data = await response.json();
      if (response.ok) {
        setWorkoutOnlyClients(data.workoutOnly);
        setWorkoutAndVideoClients(data.workoutAndVideo);
      } else {
        Alert.alert('Error', 'Failed to load client data');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while fetching data');
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Message sent to clients');
        setMessage(''); // Clear the input after sending
      } else {
        Alert.alert('Error', 'Failed to send the message');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while sending the message');
    }
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
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Clients (Workouts Only): {workoutOnlyClients}</Text>
        <Text style={styles.statText}>Clients (Workouts + Videos): {workoutAndVideoClients}</Text>
      </View>
      <View style={styles.messageContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write a message to clients..."
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Send Message" onPress={sendMessage} />
      </View>
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
  statsContainer: {
    marginBottom: 30,
  },
  statText: {
    fontSize: 18,
    marginVertical: 8,
  },
  messageContainer: {
    marginTop: 20,
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

export default AdminDashboard;
