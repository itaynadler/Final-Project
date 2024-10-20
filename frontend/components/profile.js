import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';

const ProfilePage = () => {
  // Sample user details
  const userDetails = {
    avatar: 'https://via.placeholder.com/150', // Placeholder image for the avatar
    name: 'John Doe',
    birthdate: '1990-01-01',
    phoneNumber: '+1 (123) 456-7890',
    membershipPlan: 'Gold Membership',
  };

  // Personal details to display in a table-like format
  const personalDetails = [
    { label: 'Birth Date', value: userDetails.birthdate },
    { label: 'Phone Number', value: userDetails.phoneNumber },
    { label: 'Membership Plan', value: userDetails.membershipPlan },
  ];

  // Function to render each personal detail
  const renderDetailItem = ({ item }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{item.label}:</Text>
      <Text style={styles.detailValue}>{item.value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Avatar and Name */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: userDetails.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{userDetails.name}</Text>
      </View>

      {/* Personal Details */}
      <FlatList
        data={personalDetails}
        renderItem={renderDetailItem}
        keyExtractor={(item) => item.label}
        style={styles.detailsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingTop: 180
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
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsList: {
    width: '90%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProfilePage;
