import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AdminDashboard from './AdminDashboard';
import AdminSchedulePage from './AdminSchedulePage';
import CreateWorkoutPage from './adminnewworkout';

const Tab = createBottomTabNavigator();

const AdminPage = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = 'stats-chart-outline';
          } else if (route.name === 'Schedule') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Create Workout') {
            iconName = 'add-circle-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Schedule" component={AdminSchedulePage} />
      <Tab.Screen name="Create Workout" component={CreateWorkoutPage} />
    </Tab.Navigator>
  );
};

export default AdminPage;
