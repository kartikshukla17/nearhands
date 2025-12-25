// Configuration loaded from environment variables
// See .env file for configuration values
// 
// To find your computer's IP address:
// Windows: Run 'ipconfig' in PowerShell and look for IPv4 Address under your active network adapter
// Mac/Linux: Run 'ifconfig' or 'ip addr' and look for your local network IP (usually 192.168.x.x or 10.x.x.x)
//
// IMPORTANT: Make sure your phone and computer are on the same WiFi network!
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get config from app.config.js extra field (loaded from .env)
const extra = Constants.expoConfig?.extra || {};

// API Configuration from environment variables
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Android emulator uses special IP to access host machine
    if (Platform.OS === 'android') {
      return extra.apiBaseUrl?.android || process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID || 'http://192.168.0.3:5000/api';
    }
    // iOS simulator and web can use localhost
    return extra.apiBaseUrl?.ios || process.env.EXPO_PUBLIC_API_BASE_URL_IOS || 'http://localhost:5000/api';
  }
  return extra.apiBaseUrl?.production || process.env.EXPO_PUBLIC_API_BASE_URL_PRODUCTION || 'https://your-production-api.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Firebase Configuration from environment variables
export const FIREBASE_CONFIG = {
  apiKey: extra.firebase?.apiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: extra.firebase?.authDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: extra.firebase?.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: extra.firebase?.storageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: extra.firebase?.messagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: extra.firebase?.appId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: extra.firebase?.measurementId || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Service Categories
export const SERVICE_CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'carpentry', name: 'Carpentry', icon: '🪚' },
  { id: 'painting', name: 'Painting', icon: '🎨' },
  { id: 'appliance', name: 'Appliance Repair', icon: '🔌' },
  { id: 'gardening', name: 'Gardening', icon: '🌱' },
  { id: 'moving', name: 'Moving', icon: '📦' },
];

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  SEARCHING: 'searching',
  MATCHED: 'matched',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Polling Configuration
export const POLLING_INTERVAL = 3000; // 3 seconds
export const MAX_POLLING_ATTEMPTS = 60; // 2 minutes total

