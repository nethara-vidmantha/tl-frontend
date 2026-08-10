import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Phone,
  ArrowLeft,
  Calendar,
  MessageSquare
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { workerApi } from '../../api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import StarRating from '../../components/common/StarRating';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';

const WorkerProfileScreen = ({ navigation, route }) => {
  const { workerId } = route.params;
  const { selectedLocation } = useLocation();
  const { t } = useLanguage();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerDetails();
  }, [workerId]);

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      const res = await workerApi.getWorkerById(workerId, {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude
      });
      if (res.data) {
        setWorker(res.data);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not load worker profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !worker) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading worker profile..." />
      </SafeAreaView>
    );
  }

  const name = worker.userId?.name || worker.name || 'Service Professional';
  const profileImage = worker.profileImage || worker.userId?.profileImage;
  const category = (worker.category || '').toUpperCase();
  const hourlyRate = worker.hourlyRate || worker.pricing?.hourlyRate || 1500;
  const isAvailable = worker.availability !== false;
  const reviews = worker.reviewsList || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{name}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.heroCard}>
          <Image source={{ uri: profileImage }} style={styles.avatar} />

          <View style={styles.heroNameRow}>
            <Text style={styles.heroName}>{name}</Text>
            {worker.verified && (
              <ShieldCheck size={20} color={COLORS.primary} style={{ marginLeft: 4 }} />
            )}
          </View>

          <Text style={styles.heroCategory}>{category} SPECIALIST</Text>

          <View style={styles.badgeRow}>
            <Badge
              label={worker.verified ? 'Verified Professional' : 'Identity Verified'}
              variant={worker.verified ? 'primary' : 'neutral'}
            />
            <Badge
              label={isAvailable ? 'Available Now' : 'Currently Unavailable'}
              variant={isAvailable ? 'success' : 'danger'}
              style={{ marginLeft: 8 }}
            />
          </View>

          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <StarRating rating={worker.rating || 5.0} size={16} showScore={true} />
              <Text style={styles.statSubText}>{worker.totalReviews || 0} reviews</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{worker.experience || 5}+ Years</Text>
              <Text style={styles.statSubText}>Experience</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {worker.distance !== undefined && worker.distance !== null ? `${worker.distance} km` : worker.district}
              </Text>
              <Text style={styles.statSubText}>Proximity</Text>
            </View>
          </View>
        </View>

        {/* Pricing Card */}
        <View style={styles.sectionCard}>
          <View style={styles.pricingCardRow}>
            <View>
              <Text style={styles.priceSectionLabel}>{t('workerProfile.baseRate')}</Text>
              <Text style={styles.priceSectionAmount}>LKR {hourlyRate}</Text>
              <Text style={styles.priceSectionSub}>Transparent hourly calculation via timer</Text>
            </View>

            <View style={styles.priceBadgeIcon}>
              <DollarSign size={24} color={COLORS.primary} />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>{t('workerProfile.about')}</Text>
          <Text style={styles.bodyText}>
            {worker.description || 'Dedicated service professional committed to top quality craft and reliability across Sri Lanka.'}
          </Text>

          <View style={styles.infoRow}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.infoRowText}>
              Based in <Text style={{ fontWeight: '700' }}>{worker.district}</Text> ({worker.address})
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Clock size={16} color={COLORS.primary} />
            <Text style={styles.infoRowText}>
              Working Hours: {worker.workingHours?.start || '8:00 AM'} - {worker.workingHours?.end || '6:00 PM'} (Mon-Sat)
            </Text>
          </View>
        </View>

        {/* Skills Section */}
        {worker.skills && worker.skills.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>{t('workerProfile.skills')}</Text>
            <View style={styles.skillsContainer}>
              {worker.skills.map((skill, index) => (
                <View key={index} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>✓ {skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.sectionCard}>
          <View style={styles.reviewsHeadingRow}>
            <Text style={styles.sectionHeading}>{t('workerProfile.ratingsReviews')}</Text>
            <Text style={styles.reviewsCountText}>({reviews.length})</Text>
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>No reviews yet for this professional.</Text>
          ) : (
            reviews.map((rev) => (
              <View key={rev._id} style={styles.reviewItem}>
                <View style={styles.revHeader}>
                  <Text style={styles.revAuthor}>{rev.customerId?.name || 'Customer'}</Text>
                  <StarRating rating={rev.rating} size={12} showScore={false} />
                </View>
                {rev.comment ? <Text style={styles.revComment}>{rev.comment}</Text> : null}
                <Text style={styles.revDate}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceBox}>
          <Text style={styles.bottomPriceSub}>Hourly Rate</Text>
          <Text style={styles.bottomPriceValue}>LKR {hourlyRate}/hr</Text>
        </View>

        <Button
          title={isAvailable ? t('workerProfile.bookCta') : t('common.offline')}
          variant={isAvailable ? 'primary' : 'outline'}
          size="lg"
          disabled={!isAvailable}
          style={{ flex: 1.5 }}
          onPress={() => navigation.navigate('BookService', { worker })}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
    marginBottom: 14
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: 12
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  heroName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  heroCategory: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
    letterSpacing: 0.5
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  statSubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.divider
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
    ...SHADOWS.sm
  },
  pricingCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  priceSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase'
  },
  priceSectionAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2
  },
  priceSectionSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  priceBadgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10
  },
  bodyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  infoRowText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  skillPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusSm
  },
  skillPillText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  reviewsHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  reviewsCountText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 4,
    fontWeight: '700'
  },
  noReviewsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic'
  },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  revHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  revAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  revComment: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16
  },
  revDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    ...SHADOWS.lg
  },
  bottomPriceBox: {
    flex: 1,
    marginRight: 14
  },
  bottomPriceSub: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  bottomPriceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary
  }
});

export default WorkerProfileScreen;
