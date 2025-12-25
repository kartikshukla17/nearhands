import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, initializeAuth } from 'firebase/auth';
import { FIREBASE_CONFIG } from './constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Firebase App
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(FIREBASE_CONFIG);
} else {
  app = getApps()[0];
}

// Initialize Auth with React Native persistence
// Using a function to delay initialization until first access
let _auth: Auth | null = null;

const initAuth = (): Auth => {
  if (!_auth) {
    try {
      // Try to get getReactNativePersistence dynamically
      let getReactNativePersistence: any;
      try {
        const authModule = require('firebase/auth') as any;
        getReactNativePersistence = authModule.getReactNativePersistence;
      } catch {
        getReactNativePersistence = null;
      }

      // Try to use initializeAuth with React Native persistence if available
      if (getReactNativePersistence) {
        try {
          _auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
        } catch (error: any) {
          // If already initialized or not registered, fall back to getAuth
          if (
            error?.code === 'auth/already-initialized' ||
            String(error?.message || '').toLowerCase().includes('already initialized') ||
            String(error?.message || '').includes('not been registered')
          ) {
            _auth = getAuth(app);
          } else {
            throw error;
          }
        }
      } else {
        // getReactNativePersistence not available, try initializeAuth without it
        try {
          _auth = initializeAuth(app);
        } catch (error: any) {
          // Fall back to getAuth
          _auth = getAuth(app);
        }
      }
    } catch (error: any) {
      // Final fallback: use getAuth directly
      // This should work even if initializeAuth fails
      _auth = getAuth(app);
    }
  }
  return _auth;
};

// Export auth as a getter to ensure lazy initialization
// This prevents the "Component auth has not been registered yet" error
// by ensuring auth is only initialized when actually accessed
export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const authInstance = initAuth();
    const value = (authInstance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(authInstance);
    }
    return value;
  },
});

export { app };

