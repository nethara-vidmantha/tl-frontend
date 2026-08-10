import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: COLORS.secondary,
          border: 'transparent',
          text: '#FFFFFF'
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: COLORS.primary,
          text: COLORS.primary
        };
      case 'danger':
        return {
          bg: COLORS.danger,
          border: 'transparent',
          text: '#FFFFFF'
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: COLORS.primary
        };
      case 'primary':
      default:
        return {
          bg: COLORS.primary,
          border: 'transparent',
          text: '#FFFFFF'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24, fontSize: 16 };
      case 'md':
      default:
        return { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15 };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: vStyles.bg,
          borderColor: vStyles.border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical: sStyles.paddingVertical,
          paddingHorizontal: sStyles.paddingHorizontal,
          opacity: disabled ? 0.6 : 1
        },
        variant === 'primary' || variant === 'secondary' ? SHADOWS.sm : null,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { color: vStyles.text, fontSize: sStyles.fontSize },
              textStyle
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3
  },
  iconLeft: {
    marginRight: 8
  },
  iconRight: {
    marginLeft: 8
  }
});

export default Button;
