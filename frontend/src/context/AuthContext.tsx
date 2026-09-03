import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, getCurrentSession, getCurrentUser, onAuthStateChange } from '../services/supabase';
import { apiClient } from '../services/api';
import { profileService, UserProfile } from '../services/api/profile';

interface PayGuardUser {
  user_id: string;
  email?: string;
  display_name?: string;
  is_new_user: boolean;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  payguardUser: PayGuardUser | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  syncUser: (provider: string, subject: string, email?: string, name?: string, phone?: string) => Promise<PayGuardUser | null>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [payguardUser, setPayguardUser] = useState<PayGuardUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      setUserProfile(profile);
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
    }
  };

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { session: currentSession } = await getCurrentSession();
        if (currentSession) {
          setSession(currentSession);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${currentSession.access_token}`;
          await fetchProfile();
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (newSession: Session | null) => {
      setSession(newSession);
      if (newSession) {
        // Update API client with new token
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newSession.access_token}`;
        await fetchProfile();
      } else {
        // Clear API client auth header
        delete apiClient.defaults.headers.common['Authorization'];
        setUserProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Sync authenticated user with PayGuard backend
   * Creates/updates local user record from external auth provider
   */
  const syncUser = async (
    provider: string,
    subject: string,
    email?: string,
    name?: string,
    phone?: string
  ): Promise<PayGuardUser | null> => {
    try {
      setError(null);
      
      // Ensure we have the latest token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await apiClient.post('/auth/sync', {
        external_auth_provider: provider,
        external_subject: subject,
        email,
        display_name: name,
        phone_number: phone
      }, {
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });

      const user: PayGuardUser = response.data;
      setPayguardUser(user);
      await fetchProfile();
      return user;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to synchronize user';
      setError(errorMessage);
      console.error('User sync failed:', errorMessage);
      return null;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      
      // Call backend logout endpoint
      try {
        await apiClient.post('/auth/logout');
      } catch (err) {
        console.warn('Backend logout failed:', err);
      }

      // Sign out from Supabase (may fail if mock)
      try {
        await supabase.auth.signOut();
      } catch (e) {}

      // Clear state
      setSession(null);
      setPayguardUser(null);
      setUserProfile(null);
      delete apiClient.defaults.headers.common['Authorization'];
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to logout';
      setError(errorMessage);
      console.error('Logout failed:', errorMessage);
      throw err;
    }
  };

  const value: AuthContextType = {
    session,
    loading,
    payguardUser,
    userProfile,
    isAuthenticated: !!session,
    syncUser,
    refreshProfile: fetchProfile,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
