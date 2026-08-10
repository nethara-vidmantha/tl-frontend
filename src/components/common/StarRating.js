import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

const StarRating = ({
  rating = 5,
  count,
  size = 14,
  interactive = false,
  onRatingChange,
  showScore = true,
  style
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsRow}>
        {stars.map((s) => {
          const filled = s <= Math.round(rating);
          const StarIcon = (
            <Star
              key={s}
              size={size}
              color={filled ? COLORS.secondary : '#CBD5E1'}
              fill={filled ? COLORS.secondary : 'none'}
              style={styles.star}
            />
          );

          if (interactive) {
            return (
              <TouchableOpacity
                key={s}
                onPress={() => onRatingChange && onRatingChange(s)}
                activeOpacity={0.7}
                style={styles.touchStar}
              >
                {StarIcon}
              </TouchableOpacity>
            );
          }

          return StarIcon;
        })}
      </View>
      {showScore && (
        <Text style={[styles.scoreText, { fontSize: size + 1 }]}>
          {Number(rating).toFixed(1)}
        </Text>
      )}
      {count !== undefined && (
        <Text style={styles.countText}>({count})</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  star: {
    marginRight: 2
  },
  touchStar: {
    padding: 4
  },
  scoreText: {
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 6
  },
  countText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4
  }
});

export default StarRating;
