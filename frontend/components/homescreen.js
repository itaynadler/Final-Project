import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [todayWorkouts, setTodayWorkouts] = useState([]);

  const fetchUserData = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { firstName, id } = JSON.parse(userData);
        setFirstName(firstName);
        fetchTodayWorkouts(id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/announcements');
      const data = await response.json();
      if (response.ok) {
        setAnnouncements(data);
      } else {
        console.error('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }, []);

  const fetchTodayWorkouts = useCallback(async (userId) => {
    try {
      const today = moment().format('YYYY-MM-DD');
      const response = await fetch(`http://localhost:3000/workouts/user/${userId}?date=${today}`);
      const data = await response.json();
      if (response.ok) {
        setTodayWorkouts(data);
      } else {
        console.error('Failed to fetch today\'s workouts');
      }
    } catch (error) {
      console.error('Error fetching today\'s workouts:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchAnnouncements();
    }, [fetchUserData, fetchAnnouncements])
  );

  const renderAnnouncementItem = ({ item }) => (
    <View style={styles.messageBox}>
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  const renderWorkoutItem = ({ item }) => (
    <View style={styles.workoutBox}>
      <Text style={styles.workoutTitle}>{item.title}</Text>
      <Text style={styles.workoutInfo}>Time: {item.time}</Text>
      <Text style={styles.workoutInfo}>Instructor: {item.instructor}</Text>
    </View>
  );

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial(firstName)}</Text>
        </View>
        <Text style={styles.userName}>Welcome, {firstName}!</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          <FlatList
            data={announcements}
            renderItem={renderAnnouncementItem}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text style={styles.emptyText}>No announcements at the moment.</Text>}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activities</Text>
          {todayWorkouts.length > 0 ? (
            <FlatList
              data={todayWorkouts}
              renderItem={renderWorkoutItem}
              keyExtractor={(item) => item._id}
            />
          ) : (
            <View style={styles.restBox}>
              <Text style={styles.restText}>No workouts today. Enjoy your rest day!</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  avatarContainer: {
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  workoutBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 5,
  },
  workoutInfo: {
    fontSize: 14,
    color: '#666',
  },
  restBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
