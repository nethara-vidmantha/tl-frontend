import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { paymentApi } from '../../api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';

const PaymentScreen = ({ navigation, route }) => {
  const { booking } = route.params;
  const { t } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Cash', 'Card', 'QR'
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [loading, setLoading] = useState(false);

  const amount = booking.amount;
  const workerName = booking.workerId?.userId?.name || 'Service Provider';

  const handleProcessPayment = async () => {
    try {
      setLoading(true);
      const res = await paymentApi.processPayment({
        bookingId: booking._id,
        method: paymentMethod,
        cardDetails: paymentMethod === 'Card' ? { cardNumber, brand: 'Visa' } : {}
      });

      if (res.data) {
        Alert.alert(
          'Payment Successful! 🎉',
          `Payment of LKR ${amount} completed via ${paymentMethod}. Transaction Ref: ${res.data.payment?.transactionReference || 'TXN-LKA-OK'}.`,
          [
            {
              text: 'Rate & Review',
              onPress: () => navigation.replace('Review', { booking: res.data.booking || booking })
            }
          ]
        );
      }
    } catch (err) {
      Alert.alert('Payment Error', err.message || 'Could not process payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('payment.title')}
        subtitle={`Invoice for ${booking.serviceType}`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Invoice Summary Box */}
        <View style={styles.invoiceBox}>
          <Text style={styles.invoiceTitle}>{t('payment.invoiceSummary')}</Text>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Service</Text>
            <Text style={styles.invoiceVal}>{booking.serviceType}</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Professional</Text>
            <Text style={styles.invoiceVal}>{workerName}</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Hours Worked</Text>
            <Text style={styles.invoiceVal}>{booking.hoursWorked || 1} hr(s) @ LKR {booking.hourlyRate}/hr</Text>
          </View>

          <View style={styles.invoiceDivider} />

          <View style={styles.invoiceRow}>
            <Text style={styles.totalDueLabel}>{t('payment.totalDue')}</Text>
            <Text style={styles.totalDueVal}>LKR {amount}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionHeading}>{t('payment.chooseMethod')}</Text>

        {/* Option 1: Card */}
        <TouchableOpacity
          style={[styles.methodCard, paymentMethod === 'Card' && styles.selectedMethodCard]}
          onPress={() => setPaymentMethod('Card')}
          activeOpacity={0.85}
        >
          <View style={styles.methodIconBox}>
            <CreditCard size={22} color={paymentMethod === 'Card' ? COLORS.primary : COLORS.textSecondary} />
          </View>
          <View style={styles.methodInfo}>
            <Text style={[styles.methodTitle, paymentMethod === 'Card' && styles.selectedMethodTitle]}>
              {t('payment.card')}
            </Text>
            <Text style={styles.methodDesc}>{t('payment.cardDesc')}</Text>
          </View>
          <View style={[styles.radioCircle, paymentMethod === 'Card' && styles.selectedRadio]}>
            {paymentMethod === 'Card' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Card Form Simulator */}
        {paymentMethod === 'Card' && (
          <View style={styles.cardForm}>
            <Input
              label="Card Number (Test Gateway Mode)"
              value={cardNumber}
              onChangeText={setCardNumber}
              icon={<CreditCard size={16} color={COLORS.primary} />}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Input
                label="Expiry (MM/YY)"
                value={expiry}
                onChangeText={setExpiry}
                style={{ flex: 1 }}
              />
              <Input
                label="CVV"
                value={cvv}
                onChangeText={setCvv}
                secureTextEntry={true}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* Option 2: LankaQR */}
        <TouchableOpacity
          style={[styles.methodCard, paymentMethod === 'QR' && styles.selectedMethodCard]}
          onPress={() => setPaymentMethod('QR')}
          activeOpacity={0.85}
        >
          <View style={[styles.methodIconBox, { backgroundColor: '#FEF3C7' }]}>
            <QrCode size={22} color={COLORS.secondaryDark} />
          </View>
          <View style={styles.methodInfo}>
            <Text style={[styles.methodTitle, paymentMethod === 'QR' && styles.selectedMethodTitle]}>
              {t('payment.qr')}
            </Text>
            <Text style={styles.methodDesc}>{t('payment.qrDesc')}</Text>
          </View>
          <View style={[styles.radioCircle, paymentMethod === 'QR' && styles.selectedRadio]}>
            {paymentMethod === 'QR' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* LankaQR Mock Display */}
        {paymentMethod === 'QR' && (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>National LankaQR EMVCo Code</Text>
            <View style={styles.qrBox}>
              <QrCode size={130} color={COLORS.primary} />
            </View>
            <Text style={styles.qrFooter}>Scan with Commercial Q+, Flash, BOC SmartPay, or FriMi</Text>
          </View>
        )}

        {/* Option 3: Cash */}
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
              {t('payment.cash')}
            </Text>
            <Text style={styles.methodDesc}>{t('payment.cashDesc')}</Text>
          </View>
          <View style={[styles.radioCircle, paymentMethod === 'Cash' && styles.selectedRadio]}>
            {paymentMethod === 'Cash' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Security Assurance */}
        <View style={styles.securityNote}>
          <Lock size={14} color={COLORS.success} />
          <Text style={styles.securityText}>
            256-Bit SSL Encrypted & Certified Sri Lanka Payment Security
          </Text>
        </View>

        {/* Submit Payment CTA */}
        <Button
          title={`${t('payment.payConfirm')} ${amount}`}
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
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '900',
    color: COLORS.primary
  },
  totalDueVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
    ...SHADOWS.sm
  },
  selectedMethodCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF'
  },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  methodInfo: {
    flex: 1
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  selectedMethodTitle: {
    color: COLORS.primary
  },
  methodDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedRadio: {
    borderColor: COLORS.primary
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary
  },
  cardForm: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    marginBottom: 12
  },
  qrTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10
  },
  qrBox: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8
  },
  qrFooter: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  securityText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 6
  }
});

export default PaymentScreen;
