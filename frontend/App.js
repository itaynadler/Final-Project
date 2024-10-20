import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, View } from 'react-native';
import LoginPage from './components/login';
import RegisterPage from './components/register';
import HomePage from './components/home';
import SchedulePage from './components/schedule';
import AdminHomePage from './components/adminhomepage';
import AdminSchedulePage from './components/AdminSchedulePage';



const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginPage} options={{headerShown: false}} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="Home" component={HomePage} options={{headerShown: false}}/>
        <Stack.Screen name="Schedule" component={SchedulePage} options={{headerShown: false}}/>
        <Stack.Screen name="Admin" component={AdminHomePage} options={{ headerShown: false }} />
        <Stack.Screen name="AdminSchedule" component={AdminSchedulePage} options={{ title: 'Schedule' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

