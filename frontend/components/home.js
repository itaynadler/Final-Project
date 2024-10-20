import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from './homescreen'; // Import HomeScreen component
import SchedulePage from './schedule'; // Import SchedulePage
import VideosPage from './video'; // Placeholder for videos
import ProfilePage from './profile'; // Placeholder for profile
import BookingsPage from './BookingsPage'; // Import the new BookingsPage

// Placeholder components for other screens
const Videos = () => (
  <VideosPage />
);

const Profile = () => (
  <ProfilePage />
);

// Create the bottom tab navigator
const Tab = createBottomTabNavigator();

const HomePage = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'HomeScreen') {
            iconName = 'home-outline';
          } else if (route.name === 'Videos') {
            iconName = 'videocam-outline';
          } else if (route.name === 'Schedule') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          } else if (route.name === 'Bookings') {
            iconName = 'bookmark-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Schedule" component={SchedulePage} />
      <Tab.Screen name="Bookings" component={BookingsPage} />
      <Tab.Screen name="Videos" component={VideosPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
};

export default HomePage;
