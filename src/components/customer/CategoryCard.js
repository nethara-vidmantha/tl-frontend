import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wrench, Zap, Activity, BookOpen, Heart, Hammer, Feather, Home, Grid } from 'lucide-react-native';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';

const getCategoryIcon = (iconName, color, size = 22) => {
  switch (iconName) {
    case 'wrench': return <Wrench size={size} color={color} />;
    case 'zap': return <Zap size={size} color={color} />;
    case 'activity': return <Activity size={size} color={color} />;
    case 'book-open': return <BookOpen size={size} color={color} />;
    case 'heart': return <Heart size={size} color={color} />;
    case 'hammer': return <Hammer size={size} color={color} />;
    case 'feather': return <Feather size={size} color={color} />;
    case 'home': return <Home size={size} color={color} />;
    case 'grid':
    default:
      return <Grid size={size} color={color} />;
  }
};

const CategoryCard = ({ category, onPress, isSelected = false }) => {
  const { language } = useLanguage();

  const getLocalizedName = () => {
    if (language === 'si' && category.nameSi) return category.nameSi;
    if (language === 'ta' && category.nameTa) return category.nameTa;
    return category.name;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isSelected && styles.selectedCard
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: category.bgColor || '#E0F2FE' }]}>
        {getCategoryIcon(category.icon, category.color || COLORS.primary)}
      </View>
      <Text style={[styles.nameText, isSelected && styles.selectedNameText]} numberOfLines={2}>
        {getLocalizedName()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 95,
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusMd,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  nameText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center'
  },
  selectedNameText: {
    color: COLORS.primary
  }
});

export default CategoryCard;
