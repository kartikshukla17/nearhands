import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage key
const TOKEN_KEY = 'auth_token';

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (__DEV__) {
          console.log(`🔐 Adding auth token to request: ${config.method?.toUpperCase()} ${config.url}`);
        }
      } else {
        if (__DEV__) {
          console.warn(`⚠️ No auth token found for request: ${config.method?.toUpperCase()} ${config.url}`);
        }
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem(TOKEN_KEY);
      // You can dispatch a logout action here if using Redux/Context
    }
    return Promise.reject(error);
  }
);

// Token management
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
    throw error;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// API Methods
export const api = {
  // User endpoints
  users: {
    create: async (data: {
      name: string;
      email?: string;
      phone: string;
      location_coordinates?: [number, number];
    }) => {
      const response = await apiClient.post('/users', data);
      return response.data;
    },
    getProfile: async () => {
      const response = await apiClient.get('/users/me');
      return response.data;
    },
    update: async (id: string, data: Partial<{
      name?: string;
      email?: string;
      phone?: string;
      location_coordinates?: [number, number];
    }>) => {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
    },
  },

  // Service Request endpoints
  serviceRequests: {
    create: async (data: {
      category?: string;
      description?: string;
      summary?: string;
      media_images?: string[];
      media_audio?: string[];
      location_coordinates?: [number, number];
      base_price?: number;
      extra_charges?: number;
    }) => {
      const response = await apiClient.post('/service-requests', data);
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/service-requests/${id}`);
      return response.data;
    },
    getByUser: async () => {
      const response = await apiClient.get('/service-requests/user/me');
      return response.data;
    },
    updateStatus: async (id: string, status: string) => {
      const response = await apiClient.patch(`/service-requests/${id}/status`, { status });
      return response.data;
    },
    verifyOTP: async (id: string, otp: string, type: 'start' | 'complete') => {
      const response = await apiClient.post(`/service-requests/${id}/verify-otp`, { otp, type });
      return response.data;
    },
  },
};

export default api;

