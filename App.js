import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ToastProvider } from './src/context/ToastContext';
import NetworkStatusBanner from './src/components/common/NetworkStatusBanner';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <LocationProvider>
          <ToastProvider>
            <AuthProvider>
              <NetworkStatusBanner />
              <AppNavigator />
            </AuthProvider>
          </ToastProvider>
        </LocationProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
