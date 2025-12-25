// User Types
export interface User {
  id: string;
  firebaseUid: string;
  name: string;
  email?: string;
  phone: string;
  location_coordinates?: [number, number]; // [longitude, latitude]
  rating?: number;
  total_services?: number;
  created_at: string;
  updated_at: string;
}

// Service Provider Types
export interface ServiceProvider {
  id: string;
  firebaseUid: string;
  name: string;
  phone: string;
  email?: string;
  services: string[];
  custom_services?: string[];
  rating: number;
  total_jobs: number;
  verified: boolean;
  location_coordinates?: [number, number];
}

// Service Request Types
export interface ServiceRequest {
  id: string;
  user_id: string;
  provider_id?: string;
  category?: string;
  description?: string;
  summary?: string;
  media_images?: string[];
  media_audio?: string[];
  location_coordinates?: [number, number];
  otp?: string;
  status: 'pending' | 'searching' | 'matched' | 'in-progress' | 'completed' | 'cancelled';
  base_price?: number;
  extra_charges?: number;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
  user?: User;
  provider?: ServiceProvider;
}

// API Response Types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface CreateUserRequest {
  name: string;
  email?: string;
  phone: string;
  location_coordinates?: [number, number];
}

export interface CreateServiceRequestRequest {
  category?: string;
  description?: string;
  summary?: string;
  media_images?: string[];
  media_audio?: string[];
  location_coordinates?: [number, number];
  base_price?: number;
  extra_charges?: number;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  UserDetails: undefined;
  Home: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  OTP: { phoneNumber: string };
};

export type AppStackParamList = {
  Home: undefined;
  FindingMatch: { requestId: string };
  ProviderDetails: { requestId: string };
  Profile: undefined;
  History: undefined;
};

