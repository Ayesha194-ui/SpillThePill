import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  savedMedicines: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  saveMedicine: (medicineName: string) => Promise<void>;
  getSavedMedicines: () => Promise<string[]>;
  removeSavedMedicine: (medicineName: string) => Promise<void>;
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

const API_BASE_URL = Platform.OS === 'web' ? 'http://localhost:5050/api' : 'http://10.0.2.2:5050/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Login successful:', data.user.email);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setUser(data.user);
      setToken(data.token);
      
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Signup successful:', data.user.email);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const saveMedicine = async (medicineName: string) => {
    try {
      await makeAuthenticatedRequest('/auth/save-medicine', {
        method: 'POST',
        body: JSON.stringify({ medicineName }),
      });
      
      // Update local user state
      if (user) {
        const updatedUser = {
          ...user,
          savedMedicines: [...user.savedMedicines, medicineName]
        };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Save medicine error:', error);
      throw error;
    }
  };

  const getSavedMedicines = async (): Promise<string[]> => {
    try {
      const data = await makeAuthenticatedRequest('/auth/saved-medicines');
      return data.savedMedicines || [];
    } catch (error) {
      console.error('Get saved medicines error:', error);
      return [];
    }
  };

  const removeSavedMedicine = async (medicineName: string) => {
    try {
      await makeAuthenticatedRequest(`/auth/saved-medicines/${encodeURIComponent(medicineName)}`, {
        method: 'DELETE',
      });
      
      // Update local user state
      if (user) {
        const updatedUser = {
          ...user,
          savedMedicines: user.savedMedicines.filter(med => med !== medicineName)
        };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Remove saved medicine error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    saveMedicine,
    getSavedMedicines,
    removeSavedMedicine,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 