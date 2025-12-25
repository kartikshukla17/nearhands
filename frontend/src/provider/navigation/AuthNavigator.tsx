import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../shared/types/types/index';
// Reuse user auth screens since authentication is the same
import LoginScreen from '../../user/screens/Auth/LoginScreen';
import OTPScreen from '../../user/screens/Auth/OTPScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const ProviderAuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
    </Stack.Navigator>
  );
};

export default ProviderAuthNavigator;
