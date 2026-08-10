import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const SplashScreen = ({ navigation }) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          navigation.replace('Login');
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>
          Task<Text style={styles.logoHighlight}>ලංකා</Text>
        </Text>
        <Text style={styles.tagline}>Smart On-Demand Service Discovery</Text>
      </View>
      <View style={styles.footer}>
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text style={styles.loadingText}>Connecting...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  logoBox: {
    alignItems: 'center'
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  logoHighlight: {
    color: COLORS.secondary
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500'
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center'
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 10
  }
});

export default SplashScreen;
