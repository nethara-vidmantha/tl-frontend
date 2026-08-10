import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export const LoadingSpinner = ({ message = 'Loading...', size = 'large' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
};

export const EmptyState = ({
  icon,
  title = 'No items found',
  subtitle = 'Try adjusting your filters or search location.',
  actionButton
}) => {
  return (
    <View style={styles.emptyContainer}>
      {icon && <View style={styles.iconBox}>{icon}</View>}
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
      {actionButton && <View style={styles.actionBox}>{actionButton}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500'
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconBox: {
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260
  },
  actionBox: {
    marginTop: 16
  }
});
