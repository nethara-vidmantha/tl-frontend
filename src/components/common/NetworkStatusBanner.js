import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { API_BASE_URL } from '../../api';

const NetworkStatusBanner = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkConnectivity = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const healthUrl = API_BASE_URL ? `${API_BASE_URL}/health` : 'https://web-production-d082ad.up.railway.app/api/health';
        const res = await fetch(healthUrl, {
          signal: controller.signal,
          method: 'GET'
        });
        clearTimeout(timeoutId);

        if (isMounted) {
          setIsOffline(!res.ok);
        }
      } catch (err) {
        if (isMounted) {
          setIsOffline(true);
        }
      }
    };

    // Check immediately and every 10 seconds
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <WifiOff size={16} color="#FFFFFF" />
      <Text style={styles.bannerText}>
        No Internet Connection • Please turn on Mobile Data or Wi-Fi
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 99998
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8
  }
});

export default NetworkStatusBanner;
