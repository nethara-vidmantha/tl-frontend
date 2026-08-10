import React, { useState } from 'react';
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
  MapPin,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Building
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { SRI_LANKA_DISTRICTS } from '../../constants/districts';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { bookingApi } from '../../api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';

const AVAILABLE_TIMES = [
  '08:30 AM', '10:00 AM', '11:30 AM',
  '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM'
];

const DURATION_OPTIONS = [1, 2, 3, 4, 5];

const BookServiceScreen = ({ navigation, route }) => {
  const { worker } = route.params;
  const { selectedLocation } = useLocation();
  const { t } = useLanguage();

  // Location fields (PickMe / Uber style flexible location)
  const [district, setDistrict] = useState(selectedLocation.district || worker.district || 'Colombo');
  const [address, setAddress] = useState(selectedLocation.address || 'Colombo, Sri Lanka');
  const [landmark, setLandmark] = useState('');

  // Booking fields
  const today = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(today);
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(2);

  const [loading, setLoading] = useState(false);

  const hourlyRate = worker.hourlyRate || worker.pricing?.hourlyRate || 1500;
  const estimatedTotal = hourlyRate * estimatedHours;

  const handleConfirmBooking = async () => {
    if (!address.trim()) {
      Alert.alert('Validation Error', 'Please enter the service street address.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please briefly describe the service required.');
      return;
    }

    try {
      setLoading(true);
      const bookingPayload = {
        workerId: worker._id,
        serviceType: worker.category ? `${worker.category.toUpperCase()} Service` : 'General Service',
        description,
        bookingDate,
        bookingTime,
        location: {
          address,
          district,
          landmark,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        },
        estimatedHours
      };

      const res = await bookingApi.createBooking(bookingPayload);
      if (res.data) {
        Alert.alert(
          'Booking Request Sent! 🎉',
          `Your service request has been sent to ${worker.userId?.name || worker.name}. You can track status and live hourly timers now.`,
          [
            {
              text: 'View Booking',
              onPress: () => navigation.replace('BookingDetail', { bookingId: res.data._id })
            }
          ]
        );
      }
    } catch (err) {
      Alert.alert('Booking Error', err.message || 'Could not place booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('booking.title')}
        subtitle={`Booking with ${worker.userId?.name || worker.name}`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Worker Summary Card */}
        <View style={styles.workerSummaryCard}>
          <Image
            source={{ uri: worker.profileImage || worker.userId?.profileImage }}
            style={styles.avatar}
          />
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{worker.userId?.name || worker.name}</Text>
            <Text style={styles.workerCategory}>
              {(worker.category || '').toUpperCase()} PROFESSIONAL
            </Text>
            <Text style={styles.rateHighlight}>
              LKR {hourlyRate} / hour (Labor)
            </Text>
          </View>
        </View>

        {/* Section 1: Service Location (PickMe/Uber style) */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <MapPin size={18} color={COLORS.primary} />
            <Text style={styles.cardSectionTitle}>{t('booking.serviceLocation')}</Text>
          </View>

          {/* District Scroll */}
          <Text style={styles.subLabel}>Target District (Sri Lanka)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.districtScroll}>
            {SRI_LANKA_DISTRICTS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.districtPill, district === d && styles.selectedDistrictPill]}
                onPress={() => setDistrict(d)}
              >
                <Text style={[styles.districtPillText, district === d && styles.selectedDistrictPillText]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Street Address / House No."
            placeholder={t('booking.serviceAddressHint')}
            value={address}
            onChangeText={setAddress}
            style={{ marginTop: 8 }}
          />

          <Input
            label="Nearest Landmark (Optional)"
            placeholder="e.g. Opposite Matara Hospital / Near Bus Stand"
            value={landmark}
            onChangeText={setLandmark}
          />
        </View>

        {/* Section 2: Date & Time */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <Calendar size={18} color={COLORS.primary} />
            <Text style={styles.cardSectionTitle}>Schedule Date & Time</Text>
          </View>

          <Input
            label={t('booking.selectDate')}
            placeholder="YYYY-MM-DD (e.g. 2026-08-10)"
            value={bookingDate}
            onChangeText={setBookingDate}
          />

          <Text style={styles.subLabel}>{t('booking.selectTime')}</Text>
          <View style={styles.timeGrid}>
            {AVAILABLE_TIMES.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeChip, bookingTime === time && styles.selectedTimeChip]}
                onPress={() => setBookingTime(time)}
              >
                <Clock size={12} color={bookingTime === time ? '#FFFFFF' : COLORS.textSecondary} />
                <Text style={[styles.timeChipText, bookingTime === time && styles.selectedTimeChipText]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 3: Job Description & Estimated Duration */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <FileText size={18} color={COLORS.primary} />
            <Text style={styles.cardSectionTitle}>Job Requirements</Text>
          </View>

          <Input
            label={t('booking.description')}
            placeholder={t('booking.descriptionHint')}
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={3}
          />

          <Text style={styles.subLabel}>{t('booking.estimatedHours')}</Text>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((hrs) => (
              <TouchableOpacity
                key={hrs}
                style={[styles.durationPill, estimatedHours === hrs && styles.selectedDurationPill]}
                onPress={() => setEstimatedHours(hrs)}
              >
                <Text style={[styles.durationText, estimatedHours === hrs && styles.selectedDurationText]}>
                  {hrs} hr{hrs > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rate Breakdown Calculation Card */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>{t('booking.rateSummary')}</Text>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Worker Hourly Rate</Text>
            <Text style={styles.calcVal}>LKR {hourlyRate}/hr</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Estimated Hours</Text>
            <Text style={styles.calcVal}>× {estimatedHours} hr(s)</Text>
          </View>

          <View style={styles.calcDivider} />

          <View style={styles.calcRow}>
            <Text style={styles.totalLabel}>{t('booking.totalEstimate')}</Text>
            <Text style={styles.totalVal}>LKR {estimatedTotal}</Text>
          </View>
          <Text style={styles.calcFootnote}>
            * Final bill will be based on the actual start/stop service timer when the professional arrives.
          </Text>
        </View>

        {/* Confirm Button */}
        <Button
          title={t('booking.confirmBtn')}
          variant="primary"
          size="lg"
          onPress={handleConfirmBooking}
          loading={loading}
          style={{ marginTop: 10, marginBottom: 30 }}
        />
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
  workerSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
    ...SHADOWS.sm
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  workerInfo: {
    flex: 1
  },
  workerName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  workerCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1
  },
  rateHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondaryDark,
    marginTop: 3
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
    ...SHADOWS.sm
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginLeft: 8
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8
  },
  districtScroll: {
    flexDirection: 'row',
    marginBottom: 12
  },
  districtPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8
  },
  selectedDistrictPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  districtPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  selectedDistrictPillText: {
    color: '#FFFFFF'
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: SIZES.radiusSm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  selectedTimeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 4
  },
  selectedTimeChipText: {
    color: '#FFFFFF'
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4
  },
  durationPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: SIZES.radiusSm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedDurationPill: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondaryDark
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  selectedDurationText: {
    color: '#FFFFFF'
  },
  breakdownCard: {
    backgroundColor: COLORS.primaryLight,
    padding: 16,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginBottom: 16
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  calcLabel: {
    fontSize: 13,
    color: COLORS.textSecondary
  },
  calcVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  calcDivider: {
    height: 1,
    backgroundColor: '#93C5FD',
    marginVertical: 8
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary
  },
  calcFootnote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 15
  }
});

export default BookServiceScreen;
