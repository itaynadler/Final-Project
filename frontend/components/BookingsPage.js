import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/bookings/user123'); // Replace with actual user ID
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
    }, [fetchBookings])
  );

  const deleteBooking = async (workoutId) => {
    try {
      const response = await fetch(`http://localhost:3000/bookings/user123/${workoutId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message);
        fetchBookings(); // Refresh the bookings list
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      Alert.alert('Error', 'Failed to delete booking');
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingItem}>
      <Text style={styles.bookingTitle}>{item.title}</Text>
      <Text style={styles.bookingInfo}>Instructor: {item.instructor}</Text>
      <Text style={styles.bookingInfo}>Date: {item.date}</Text>
      <Text style={styles.bookingInfo}>Time: {item.time}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteBooking(item.id)}
      >
        <Text style={styles.deleteButtonText}>Cancel Booking</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Bookings</Text>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings found.</Text>}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
    color: '#2d4150',
  },
  bookingItem: {
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
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d4150',
  },
  bookingInfo: {
    fontSize: 14,
    color: '#7d8a9a',
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#7d8a9a',
  },
});

export default BookingsPage;
