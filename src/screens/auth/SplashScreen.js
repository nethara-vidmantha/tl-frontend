import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Wrench } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const SplashScreen = ({ navigation }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          navigation.replace('Login');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoBox,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoBadge}>
          <Wrench size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.logoText}>
          Task<Text style={styles.logoHighlight}>ලංකා</Text>
        </Text>
        <Text style={styles.tagline}>Smart Service Marketplace • Sri Lanka</Text>
      </Animated.View>

      <View style={styles.footer}>
        <ActivityIndicator color="#FFFFFF" size="small" />
        <Text style={styles.loadingText}>Starting TaskLanka...</Text>
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
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...SHADOWS.lg
  },
  logoText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  logoHighlight: {
    color: COLORS.secondary
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600'
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center'
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '600'
  }
});

export default SplashScreen;
