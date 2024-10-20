import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPage from './components/login';
import RegisterPage from './components/register';
import HomePage from './components/home';
import SchedulePage from './components/schedule';
import AdminPage from './components/AdminPage';
import AdminSchedulePage from './components/AdminSchedulePage';



const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007BFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            cardStyle: { backgroundColor: '#f8f9fa' },
          }}
        >
          <Stack.Screen name="Login" component={LoginPage} options={{headerShown: false}} />
          <Stack.Screen name="Register" component={RegisterPage} />
          <Stack.Screen name="Home" component={HomePage} options={{headerShown: false}}/>
          <Stack.Screen name="Schedule" component={SchedulePage} options={{headerShown: false}}/>
          <Stack.Screen name="Admin" component={AdminPage} options={{ title: 'Admin Dashboard' }} />
          <Stack.Screen name="AdminSchedule" component={AdminSchedulePage} options={{ title: 'Schedule' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
