import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Image,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import {
  Power,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Square,
  MapPin,
  Calendar,
  AlertCircle,
  Compass,
  X,
  Calculator
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { workerApi, bookingApi } from '../../api';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';
import { openTurnByTurnDirections } from '../../utils/navigationHelper';
import WorkerPaymentCollectionModal from '../../components/common/WorkerPaymentCollectionModal';

const WorkerDashboardScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [workerProfile, setWorkerProfile] = useState(user?.workerProfile || null);
  const [isOnline, setIsOnline] = useState(user?.workerProfile?.availability !== false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Complete Service Modal State
  const [selectedBookingForCompletion, setSelectedBookingForCompletion] = useState(null);
  const [completionHours, setCompletionHours] = useState('1.0');
  const [completingLoading, setCompletingLoading] = useState(false);

  // Payment Collection Modal State (Live QR & SlideToConfirm)
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);

  useEffect(() => {
    fetchWorkerData();
    const interval = setInterval(fetchWorkerData, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      const bookingsRes = await bookingApi.getWorkerBookings();
      if (bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
    } catch (err) {
      console.warn('Worker dashboard notice:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleAvailability = async (newValue) => {
    try {
      setIsOnline(newValue);
      await workerApi.toggleAvailability(newValue);
      refreshUser();
    } catch (err) {
      Alert.alert('Error', err.message);
      setIsOnline(!newValue);
    }
  };

  const handleRespond = async (bookingId, action) => {
    try {
      await bookingApi.respondToBooking(bookingId, action);
      Alert.alert('Success', `Booking request ${action}ed.`);
      fetchWorkerData();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleStartService = async (bookingId) => {
    try {
      await bookingApi.startService(bookingId);
      Alert.alert('Service Started! ⏱️', 'Hourly timer is now running. Tap "Stop Service" once work is completed to calculate the total bill.');
      fetchWorkerData();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const openCompletionModal = (booking) => {
    // Calculate elapsed hours if serviceStartTime exists
    let calculatedHours = 1.0;
    if (booking.serviceStartTime) {
      const diffMs = new Date() - new Date(booking.serviceStartTime);
      const h = diffMs / (1000 * 60 * 60);
      calculatedHours = Math.max(1.0, Math.round(h * 10) / 10);
    }
    setCompletionHours(String(calculatedHours));
    setSelectedBookingForCompletion(booking);
  };

  const handleConfirmCompletion = async () => {
    if (!selectedBookingForCompletion) return;
    try {
      setCompletingLoading(true);
      const hoursNum = parseFloat(completionHours) || 1.0;
      const res = await bookingApi.completeService(selectedBookingForCompletion._id, hoursNum);
      const updatedBooking = res?.data || {
        ...selectedBookingForCompletion,
        hoursWorked: hoursNum,
        amount: Math.round(hoursNum * (selectedBookingForCompletion.hourlyRate || 1500))
      };
      setSelectedBookingForCompletion(null);
      fetchWorkerData();
      // Automatically open payment collection modal for the worker to show QR or collect cash
      setSelectedBookingForPayment(updatedBooking);
    } catch (err) {
      Alert.alert('Completion Error', err.message);
    } finally {
      setCompletingLoading(false);
    }
  };

  const handleGetDirections = (booking) => {
    const lat = booking.location?.latitude || 6.9271;
    const lng = booking.location?.longitude || 79.8612;
    openTurnByTurnDirections(lat, lng, booking.customerId?.name || 'Customer');
  };

  const pendingBookings = bookings.filter((b) => b.status === 'Pending');
  const activeBookings = bookings.filter((b) => ['Accepted', 'In Progress'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'Completed');

  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('worker.dashboard')}
        subtitle={user?.name || 'Service Pro'}
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchWorkerData} colors={[COLORS.primary]} />}
      >
        {/* Availability Online/Offline Master Toggle Card */}
        <View style={[styles.availabilityCard, isOnline ? styles.cardOnline : styles.cardOffline]}>
          <View style={styles.availTextCol}>
            <View style={styles.statusDotRow}>
              <View style={[styles.pulseDot, { backgroundColor: isOnline ? COLORS.success : COLORS.danger }]} />
              <Text style={styles.availHeading}>
                {isOnline ? 'You are ONLINE' : 'You are OFFLINE'}
              </Text>
            </View>
            <Text style={styles.availSub}>
              {isOnline
                ? 'Visible to nearby customers on Map with live rates.'
                : 'Offline. You will not receive new booking requests.'}
            </Text>
          </View>

          <Switch
            value={isOnline}
            onValueChange={toggleAvailability}
            trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
            thumbColor={isOnline ? COLORS.success : '#94A3B8'}
          />
        </View>

        {/* Stats Metrics Cards */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <DollarSign size={20} color={COLORS.success} />
            <Text style={styles.metricValue}>LKR {totalEarnings}</Text>
            <Text style={styles.metricLabel}>{t('worker.myEarnings')}</Text>
          </View>

          <View style={styles.metricCard}>
            <Star size={20} color={COLORS.secondary} />
            <Text style={styles.metricValue}>
              {Number(user?.workerProfile?.rating || 5.0).toFixed(1)} ★
            </Text>
            <Text style={styles.metricLabel}>{user?.workerProfile?.totalReviews || 0} Reviews</Text>
          </View>

          <View style={styles.metricCard}>
            <Clock size={20} color={COLORS.primary} />
            <Text style={styles.metricValue}>
              LKR {user?.workerProfile?.hourlyRate || 1500}/hr
            </Text>
            <Text style={styles.metricLabel}>Hourly Rate</Text>
          </View>
        </View>

        {/* Section 1: Incoming Pending Requests */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>{t('worker.pendingRequests')}</Text>
          <Badge label={`${pendingBookings.length} New`} variant={pendingBookings.length > 0 ? 'warning' : 'neutral'} />
        </View>

        {pendingBookings.length === 0 ? (
          <View style={styles.emptySmallBox}>
            <Text style={styles.emptySmallText}>No pending requests right now.</Text>
          </View>
        ) : (
          pendingBookings.map((b) => (
            <View key={b._id} style={styles.requestCard}>
              <View style={styles.reqTop}>
                <View>
                  <Text style={styles.reqCustomerName}>{b.customerId?.name || 'Customer'}</Text>
                  <Text style={styles.reqService}>{b.serviceType}</Text>
                </View>
                <Text style={styles.reqRate}>Est: LKR {b.amount}</Text>
              </View>

              <View style={styles.reqLocation}>
                <MapPin size={14} color={COLORS.primary} />
                <Text style={styles.reqLocText}>
                  {b.location?.district} • {b.location?.address}
                </Text>
              </View>

              <Text style={styles.reqDesc}>"{b.description}"</Text>

              <View style={styles.reqActions}>
                <Button
                  title={t('worker.reject')}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1, marginRight: 8, borderColor: COLORS.danger }}
                  textStyle={{ color: COLORS.danger }}
                  onPress={() => handleRespond(b._id, 'reject')}
                />
                <Button
                  title={t('worker.accept')}
                  variant="primary"
                  size="sm"
                  style={{ flex: 1.5 }}
                  onPress={() => handleRespond(b._id, 'accept')}
                />
              </View>
            </View>
          ))
        )}

        {/* Section 2: Active & In-Progress Jobs */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>Active Scheduled Services</Text>
          <Badge label={`${activeBookings.length}`} variant="primary" />
        </View>

        {activeBookings.length === 0 ? (
          <View style={styles.emptySmallBox}>
            <Text style={styles.emptySmallText}>No in-progress or accepted jobs.</Text>
          </View>
        ) : (
          activeBookings.map((b) => (
            <View key={b._id} style={styles.activeJobCard}>
              <View style={styles.activeJobHeader}>
                <View>
                  <Text style={styles.activeJobClient}>{b.customerId?.name || 'Customer'}</Text>
                  <Text style={styles.activeJobService}>{b.serviceType}</Text>
                </View>
                <Badge
                  label={b.status === 'In Progress' ? 'Timer Running ⏱️' : 'Accepted ✓'}
                  variant={b.status === 'In Progress' ? 'warning' : 'info'}
                />
              </View>

              <View style={styles.metaRow}>
                <Calendar size={14} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{b.bookingDate} at {b.bookingTime}</Text>
              </View>

              <View style={styles.metaRow}>
                <MapPin size={14} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{b.location?.district} • {b.location?.address}</Text>
              </View>

              {/* Turn-by-Turn GPS Directions Button */}
              <TouchableOpacity
                style={styles.directionsBtn}
                onPress={() => handleGetDirections(b)}
                activeOpacity={0.8}
              >
                <Compass size={16} color={COLORS.primary} />
                <Text style={styles.directionsBtnText}>
                  🧭 Open in Google Maps (Turn-by-Turn GPS)
                </Text>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.serviceButtonsRow}>
                {b.status === 'Accepted' && (
                  <Button
                    title="▶ Start Service (Start Timer)"
                    variant="secondary"
                    size="md"
                    icon={<Play size={16} color="#FFFFFF" />}
                    onPress={() => handleStartService(b._id)}
                    style={{ flex: 1 }}
                  />
                )}

                <Button
                  title="⏹ Stop Service & Bill"
                  variant="primary"
                  size="md"
                  icon={<Square size={16} color="#FFFFFF" />}
                  onPress={() => openCompletionModal(b)}
                  style={{ flex: 1, marginLeft: b.status === 'Accepted' ? 8 : 0 }}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Interactive Service Completion & Billing Modal */}
      <Modal
        visible={!!selectedBookingForCompletion}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedBookingForCompletion(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Calculator size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Complete Service & Bill</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedBookingForCompletion(null)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedBookingForCompletion && (
              <View style={styles.modalBody}>
                <Text style={styles.modalClientName}>
                  Client: {selectedBookingForCompletion.customerId?.name || 'Customer'}
                </Text>
                <Text style={styles.modalServiceName}>
                  Service: {selectedBookingForCompletion.serviceType}
                </Text>

                <View style={styles.rateHighlightBox}>
                  <Text style={styles.rateHighlightLabel}>Your Hourly Rate:</Text>
                  <Text style={styles.rateHighlightVal}>
                    LKR {selectedBookingForCompletion.hourlyRate || 1500}/hr
                  </Text>
                </View>

                {/* Hours Worked Input & Presets */}
                <Text style={styles.inputLabel}>Total Hours Worked:</Text>
                <View style={styles.hoursInputRow}>
                  <TextInput
                    style={styles.hoursTextInput}
                    value={completionHours}
                    onChangeText={setCompletionHours}
                    keyboardType="numeric"
                    placeholder="1.0"
                  />
                  <Text style={styles.hoursUnitText}>Hours</Text>
                </View>

                {/* Quick Presets */}
                <View style={styles.presetsRow}>
                  {['1.0', '1.5', '2.0', '3.0', '4.0'].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[
                        styles.presetChip,
                        completionHours === preset && styles.activePresetChip
                      ]}
                      onPress={() => setCompletionHours(preset)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          completionHours === preset && styles.activePresetChipText
                        ]}
                      >
                        {preset}h
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Calculated Invoice Summary */}
                <View style={styles.totalInvoiceBox}>
                  <Text style={styles.invoiceSumLabel}>Total Invoice to Customer:</Text>
                  <Text style={styles.invoiceSumVal}>
                    LKR{' '}
                    {Math.round(
                      (parseFloat(completionHours) || 1.0) *
                        (selectedBookingForCompletion.hourlyRate || 1500)
                    )}
                  </Text>
                </View>

                <Button
                  title="✓ Generate Bill & Notify Customer"
                  variant="primary"
                  size="lg"
                  onPress={handleConfirmCompletion}
                  loading={completingLoading}
                  style={{ marginTop: 16 }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Live QR & Slide to Confirm Payment Collection Modal */}
      <WorkerPaymentCollectionModal
        visible={!!selectedBookingForPayment}
        booking={selectedBookingForPayment}
        onClose={() => setSelectedBookingForPayment(null)}
        onPaymentConfirmed={() => fetchWorkerData()}
      />
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
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1.5,
    marginBottom: 16,
    ...SHADOWS.sm
  },
  cardOnline: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  cardOffline: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  availTextCol: {
    flex: 1,
    marginRight: 10
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  availHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  availSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    ...SHADOWS.sm
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 6
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  emptySmallBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    marginBottom: 14
  },
  emptySmallText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 12,
    ...SHADOWS.sm
  },
  reqTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  reqCustomerName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  reqService: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1
  },
  reqRate: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondaryDark
  },
  reqLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  reqLocText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6
  },
  reqDesc: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 16
  },
  reqActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14
  },
  activeJobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    ...SHADOWS.sm
  },
  activeJobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  activeJobClient: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  activeJobService: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 1
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6
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
    marginTop: 8
  },
  directionsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 6
  },
  serviceButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    ...SHADOWS.lg
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginLeft: 8
  },
  modalBody: {
    marginTop: 14
  },
  modalClientName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  modalServiceName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2
  },
  rateHighlightBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 10,
    borderRadius: SIZES.radiusMd,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  rateHighlightLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary
  },
  rateHighlightVal: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 14,
    marginBottom: 6
  },
  hoursInputRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  hoursTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  hoursUnitText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 10
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  activePresetChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  activePresetChipText: {
    color: '#FFFFFF'
  },
  totalInvoiceBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    padding: 14,
    borderRadius: SIZES.radiusMd,
    marginTop: 16,
    alignItems: 'center'
  },
  invoiceSumLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46'
  },
  invoiceSumVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2
  }
});

export default WorkerDashboardScreen;
