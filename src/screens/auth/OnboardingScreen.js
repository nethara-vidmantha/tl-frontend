import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { MapPin, Clock, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Find Trusted Nearby Pros',
    titleSi: 'ඔබ අසල සිටින වෘත්තිකයන් සොයාගන්න',
    desc: 'Discover verified plumbers, electricians, tutors, doctors, and caregivers with instant GPS or district search.',
    icon: <MapPin size={48} color={COLORS.primary} />
  },
  {
    id: 2,
    title: 'Transparent Hourly Rates',
    titleSi: 'පැයක ශ්‍රම ගාස්තුව පමණක් ගෙවන්න',
    desc: 'Workers set their hourly rate. Track live service duration with start/stop timers — pay only for actual work done.',
    icon: <Clock size={48} color={COLORS.secondary} />
  },
  {
    id: 3,
    title: 'Easy Bookings & Safe Payments',
    titleSi: 'පහසු වෙන්කිරීම් සහ ආරක්ෂිත ගෙවීම්',
    desc: 'Assign workers anywhere in Sri Lanka (PickMe style), pay via Cash or LankaQR, and leave authentic ratings.',
    icon: <ShieldCheck size={48} color={COLORS.success} />
  }
];

const OnboardingScreen = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Task<Text style={{ color: COLORS.secondary }}>ලංකා</Text></Text>
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slideContent}>
        <View style={styles.iconCircle}>
          {slide.icon}
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>

        {/* Indicators */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentSlide && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          variant="primary"
          size="lg"
          onPress={handleNext}
          icon={<ArrowRight size={18} color="#FFFFFF" />}
          iconPosition="right"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 32
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    ...SHADOWS.md
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12
  },
  desc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36
  }
});

export default OnboardingScreen;
