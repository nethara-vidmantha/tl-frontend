import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { ArrowLeft, Globe, Bell } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';

const Header = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightComponent,
  showLangSwitcher = true,
  style
}) => {
  const { language, changeLanguage } = useLanguage();

  const cycleLanguage = () => {
    if (language === 'en') changeLanguage('si');
    else if (language === 'si') changeLanguage('ta');
    else changeLanguage('en');
  };

  const getLangLabel = () => {
    if (language === 'si') return 'සිං';
    if (language === 'ta') return 'தமி';
    return 'EN';
  };

  return (
    <View style={[styles.header, style]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.contentRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightActions}>
          {showLangSwitcher && (
            <TouchableOpacity
              style={styles.langButton}
              onPress={cycleLanguage}
              activeOpacity={0.8}
            >
              <Globe size={14} color="#FFFFFF" />
              <Text style={styles.langText}>{getLangLabel()}</Text>
            </TouchableOpacity>
          )}
          {rightComponent}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 45,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: SIZES.radiusLg,
    borderBottomRightRadius: SIZES.radiusLg,
    ...SHADOWS.md
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radiusFull,
    marginLeft: 8
  },
  langText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4
  }
});

export default Header;
