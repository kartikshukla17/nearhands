import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../../shared/config/config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, removeAuthToken } from '../../user/services/api';

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
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// Provider API Methods
export const providerApi = {
  // Provider endpoints
  providers: {
    create: async (data: {
      name: string;
      email?: string;
      phone: string;
      services: string[];
      custom_services?: string[];
      location_coordinates?: [number, number];
      document_aadhaar?: string;
      document_selfie_url?: string;
      document_additional_docs?: string[];
    }) => {
      const response = await apiClient.post('/providers', data);
      return response.data;
    },
    getProfile: async () => {
      const response = await apiClient.get('/providers/me');
      return response.data;
    },
    update: async (id: string, data: Partial<{
      name?: string;
      email?: string;
      phone?: string;
      services?: string[];
      custom_services?: string[];
      location_coordinates?: [number, number];
    }>) => {
      const response = await apiClient.put(`/providers/${id}`, data);
      return response.data;
    },
    updateSubscription: async (id: string, data: {
      subscription_plan?: string;
      subscription_active?: boolean;
      subscription_expiry_date?: string;
    }) => {
      const response = await apiClient.put(`/providers/${id}/subscription`, data);
      return response.data;
    },
  },

  // Service Request endpoints (provider view)
  serviceRequests: {
    getByProvider: async () => {
      const response = await apiClient.get('/service-requests/provider/me');
      return response.data;
    },
    getNewRequests: async () => {
      const response = await apiClient.get('/service-requests/provider/me/new');
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/service-requests/${id}`);
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

export default providerApi;
