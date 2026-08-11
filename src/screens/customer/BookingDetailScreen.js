import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  Star,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Compass,
  Route
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { bookingApi } from '../../api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import { openTurnByTurnDirections } from '../../utils/navigationHelper';

const BookingDetailScreen = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const { t } = useLanguage();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
    // Auto polling every 5s for live updates
    const interval = setInterval(fetchBooking, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await bookingApi.getBookingById(bookingId);
      if (res.data) {
        setBooking(res.data);
      }
    } catch (err) {
      console.warn('Booking fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingApi.cancelBooking(bookingId, 'Cancelled by customer');
              fetchBooking();
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  const handleOpenDirections = () => {
    if (!booking) return;
    const lat = booking.location?.latitude || 6.9271;
    const lng = booking.location?.longitude || 79.8612;
    openTurnByTurnDirections(lat, lng, booking.location?.address || 'Service Location');
  };

  if (loading || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading booking status..." />
      </SafeAreaView>
    );
  }

  const workerName = booking.workerId?.userId?.name || 'Assigned Professional';
  const workerAvatar = booking.workerId?.profileImage || booking.workerId?.userId?.profileImage;
  const workerPhone = booking.workerId?.userId?.phone || '0771234567';
  const status = booking.status;
  const paymentStatus = booking.paymentStatus;
  const hourlyRate = booking.hourlyRate || 1500;
  const hoursWorked = booking.hoursWorked || 1;
  const totalAmount = booking.amount;

  const getStatusStepIndex = () => {
    switch (status) {
      case 'Pending': return 1;
      case 'Accepted': return 2;
      case 'In Progress': return 3;
      case 'Completed': return 4;
      default: return 0;
    }
  };

  const stepIndex = getStatusStepIndex();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('detail.title')}
        subtitle={`Ref #${booking._id.slice(-6).toUpperCase()}`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Visual Lifecycle Stepper */}
        <View style={styles.trackerCard}>
          <Text style={styles.trackerTitle}>{t('detail.tracker')}</Text>

          <View style={styles.stepperContainer}>
            {/* Step 1: Requested */}
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, stepIndex >= 1 && styles.stepActive]}>
                <CheckCircle2 size={16} color={stepIndex >= 1 ? '#FFFFFF' : COLORS.textMuted} />
              </View>
              <Text style={styles.stepLabel}>Requested</Text>
            </View>

            <View style={[styles.stepLine, stepIndex >= 2 && styles.lineActive]} />

            {/* Step 2: Accepted */}
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, stepIndex >= 2 && styles.stepActive]}>
                <CheckCircle2 size={16} color={stepIndex >= 2 ? '#FFFFFF' : COLORS.textMuted} />
              </View>
              <Text style={styles.stepLabel}>Accepted</Text>
            </View>

            <View style={[styles.stepLine, stepIndex >= 3 && styles.lineActive]} />

            {/* Step 3: In Progress */}
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, stepIndex >= 3 && styles.stepActive]}>
                <Clock size={16} color={stepIndex >= 3 ? '#FFFFFF' : COLORS.textMuted} />
              </View>
              <Text style={styles.stepLabel}>In Progress</Text>
            </View>

            <View style={[styles.stepLine, stepIndex >= 4 && styles.lineActive]} />

            {/* Step 4: Completed */}
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, stepIndex >= 4 && styles.stepSuccess]}>
                <CheckCircle2 size={16} color={stepIndex >= 4 ? '#FFFFFF' : COLORS.textMuted} />
              </View>
              <Text style={styles.stepLabel}>Completed</Text>
            </View>
          </View>

          {/* Live Timer Callout when In Progress */}
          {status === 'In Progress' && (
            <View style={styles.inProgressAlert}>
              <Clock size={20} color={COLORS.secondaryDark} />
              <View style={styles.inProgressTextCol}>
                <Text style={styles.inProgressHeading}>Worker is on-site working</Text>
                <Text style={styles.inProgressSub}>
                  Service timer started at {new Date(booking.serviceStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                </Text>
              </View>
            </View>
          )}

          {status === 'Cancelled' && (
            <View style={styles.cancelledAlert}>
              <AlertCircle size={20} color={COLORS.danger} />
              <Text style={styles.cancelledText}>
                This booking was cancelled. Reason: {booking.cancellationReason || 'Cancelled'}
              </Text>
            </View>
          )}
        </View>

        {/* Worker Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Assigned Professional</Text>
          <View style={styles.workerRow}>
            <Image source={{ uri: workerAvatar }} style={styles.workerAvatar} />
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{workerName}</Text>
              <Text style={styles.workerCategory}>{booking.serviceType}</Text>
              <Text style={styles.workerRate}>LKR {hourlyRate} / hr</Text>
            </View>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${workerPhone}`)}
            >
              <Phone size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location & Time Card with Turn-by-Turn GPS Button */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Service Location & Details</Text>

          <View style={styles.infoLine}>
            <MapPin size={16} color={COLORS.primary} />
            <View style={styles.infoLineTextCol}>
              <Text style={styles.infoLineTitle}>{booking.location?.district} District</Text>
              <Text style={styles.infoLineSub}>{booking.location?.address}</Text>
              {booking.location?.landmark ? (
                <Text style={styles.landmarkText}>Landmark: {booking.location.landmark}</Text>
              ) : null}
            </View>
          </View>

          {/* Turn-by-Turn GPS Directions Button */}
          <TouchableOpacity
            style={styles.directionsBtn}
            onPress={handleOpenDirections}
            activeOpacity={0.85}
          >
            <Compass size={16} color={COLORS.primary} />
            <Text style={styles.directionsBtnText}>
              🧭 Open in Google Maps (Turn-by-Turn Driving Navigation)
            </Text>
          </TouchableOpacity>

          <View style={[styles.infoLine, { marginTop: 12 }]}>
            <Calendar size={16} color={COLORS.primary} />
            <Text style={styles.infoLineTitle}>
              {booking.bookingDate} at {booking.bookingTime}
            </Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.descLabel}>Requirement:</Text>
            <Text style={styles.descText}>{booking.description}</Text>
          </View>
        </View>

        {/* Invoice & Payment Breakdown */}
        <View style={styles.invoiceCard}>
          <View style={styles.invoiceHeaderRow}>
            <Text style={styles.invoiceTitle}>Invoice Breakdown</Text>
            <Badge
              label={paymentStatus === 'Completed' ? 'Paid' : 'Payment Pending'}
              variant={paymentStatus === 'Completed' ? 'success' : 'warning'}
            />
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Hourly Rate</Text>
            <Text style={styles.billVal}>LKR {hourlyRate}/hr</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Duration Billed</Text>
            <Text style={styles.billVal}>{hoursWorked} hour(s)</Text>
          </View>

          <View style={styles.billDivider} />

          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>Total Amount</Text>
            <Text style={styles.billTotalVal}>LKR {totalAmount}</Text>
          </View>
        </View>

        {/* Dynamic Action Buttons based on Status */}
        {status === 'Completed' && paymentStatus === 'Pending' && (
          <Button
            title="Proceed to Payment (Cash / Card / QR)"
            variant="primary"
            size="lg"
            icon={<CreditCard size={18} color="#FFFFFF" />}
            onPress={() => navigation.navigate('Payment', { booking })}
            style={{ marginBottom: 12 }}
          />
        )}

        {status === 'Completed' && paymentStatus === 'Completed' && (
          <Button
            title="Leave Rating & Review ★"
            variant="secondary"
            size="lg"
            icon={<Star size={18} color="#FFFFFF" />}
            onPress={() => navigation.navigate('Review', { booking })}
            style={{ marginBottom: 12 }}
          />
        )}

        {(status === 'Pending' || status === 'Accepted') && (
          <Button
            title={t('detail.cancelBooking')}
            variant="danger"
            size="md"
            onPress={handleCancelBooking}
            style={{ marginBottom: 12 }}
          />
        )}
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
  trackerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
    ...SHADOWS.sm
  },
  trackerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8
  },
  stepItem: {
    alignItems: 'center'
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  stepActive: {
    backgroundColor: COLORS.primary
  },
  stepSuccess: {
    backgroundColor: COLORS.success
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 18
  },
  lineActive: {
    backgroundColor: COLORS.primary
  },
  inProgressAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    padding: 12,
    borderRadius: SIZES.radiusMd,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  inProgressTextCol: {
    marginLeft: 10,
    flex: 1
  },
  inProgressHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondaryDark
  },
  inProgressSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  cancelledAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: 12,
    borderRadius: SIZES.radiusMd,
    marginTop: 14
  },
  cancelledText: {
    fontSize: 12,
    color: COLORS.danger,
    marginLeft: 8,
    flex: 1
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
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  workerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary
  },
  workerInfo: {
    flex: 1
  },
  workerName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  workerCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 1
  },
  workerRate: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryDark,
    marginTop: 2
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  infoLineTextCol: {
    marginLeft: 10,
    flex: 1
  },
  infoLineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  infoLineSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  landmarkText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 6,
    marginBottom: 6
  },
  directionsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 6
  },
  descLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginRight: 6
  },
  descText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    flex: 1
  },
  invoiceCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radiusLg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginBottom: 16
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  billLabel: {
    fontSize: 13,
    color: COLORS.textSecondary
  },
  billVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  billDivider: {
    height: 1,
    backgroundColor: '#93C5FD',
    marginVertical: 8
  },
  billTotalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary
  },
  billTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary
  }
});

export default BookingDetailScreen;
