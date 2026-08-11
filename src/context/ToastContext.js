import { SafeAreaView } from 'react-native-safe-area-context';
import React, { createContext, useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform
} from 'react-native';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toastData, setToastData] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setToastData(null);
    });
  };

  const showToast = (message, type = 'info', duration = 3500) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToastData({ message, type });

    translateY.setValue(-80);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: Platform.OS === 'ios' ? 10 : 20,
        useNativeDriver: true,
        bounciness: 6
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true
      })
    ]).start();

    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration || 4500),
    info: (msg, duration) => showToast(msg, 'info', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    hide: hideToast
  };

  const getIcon = () => {
    switch (toastData?.type) {
      case 'success':
        return <CheckCircle2 size={20} color="#10B981" />;
      case 'error':
        return <AlertCircle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#F59E0B" />;
      default:
        return <Info size={20} color={COLORS.primary} />;
    }
  };

  const getBorderColor = () => {
    switch (toastData?.type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return COLORS.primary;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toastData && (
        <View pointerEvents="box-none" style={styles.toastContainer}>
          <Animated.View
            style={[
              styles.toastBox,
              {
                borderLeftColor: getBorderColor(),
                transform: [{ translateY }],
                opacity
              }
            ]}
          >
            <View style={styles.iconContainer}>{getIcon()}</View>
            <Text style={styles.toastMessage} numberOfLines={3}>
              {toastData.message}
            </Text>
            <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    alignItems: 'center'
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusMd,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.lg,
    elevation: 10
  },
  iconContainer: {
    marginRight: 12
  },
  toastMessage: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 18
  },
  closeButton: {
    marginLeft: 8,
    padding: 4
  }
});
