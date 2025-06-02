import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotification } from './NotificationContext';
import { API_URL } from '../config';

interface User {
  id: string;
  name: string;
  nickname: string;
  email: string;
  avatar?: string;
  role?: 'super-admin' | 'teacher' | 'student' | string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, nickname: string, email: string, password: string, user_group: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    nickname?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
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
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.message || 'Login failed: No token received');
      }
      localStorage.setItem('token', data.token);
      setUser(data.user);
      showNotification('Successfully logged in', 'success');
      return data.user;
    } catch (error: any) {
      showNotification('Login failed: ' + (error.message || error), 'error');
      throw error;
    }
  };

  const register = async (name: string, nickname: string, email: string, password: string, user_group: string): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nickname, email, password, user_group }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      setUser(data.user);
      localStorage.setItem('token', data.token);
      showNotification('Registration successful', 'success');
      return data.user;
    } catch (error: any) {
      showNotification('Registration failed: ' + (error.message || error), 'error');
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update profile');
      }
      setUser(resData.user);
      showNotification('Profile updated successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to update profile: ' + (error.message || error), 'error');
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