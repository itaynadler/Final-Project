import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Platform, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const { id } = JSON.parse(storedUserData);
        const response = await fetch(`http://localhost:3000/user/${id}`);
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (!storedUserData) {
        console.error('No user data found in AsyncStorage');
        return;
      }

      const { id } = JSON.parse(storedUserData);
      
      const response = await fetch(`http://localhost:3000/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: userData.phoneNumber,
          birthDate: userData.birthDate,
          membershipType: userData.membershipType,
        }),
      });

      if (response.ok) {
        setEditing(false);
        // Refresh user data
        fetchUserData();
        // Notify VideosPage to update access
        if (global.refreshVideosAccess) {
          global.refreshVideosAccess();
        }
        // Navigate back to force a re-render of the tab navigator
        navigation.navigate('Home');
      } else {
        console.error('Failed to update user data');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Check if the date is in ISO format (2024-10-23T00:00:00.000Z)
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
    
    // If it's already in YYYY-MM-DD format
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (day) => {
    setUserData({ ...userData, birthDate: day.dateString });
    setShowCalendar(false);
  };

  const navigation = useNavigation();

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

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load user data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitial(userData.firstName)}</Text>
        </View>
        <Text style={styles.name}>{`${userData.firstName} ${userData.lastName}`}</Text>
      </View>

      <Card containerStyle={styles.card}>
        <Card.Title>Personal Information</Card.Title>
        <Card.Divider />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username:</Text>
          <Text style={styles.infoValue}>{userData.username}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone Number:</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={userData.phoneNumber}
              onChangeText={(text) => setUserData({ ...userData, phoneNumber: text })}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.infoValue}>{userData.phoneNumber}</Text>
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Birth Date:</Text>
          {editing ? (
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowCalendar(true)}>
              <Text style={styles.dateText}>{formatDate(userData.birthDate)}</Text>
              <Ionicons name="calendar" size={24} color="#007BFF" />
            </TouchableOpacity>
          ) : (
            <Text style={styles.infoValue}>{formatDate(userData.birthDate)}</Text>
          )}
        </View>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Membership Details</Card.Title>
        <Card.Divider />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membership Type:</Text>
          {editing ? (
            <Picker
              selectedValue={userData.membershipType}
              style={styles.picker}
              onValueChange={(itemValue) => setUserData({ ...userData, membershipType: itemValue })}
            >
              <Picker.Item label="Full" value="full" />
              <Picker.Item label="Partial" value="partial" />
            </Picker>
          ) : (
            <Text style={styles.infoValue}>{userData.membershipType}</Text>
          )}
        </View>
      </Card>

      {editing ? (
        <Button title="Save Changes" onPress={handleSave} buttonStyle={styles.saveButton} />
      ) : (
        <Button title="Edit Profile" onPress={handleEdit} buttonStyle={styles.editButton} />
      )}

      <Button 
        title="Logout" 
        onPress={handleLogout} 
        buttonStyle={styles.logoutButton}
        titleStyle={styles.logoutButtonText}
        icon={
          <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.logoutIcon} />
        }
      />

      <Modal visible={showCalendar} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{[userData.birthDate]: {selected: true, selectedColor: '#007BFF'}}}
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
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowCalendar(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#007BFF',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50', // Nice green color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    borderRadius: 10,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#555',
    flex: 1,
  },
  infoValue: {
    color: '#333',
    flex: 2,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
    flex: 2,
  },
  picker: {
    flex: 2,
    height: 50,
  },
  editButton: {
    backgroundColor: '#007BFF',
    marginHorizontal: 20,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 20,
    marginTop: 20,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    flex: 2,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  closeButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    marginLeft: 10,
  },
  logoutIcon: {
    marginRight: 10,
  },
});

export default ProfilePage;
