import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Star, MessageSquare, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { reviewApi } from '../../api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import StarRating from '../../components/common/StarRating';
import Header from '../../components/common/Header';

const ReviewScreen = ({ navigation, route }) => {
  const { booking } = route.params;
  const { t } = useLanguage();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const workerName = booking.workerId?.userId?.name || 'Service Professional';
  const workerAvatar = booking.workerId?.profileImage || booking.workerId?.userId?.profileImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80';

  const handleSubmitReview = async () => {
    try {
      setLoading(true);
      await reviewApi.createReview({
        workerId: booking.workerId?._id || booking.workerId,
        bookingId: booking._id,
        rating,
        comment
      });

      Alert.alert(
        'Thank You! 🌟',
        'Your rating and review has been submitted. It helps build a trusted service community in Sri Lanka.',
        [
          {
            text: 'Go to Home',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (err) {
      Alert.alert('Review Notice', err.message || 'Could not submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('review.title')}
        subtitle={booking.serviceType}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Worker Avatar & Info */}
        <View style={styles.workerHero}>
          <Image source={{ uri: workerAvatar }} style={styles.avatar} />
          <Text style={styles.workerName}>{workerName}</Text>
          <Text style={styles.serviceTitle}>{booking.serviceType}</Text>
          <Text style={styles.completedDurationText}>
            Completed in {booking.hoursWorked || 1} hour(s)
          </Text>
        </View>

        {/* Rating Card */}
        <View style={styles.ratingCard}>
          <Text style={styles.promptText}>{t('review.ratingPrompt')}</Text>

          <View style={styles.starSelectorBox}>
            <StarRating
              rating={rating}
              size={32}
              interactive={true}
              onRatingChange={(newRating) => setRating(newRating)}
              showScore={false}
            />
          </View>

          <Text style={styles.scoreWord}>
            {rating === 5 ? 'Exceptional! ★★★★★' : rating === 4 ? 'Very Good ★★★★☆' : rating === 3 ? 'Good ★★★☆☆' : rating === 2 ? 'Fair ★★☆☆☆' : 'Poor ★☆☆☆☆'}
          </Text>

          <Input
            label={t('review.feedbackPrompt')}
            placeholder="Tell us about the quality of work, punctuality, and professionalism..."
            value={comment}
            onChangeText={setComment}
            multiline={true}
            numberOfLines={4}
            style={{ marginTop: 14 }}
          />

          <Button
            title={t('review.submit')}
            variant="primary"
            size="lg"
            onPress={handleSubmitReview}
            loading={loading}
            style={{ marginTop: 10 }}
          />
        </View>
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
  workerHero: {
    alignItems: 'center',
    paddingVertical: 16
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    marginBottom: 10
  },
  workerName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2
  },
  completedDurationText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm
  },
  promptText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 14
  },
  starSelectorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10
  },
  scoreWord: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondaryDark,
    textAlign: 'center',
    marginBottom: 10
  }
});

export default ReviewScreen;
