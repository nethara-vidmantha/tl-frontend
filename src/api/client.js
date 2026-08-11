import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Dynamically resolve the backend URL:
// 1. Environment Variable for Production (Vercel / Railway)
// 2. Web browser in development uses localhost:5000/api
// 3. Mobile device (Expo Go on physical phone) gets the host PC IP from Metro bundler hostUri
// 4. Default LAN IP fallback uses 192.168.96.16:5000/api
const getBaseUrl = () => {
  // Check for Expo Public Env URL (Used when deploying to Vercel / Production)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // Detect host IP from Expo Metro bundler
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:5000/api`;
    }
  }

  // Fallback to active Wi-Fi LAN IP
  return 'http://192.168.96.16:5000/api';
};

const API_BASE_URL = getBaseUrl();
console.log(`[TaskLanka API] Initialized with Base URL: ${API_BASE_URL}`);

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@tasklanka_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors & format user-friendly messages
client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await AsyncStorage.removeItem('@tasklanka_token');
        await AsyncStorage.removeItem('@tasklanka_user');
      } catch (e) {
        // ignore
      }
    }

    let message = error.response?.data?.message;

    if (!message) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        message = `Server timeout connecting to ${API_BASE_URL}. Please ensure your backend is running.`;
      } else if (error.message?.includes('Network Error') || !error.response) {
        message = `Cannot reach backend at ${API_BASE_URL}.\n\nPlease ensure your backend is running on Railway or locally.`;
      } else {
        message = error.message || 'An unexpected communication error occurred.';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default client;
export { API_BASE_URL };
