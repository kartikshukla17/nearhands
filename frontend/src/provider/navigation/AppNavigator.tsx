import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import RequestsScreen from '../screens/RequestsScreen';
import RequestDetailsScreen from '../screens/RequestDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

export type ProviderAppStackParamList = {
  Dashboard: undefined;
  Requests: undefined;
  RequestDetails: { requestId: string };
  Profile: undefined;
  ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<ProviderAppStackParamList>();

const ProviderAppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Requests" component={RequestsScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
};

export default ProviderAppNavigator;
