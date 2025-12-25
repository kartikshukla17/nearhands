import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../shared/config/config/firebase';
import { setAuthToken, removeAuthToken } from '../../user/services/api';
import { ServiceProvider } from '../../shared/types/types/index';
import providerApi from '../services/api';

interface ProviderAuthContextType {
  provider: ServiceProvider | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
  signOut: () => Promise<void>;
  refreshProvider: () => Promise<void>;
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined);

export const useProviderAuth = () => {
  const context = useContext(ProviderAuthContext);
  if (!context) {
    throw new Error('useProviderAuth must be used within a ProviderAuthProvider');
  }
  return context;
};

interface ProviderAuthProviderProps {
  children: ReactNode;
}

export const ProviderAuthProvider: React.FC<ProviderAuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if provider has completed profile
  const hasCompletedProfile = !!provider;

  // Fetch provider profile from backend
  const fetchProviderProfile = async (firebaseUid: string, idToken: string) => {
    try {
      await setAuthToken(idToken);
      const providerData = await providerApi.providers.getProfile();
      setProvider(providerData);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Provider doesn't exist in backend yet
        setProvider(null);
      } else {
        console.error('Error fetching provider profile:', error);
      }
    }
  };

  // Refresh provider profile
  const refreshProvider = async () => {
    if (firebaseUser) {
      try {
        const idToken = await firebaseUser.getIdToken();
        await fetchProviderProfile(firebaseUser.uid, idToken);
      } catch (error) {
        console.error('Error refreshing provider:', error);
      }
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await removeAuthToken();
      setProvider(null);
      setFirebaseUser(null);
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
          await fetchProviderProfile(firebaseUser.uid, idToken);
        } catch (error) {
          console.error('Error getting provider token:', error);
        }
      } else {
        setProvider(null);
        await removeAuthToken();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: ProviderAuthContextType = {
    provider,
    firebaseUser,
    loading,
    isAuthenticated: !!firebaseUser,
    hasCompletedProfile,
    signOut,
    refreshProvider,
  };

  return <ProviderAuthContext.Provider value={value}>{children}</ProviderAuthContext.Provider>;
};
