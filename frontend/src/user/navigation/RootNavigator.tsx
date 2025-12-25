import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUnifiedAuth } from '../../shared/context/UnifiedAuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import UserDetailsScreen from '../screens/Profile/UserDetailsScreen';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, hasCompletedProfile, loading, user } = useUnifiedAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !hasCompletedProfile || !user ? (
        <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      ) : (
        <Stack.Screen name="App" component={AppNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default RootNavigator;
