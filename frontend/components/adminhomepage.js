import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AdminDashboard from './AdminDashboard'; // Admin dashboard component
import CreateWorkoutPage from './adminnewworkout'; // Workout creation component
import AdminSchedulePage from './AdminSchedulePage'; // Admin schedule view component

const Tab = createBottomTabNavigator();

const AdminHomePage = () => {
  return (
    <Tab.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'AdminDashboard') {
            iconName = 'analytics-outline';
          } else if (route.name === 'CreateWorkout') {
            iconName = 'add-circle-outline';
          } else if (route.name === 'AdminSchedule') {
            iconName = 'calendar-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="AdminSchedule"
        component={AdminSchedulePage}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen
        name="CreateWorkout"
        component={CreateWorkoutPage}
        options={{ title: 'Create Workout' }}
      />
    </Tab.Navigator>
  );
};

export default AdminHomePage;
