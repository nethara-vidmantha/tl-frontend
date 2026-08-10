import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';

const CategoryScreen = ({ navigation }) => {
  const { t, language } = useLanguage();

  const getLocalizedName = (cat) => {
    if (language === 'si' && cat.nameSi) return cat.nameSi;
    if (language === 'ta' && cat.nameTa) return cat.nameTa;
    return cat.name;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('home.categories')}
        subtitle="All Daily Needs & Professional Services"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryRow}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Home', { selectedCategory: cat.id })}
          >
            <View style={[styles.iconCircle, { backgroundColor: cat.bgColor || '#E0F2FE' }]}>
              <Text style={styles.iconEmoji}>⚡</Text>
            </View>

            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>{getLocalizedName(cat)}</Text>
              <Text style={styles.categoryDesc}>{cat.description}</Text>
            </View>

            <ChevronRight size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    ...SHADOWS.sm
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  iconEmoji: {
    fontSize: 20
  },
  categoryInfo: {
    flex: 1
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  categoryDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  }
});

export default CategoryScreen;
