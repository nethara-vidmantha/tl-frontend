import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('@tasklanka_token');
      const savedUser = await AsyncStorage.getItem('@tasklanka_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with backend
        try {
          const res = await authApi.getProfile();
          if (res.data) {
            setUser(res.data);
            await AsyncStorage.setItem('@tasklanka_user', JSON.stringify(res.data));
          }
        } catch (e) {
          // Keep cached user if offline
        }
      }
    } catch (err) {
      console.warn('Failed to restore session', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const { user: userData, token: jwtToken } = res.data;

    setUser(userData);
    setToken(jwtToken);

    await AsyncStorage.setItem('@tasklanka_token', jwtToken);
    await AsyncStorage.setItem('@tasklanka_user', JSON.stringify(userData));

    return userData;
  };

  const googleLogin = async (googlePayload = {}) => {
    const res = await authApi.googleLogin({
      email: googlePayload.email || 'google.user@tasklanka.lk',
      name: googlePayload.name || 'Google User',
      profileImage: googlePayload.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      googleId: googlePayload.googleId || 'google_123456789'
    });
    const { user: userData, token: jwtToken } = res.data;

    setUser(userData);
    setToken(jwtToken);

    await AsyncStorage.setItem('@tasklanka_token', jwtToken);
    await AsyncStorage.setItem('@tasklanka_user', JSON.stringify(userData));

    return userData;
  };

  const demoLogin = async (role = 'customer') => {
    let email = 'customer@tasklanka.lk';
    if (role === 'worker') email = 'worker@tasklanka.lk';
    if (role === 'admin') email = 'admin@tasklanka.lk';

    return await login(email, 'password123');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { user: newUser, token: jwtToken } = res.data;

    setUser(newUser);
    setToken(jwtToken);

    await AsyncStorage.setItem('@tasklanka_token', jwtToken);
    await AsyncStorage.setItem('@tasklanka_user', JSON.stringify(newUser));

    return newUser;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    try {
      await AsyncStorage.removeItem('@tasklanka_token');
      await AsyncStorage.removeItem('@tasklanka_user');
    } catch (e) {
      // ignore
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getProfile();
      if (res.data) {
        setUser(res.data);
        await AsyncStorage.setItem('@tasklanka_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Failed to refresh user profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
        isLoading,
        login,
        googleLogin,
        demoLogin,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
