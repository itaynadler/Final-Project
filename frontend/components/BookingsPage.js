import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { id: userId } = JSON.parse(userData);
      const response = await fetch(`http://3.91.21.194:3000/bookings/${userId}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings. Please try again.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
      global.refreshBookings = fetchBookings;
      return () => {
        global.refreshBookings = null;
      };
    }, [fetchBookings])
  );

  const cancelBooking = async (workoutId) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { id: userId } = JSON.parse(userData);
      const response = await fetch(`http://3.91.21.194:3000/bookings/${userId}/${workoutId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        Alert.alert('Success', 'Booking cancelled successfully');
        fetchBookings();
      } else {
        Alert.alert('Error', 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    }
  };

  const renderBookingItem = ({ item }) => {
    const workoutDate = moment(`${item.date} ${item.time}`, 'YYYY-MM-DD HH:mm');
    const isPastWorkout = moment().isAfter(workoutDate);

    return (
      <View style={styles.bookingItem}>
        <Text style={styles.bookingTitle}>{item.title}</Text>
        <Text style={styles.bookingInfo}>Instructor: {item.instructor}</Text>
        <Text style={styles.bookingInfo}>Date: {moment(item.date).format('YYYY-MM-DD')}</Text>
        <Text style={styles.bookingInfo}>Time: {item.time}</Text>
        {isPastWorkout ? (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>Workout Completed</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelBooking(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Bookings</Text>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>You have no bookings.</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d4150',
  },
  bookingItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 5,
  },
  bookingInfo: {
    fontSize: 14,
    color: '#7d8a9a',
    marginBottom: 3,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  completedContainer: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  completedText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7d8a9a',
    marginTop: 20,
  },
});

export default BookingsPage;
