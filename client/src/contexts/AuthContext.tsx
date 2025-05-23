import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotification } from './NotificationContext';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  nickname: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, nickname: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    nickname?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = 'http://localhost:3001/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 0) {
          throw new Error('Не удалось подключиться к серверу. Пожалуйста, проверьте подключение к интернету и попробуйте снова.');
        }
        const error = await response.json();
        throw new Error(error.message || 'Ошибка при входе');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      showNotification('Successfully logged in', 'success');
      return data;
    } catch (error) {
      console.error('Login error:', error);
      showNotification('Login failed: ' + (error as Error).message, 'error');
      throw error;
    }
  };

  const register = async (name: string, nickname: string, email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        nickname,
        email,
        password,
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      showNotification('Registration successful', 'success');
      return response.data.user;
    } catch (error) {
      showNotification('Registration failed: ' + (error as Error).message, 'error');
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem('token');
    setUser(null);
    showNotification('Successfully logged out', 'success');
  };

  const updateProfile = async (data: {
    name?: string;
    nickname?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<void> => {
    try {
      const response = await axios.put(`${API_URL}/auth/update-profile`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }
      setUser(response.data.user);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update profile: ' + (error as Error).message, 'error');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 