import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const userProfile = await apiService.getProfile();
          setUser(userProfile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to get user profile:', error);
        // If token is invalid, remove it
        apiService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting login for:', email);
      setIsLoading(true);
      const response = await apiService.login({ email, password });
      console.log('AuthContext: Login successful, user:', response.user);
      setUser(response.user);
      setIsAuthenticated(true);
      console.log('AuthContext: User set in state');
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => {
    try {
      console.log('AuthContext: Starting registration');
      setIsLoading(true);
      // Map frontend field names to backend field names
      const backendUserData = {
        userName: userData.username, // Map username -> userName
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName
      };
      const response = await apiService.register(backendUserData);
      console.log('AuthContext: Registration successful, user:', response.user);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
