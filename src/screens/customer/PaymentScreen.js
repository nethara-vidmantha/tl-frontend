import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import {
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Copy,
  Check,
  Smartphone
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { paymentApi } from '../../api';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';

const PaymentScreen = ({ navigation, route }) => {
  const { booking } = route.params;
  const { t } = useLanguage();
  const toast = useToast();

  const [paymentMethod, setPaymentMethod] = useState('QR'); // 'QR' or 'Cash'
  const [loading, setLoading] = useState(false);

  const amount = booking.amount || (booking.hourlyRate * (booking.hoursWorked || 1));
  const workerName = booking.workerId?.userId?.name || 'Service Provider';
  const referenceId = `TL-${(booking._id || 'PAY').slice(-6).toUpperCase()}`;

  const handleCardPress = () => {
    toast?.info?.('💳 Card payment gateway is coming soon! Please pay via LANKAQR or Cash.');
  };

  const handleProcessPayment = async () => {
    try {
      setLoading(true);
      const res = await paymentApi.processPayment({
        bookingId: booking._id,
        method: paymentMethod,
        cardDetails: {}
      });

      if (res.data) {
        toast?.success?.(`Payment intent recorded. Waiting for ${workerName} to confirm!`);
        Alert.alert(
          'Payment Submitted! 🎉',
          paymentMethod === 'QR'
            ? `Please ensure you have scanned the QR code shown on ${workerName}'s mobile screen and completed the transfer of LKR ${amount}.`
            : `Please hand over LKR ${amount} in cash to ${workerName}. The worker will slide to confirm on their screen.`,
          [
            {
              text: 'Rate & Review',
              onPress: () => navigation.replace('Review', { booking: res.data.booking || booking })
            }
          ]
        );
      }
    } catch (err) {
      toast?.error?.(err.message || 'Could not process payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('payment.title')}
        subtitle={`Invoice for ${booking.serviceType || 'Service'}`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Invoice Summary Box */}
        <View style={styles.invoiceBox}>
          <Text style={styles.invoiceTitle}>{t('payment.invoiceSummary')}</Text>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Service</Text>
            <Text style={styles.invoiceVal}>{booking.serviceType || 'Service Booking'}</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Professional</Text>
            <Text style={styles.invoiceVal}>{workerName}</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Hours Worked</Text>
            <Text style={styles.invoiceVal}>
              {booking.hoursWorked || 1} hr(s) @ LKR {booking.hourlyRate || 1500}/hr
            </Text>
          </View>

          <View style={styles.invoiceDivider} />

          <View style={styles.invoiceRow}>
            <Text style={styles.totalDueLabel}>{t('payment.totalDue')}</Text>
            <Text style={styles.totalDueVal}>LKR {Number(amount).toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Methods Section */}
        <Text style={styles.sectionHeading}>{t('payment.chooseMethod')}</Text>

        {/* Option 1: LankaQR (Scan Worker's Screen) */}
        <TouchableOpacity
          style={[styles.methodCard, paymentMethod === 'QR' && styles.selectedMethodCard]}
          onPress={() => setPaymentMethod('QR')}
          activeOpacity={0.85}
        >
          <View style={[styles.methodIconBox, { backgroundColor: '#FEF3C7' }]}>
            <QrCode size={22} color={COLORS.secondaryDark} />
          </View>
          <View style={styles.methodInfo}>
            <View style={styles.methodTitleRow}>
              <Text style={[styles.methodTitle, paymentMethod === 'QR' && styles.selectedMethodTitle]}>
                LANKAQR (Scan Worker's Device)
              </Text>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedBadgeText}>Instant</Text>
              </View>
            </View>
            <Text style={styles.methodDesc}>Worker will display the QR code on their screen to scan</Text>
          </View>
          <View style={[styles.radioCircle, paymentMethod === 'QR' && styles.selectedRadio]}>
            {paymentMethod === 'QR' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* QR Instructions for Customer */}
        {paymentMethod === 'QR' && (
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionIconBox}>
              <Smartphone size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.instructionTitle}>Scan QR on {workerName}'s Phone</Text>
            <Text style={styles.instructionBody}>
              1. Ask <Text style={{ fontWeight: '800' }}>{workerName}</Text> to open the payment QR code on their screen.{'\n'}
              2. Open your Sri Lankan banking app (<Text style={{ fontWeight: '700' }}>Commercial Q+, BOC SmartPay, Sampath Pay, HNB Solo, FriMi, Genie,</Text> etc.).{'\n'}
              3. Scan the QR code and transfer <Text style={{ fontWeight: '800', color: COLORS.primary }}>LKR {Number(amount).toLocaleString()}</Text>.{'\n'}
              4. {workerName} will slide their screen to confirm receipt!
            </Text>
            <View style={styles.refPill}>
              <Text style={styles.refPillText}>Payment Reference: {referenceId}</Text>
            </View>
          </View>
        )}

        {/* Option 2: Cash on Completion (Enabled) */}
        <TouchableOpacity
          style={[styles.methodCard, paymentMethod === 'Cash' && styles.selectedMethodCard]}
          onPress={() => setPaymentMethod('Cash')}
          activeOpacity={0.85}
        >
          <View style={[styles.methodIconBox, { backgroundColor: '#D1FAE5' }]}>
            <Banknote size={22} color={COLORS.success} />
          </View>
          <View style={styles.methodInfo}>
            <Text style={[styles.methodTitle, paymentMethod === 'Cash' && styles.selectedMethodTitle]}>
              Cash on Completion
            </Text>
            <Text style={styles.methodDesc}>Pay cash directly to {workerName} upon completion</Text>
          </View>
          <View style={[styles.radioCircle, paymentMethod === 'Cash' && styles.selectedRadio]}>
            {paymentMethod === 'Cash' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Cash Instructions for Customer */}
        {paymentMethod === 'Cash' && (
          <View style={[styles.instructionsContainer, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}>
            <View style={[styles.instructionIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Banknote size={28} color={COLORS.success} />
            </View>
            <Text style={[styles.instructionTitle, { color: '#166534' }]}>Pay Cash in Person</Text>
            <Text style={[styles.instructionBody, { color: '#15803D' }]}>
              Please hand over <Text style={{ fontWeight: '800' }}>LKR {Number(amount).toLocaleString()}</Text> directly to {workerName}. The worker will slide to confirm receipt on their device.
            </Text>
          </View>
        )}

        {/* Option 3: Card (Disabled / Coming Soon) */}
        <TouchableOpacity
          style={[styles.methodCard, styles.disabledMethodCard]}
          onPress={handleCardPress}
          activeOpacity={0.7}
        >
          <View style={[styles.methodIconBox, { backgroundColor: '#F1F5F9' }]}>
            <CreditCard size={22} color={COLORS.textMuted} />
          </View>
          <View style={styles.methodInfo}>
            <View style={styles.methodTitleRow}>
              <Text style={[styles.methodTitle, styles.disabledMethodTitle]}>
                Credit / Debit Card
              </Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>
            <Text style={[styles.methodDesc, { color: COLORS.textMuted }]}>
              Visa / Mastercard gateway integration in progress
            </Text>
          </View>
          <View style={[styles.radioCircle, styles.disabledRadio]} />
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Lock size={14} color={COLORS.success} />
          <Text style={styles.securityText}>
            Certified & Secure TaskLanka Digital Transaction Protection
          </Text>
        </View>

        {/* Submit Payment CTA */}
        <Button
          title={
            paymentMethod === 'QR'
              ? `✓ I Have Transferred via LANKAQR (LKR ${Number(amount).toLocaleString()})`
              : `✓ Handing Over Cash (LKR ${Number(amount).toLocaleString()})`
          }
          variant="primary"
          size="lg"
          onPress={handleProcessPayment}
          loading={loading}
          style={{ marginTop: 16 }}
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
  invoiceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20,
    ...SHADOWS.sm
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: 8
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  invoiceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary
  },
  invoiceVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 10
  },
  totalDueLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  totalDueVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm
  },
  selectedMethodCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA'
  },
  disabledMethodCard: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0'
  },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  methodInfo: {
    flex: 1
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  selectedMethodTitle: {
    color: COLORS.primary
  },
  disabledMethodTitle: {
    color: COLORS.textMuted
  },
  methodDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  recommendedBadge: {
    backgroundColor: '#DEF7EC',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#03543F'
  },
  comingSoonBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E'
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  selectedRadio: {
    borderColor: COLORS.primary
  },
  disabledRadio: {
    borderColor: '#E2E8F0'
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    ...SHADOWS.sm
  },
  instructionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6
  },
  instructionBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 10
  },
  refPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusFull
  },
  refPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: SIZES.radiusMd,
    marginTop: 4,
    marginBottom: 8
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 6
  }
});

export default PaymentScreen;
