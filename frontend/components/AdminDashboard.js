import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';

const AdminDashboard = () => {
  const [membershipData, setMembershipData] = useState([]);
  const [message, setMessage] = useState('');
  const [totalMembers, setTotalMembers] = useState(0);

  const navigation = useNavigation();

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const response = await fetch('http://localhost:3000/membership-stats');
      const data = await response.json();
      if (response.ok) {
        setMembershipData(data.membershipStats);
        setTotalMembers(data.totalMembers);
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

  const screenWidth = Dimensions.get("window").width;

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  const pieChartData = membershipData.map((item, index) => ({
    name: item.type,
    population: item.count,
    color: colors[index % colors.length],
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.statsContainer}>
          <Text style={styles.statTitle}>Membership Distribution</Text>
          <Text style={styles.totalMembers}>Total Members: {totalMembers}</Text>
          <View style={styles.chartWrapper}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          </View>
        </View>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'System',
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
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    width: '100%',
  },
  statTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'System',
  },
  totalMembers: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'System',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  messageContainer: {
    padding: 20,
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
