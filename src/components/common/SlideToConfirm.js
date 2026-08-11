import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform
} from 'react-native';
import { ChevronRight, CheckCircle2, DollarSign } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const SLIDER_HEIGHT = 56;
const THUMB_SIZE = 48;
const PADDING = 4;

const SlideToConfirm = ({
  onConfirm,
  title = 'Slide to Confirm Payment',
  confirmedTitle = 'Payment Confirmed! ✓',
  disabled = false,
  style
}) => {
  const [containerWidth, setContainerWidth] = useState(300);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const pan = useRef(new Animated.Value(0)).current;

  const maxSlide = Math.max(0, containerWidth - THUMB_SIZE - PADDING * 2);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !isConfirmed,
      onMoveShouldSetPanResponder: () => !disabled && !isConfirmed,
      onPanResponderMove: (evt, gestureState) => {
        if (disabled || isConfirmed) return;
        const newX = Math.min(Math.max(0, gestureState.dx), maxSlide);
        pan.setValue(newX);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (disabled || isConfirmed) return;
        if (gestureState.dx >= maxSlide * 0.8) {
          // Slide successful!
          Animated.timing(pan, {
            toValue: maxSlide,
            duration: 150,
            useNativeDriver: false
          }).start(() => {
            setIsConfirmed(true);
            if (onConfirm) {
              onConfirm();
            }
          });
        } else {
          // Reset to start
          Animated.spring(pan, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  // Track progress (0 to 1) for text opacity / background transition
  const textOpacity = pan.interpolate({
    inputRange: [0, maxSlide * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const trackBgColor = isConfirmed
    ? '#10B981'
    : pan.interpolate({
        inputRange: [0, maxSlide],
        outputRange: [COLORS.primary, '#059669'],
        extrapolate: 'clamp'
      });

  return (
    <View
      style={[styles.container, style]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackBgColor }]}>
        {/* Placeholder Label */}
        <Animated.View style={[styles.labelContainer, { opacity: textOpacity }]}>
          <Text style={styles.labelText}>{title}</Text>
        </Animated.View>

        {isConfirmed && (
          <View style={styles.confirmedContainer}>
            <CheckCircle2 size={20} color="#FFFFFF" />
            <Text style={styles.confirmedText}>{confirmedTitle}</Text>
          </View>
        )}

        {/* Draggable Thumb */}
        {!isConfirmed && (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.thumb,
              {
                transform: [{ translateX: pan }]
              }
            ]}
          >
            <ChevronRight size={26} color={COLORS.primary} />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: SLIDER_HEIGHT,
    marginVertical: 10
  },
  track: {
    flex: 1,
    borderRadius: SIZES.radiusFull,
    justifyContent: 'center',
    padding: PADDING,
    overflow: 'hidden',
    ...SHADOWS.md
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 36
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  confirmedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  confirmedText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md
  }
});

export default SlideToConfirm;
