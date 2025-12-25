import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/config/firebase';
import { setAuthToken, removeAuthToken } from '../../user/services/api';
import { User, ServiceProvider } from '../types/types/index';
import api from '../../user/services/api';
import providerApi from '../../provider/services/api';

type UserType = 'user' | 'provider' | null;

interface UnifiedAuthContextType {
  user: User | null;
  provider: ServiceProvider | null;
  firebaseUser: FirebaseUser | null;
  userType: UserType;
  loading: boolean;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

interface UnifiedAuthProviderProps {
  children: ReactNode;
}

export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user has completed profile
  const hasCompletedProfile = !!user || !!provider;

  // Fetch profiles from backend
  const fetchProfiles = async (firebaseUid: string, idToken: string) => {
    try {
      await setAuthToken(idToken);
      
      // Try to fetch both user and provider profiles
      const [userResult, providerResult] = await Promise.allSettled([
        api.users.getProfile(),
        providerApi.providers.getProfile(),
      ]);

      if (userResult.status === 'fulfilled') {
        setUser(userResult.value);
        setProvider(null);
        setUserType('user');
      } else if (providerResult.status === 'fulfilled') {
        setProvider(providerResult.value);
        setUser(null);
        setUserType('provider');
      } else {
        // Neither exists - user needs to choose or complete profile
        setUser(null);
        setProvider(null);
        setUserType(null);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setUser(null);
      setProvider(null);
      setUserType(null);
    }
  };

  // Refresh profiles
  const refreshProfile = async () => {
    if (firebaseUser) {
      try {
        const idToken = await firebaseUser.getIdToken();
        await fetchProfiles(firebaseUser.uid, idToken);
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await removeAuthToken();
      setUser(null);
      setProvider(null);
      setFirebaseUser(null);
      setUserType(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          await fetchProfiles(firebaseUser.uid, idToken);
        } catch (error) {
          console.error('Error getting user token:', error);
        }
      } else {
        setUser(null);
        setProvider(null);
        setUserType(null);
        await removeAuthToken();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: UnifiedAuthContextType = {
    user,
    provider,
    firebaseUser,
    userType,
    loading,
    isAuthenticated: !!firebaseUser,
    hasCompletedProfile,
    signOut,
    refreshProfile,
  };

  return <UnifiedAuthContext.Provider value={value}>{children}</UnifiedAuthContext.Provider>;
};
