import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const Badge = ({
  label,
  variant = 'success', // 'success', 'warning', 'danger', 'info', 'primary', 'secondary', 'neutral'
  size = 'md', // 'sm', 'md'
  icon,
  style
}) => {
  const getColors = () => {
    switch (variant) {
      case 'warning':
        return { bg: COLORS.warningLight, text: COLORS.secondaryDark, border: '#FDE68A' };
      case 'danger':
        return { bg: COLORS.dangerLight, text: COLORS.danger, border: '#FECACA' };
      case 'info':
        return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' };
      case 'primary':
        return { bg: COLORS.primaryLight, text: COLORS.primary, border: '#BEE3F8' };
      case 'secondary':
        return { bg: COLORS.secondaryLight, text: COLORS.secondaryDark, border: '#FDE68A' };
      case 'neutral':
        return { bg: '#F1F5F9', text: COLORS.textSecondary, border: '#E2E8F0' };
      case 'success':
      default:
        return { bg: COLORS.successLight, text: COLORS.success, border: '#A7F3D0' };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 8 : 10
        },
        style
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: size === 'sm' ? 11 : 12
          }
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  icon: {
    marginRight: 4
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2
  }
});

export default Badge;
