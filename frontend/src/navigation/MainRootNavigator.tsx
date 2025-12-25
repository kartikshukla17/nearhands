import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUnifiedAuth } from '../shared/context/UnifiedAuthContext';
import UserRootNavigator from '../user/navigation/RootNavigator';
import ProviderRootNavigator from '../provider/navigation/RootNavigator';
import UserAuthNavigator from '../user/navigation/AuthNavigator';

const Stack = createNativeStackNavigator();

const MainRootNavigator: React.FC = () => {
  const { userType, isAuthenticated, loading } = useUnifiedAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Not authenticated - show auth screens
          <Stack.Screen name="Auth" component={UserAuthNavigator} />
        ) : userType === 'provider' ? (
          // Authenticated as provider - show provider app
          <Stack.Screen name="ProviderApp" component={ProviderRootNavigator} />
        ) : userType === 'user' ? (
          // Authenticated as user - show user app
          <Stack.Screen name="UserApp" component={UserRootNavigator} />
        ) : (
          // Authenticated but no profile - show user auth to complete profile
          <Stack.Screen name="UserApp" component={UserRootNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
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

export default MainRootNavigator;
