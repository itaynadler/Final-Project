import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

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
      const response = await fetch(`http://localhost:3000/user/${userData._id}`, {
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
      } else {
        console.error('Failed to update user data');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
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
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
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
            <TextInput
              style={styles.input}
              value={formatDate(userData.birthDate)}
              onChangeText={(text) => setUserData({ ...userData, birthDate: new Date(text) })}
              placeholder="YYYY-MM-DD"
            />
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
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
});

export default ProfilePage;
