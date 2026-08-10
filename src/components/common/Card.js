import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';

export const Card = ({ children, style, onPress, activeOpacity = 0.8, elevated = true }) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={activeOpacity}
      onPress={onPress}
      style={[
        styles.card,
        elevated ? SHADOWS.sm : null,
        style
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 12
  }
});
