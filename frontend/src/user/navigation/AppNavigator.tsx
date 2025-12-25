import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../shared/types/types/index';
import HomeScreen from '../screens/Home/HomeScreen';
import FindingMatchScreen from '../screens/Request/FindingMatchScreen';
import ProviderDetailsScreen from '../screens/Request/ProviderDetailsScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="FindingMatch" component={FindingMatchScreen} />
      <Stack.Screen name="ProviderDetails" component={ProviderDetailsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

