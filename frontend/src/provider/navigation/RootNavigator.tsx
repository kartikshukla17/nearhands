import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUnifiedAuth } from '../../shared/context/UnifiedAuthContext';
import ProviderAuthNavigator from './AuthNavigator';
import ProviderAppNavigator from './AppNavigator';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

const Stack = createNativeStackNavigator();

const ProviderRootNavigator: React.FC = () => {
  const { isAuthenticated, hasCompletedProfile, loading, provider } = useUnifiedAuth();

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
        <Stack.Screen name="Auth" component={ProviderAuthNavigator} />
      ) : !hasCompletedProfile || !provider ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <Stack.Screen name="App" component={ProviderAppNavigator} />
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

export default ProviderRootNavigator;
