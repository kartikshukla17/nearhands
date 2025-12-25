import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { UnifiedAuthProvider } from './shared/context/UnifiedAuthContext';
import MainRootNavigator from './navigation/MainRootNavigator';
import { API_BASE_URL } from './shared/config/config/constants';

export default function App() {
  useEffect(() => {
    // Log API configuration on app startup for debugging
    if (__DEV__) {
      console.log('🚀 NearHands App Starting...');
      console.log(`📱 Platform: ${Platform.OS}`);
      console.log(`🌐 API Base URL: ${API_BASE_URL}`);
      console.log('💡 If using a physical device, make sure to use your computer\'s IP address instead of localhost');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <UnifiedAuthProvider>
        <StatusBar style="auto" />
        <MainRootNavigator />
      </UnifiedAuthProvider>
    </SafeAreaProvider>
  );
}

