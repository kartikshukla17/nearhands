import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { setAuthToken, removeAuthToken } from '../services/api';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user has completed profile
  const hasCompletedProfile = !!user;

  // Fetch user profile from backend
  const fetchUserProfile = async (firebaseUid: string, idToken: string) => {
    try {
      await setAuthToken(idToken);
      const userData = await api.users.getProfile();
      setUser(userData);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // User doesn't exist in backend yet
        setUser(null);
      } else {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  // Refresh user profile
  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const idToken = await firebaseUser.getIdToken();
        await fetchUserProfile(firebaseUser.uid, idToken);
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await removeAuthToken();
      setUser(null);
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
          await fetchUserProfile(firebaseUser.uid, idToken);
        } catch (error) {
          console.error('Error getting user token:', error);
        }
      } else {
        setUser(null);
        await removeAuthToken();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!firebaseUser,
    hasCompletedProfile,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

