import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const { firstName } = JSON.parse(userData);
          setFirstName(firstName);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    getUserData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Avatar Symbol */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }} // Placeholder image, replace with user's avatar
          style={styles.avatar}
        />
        <Text style={styles.userName}>Welcome, {firstName}!</Text>
      </View>

      {/* Running Squares with Messages */}
      <View style={styles.messageContainer}>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>Welcome to the Studio! 🏋️‍♂️</Text>
        </View>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>Check out our new classes! 📅</Text>
        </View>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>Don't forget your workout today! 💪</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  messageContainer: {
    width: '100%',
  },
  messageBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Android shadow
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
});

export default HomeScreen;
