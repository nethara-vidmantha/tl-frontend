import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import {
  QrCode,
  Banknote,
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  Copy,
  Check
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';
import { paymentApi } from '../../api';
import SlideToConfirm from './SlideToConfirm';

const PAYMENT_QR_IMAGE = require('../../../assets/payment_qr.png');

const WorkerPaymentCollectionModal = ({
  visible,
  onClose,
  booking,
  onPaymentConfirmed
}) => {
  const toast = useToast();
  const [collectionMethod, setCollectionMethod] = useState('QR'); // 'QR' or 'Cash'
  const [loading, setLoading] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!booking) return null;

  const amount = booking.amount || (booking.hourlyRate * (booking.hoursWorked || 1));
  const clientName = booking.customerId?.name || 'Customer';
  const referenceId = `TL-${(booking._id || 'PAY').slice(-6).toUpperCase()}`;

  const handleCopyReference = () => {
    setCopiedRef(true);
    toast?.info?.(`Copied Reference: ${referenceId}`);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      await paymentApi.processPayment({
        bookingId: booking._id,
        method: collectionMethod,
        cardDetails: {}
      });

      toast?.success?.(`Payment of LKR ${amount} confirmed successfully!`);
      if (onPaymentConfirmed) {
        onPaymentConfirmed(booking._id);
      }
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      toast?.error?.(err.message || 'Could not confirm payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Collect Payment from Customer</Text>
              <Text style={styles.modalSubtitle}>Client: {clientName} • {booking.serviceType}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Amount Highlight Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountCardLabel}>Total Bill Due</Text>
            <Text style={styles.amountCardValue}>LKR {Number(amount).toLocaleString()}</Text>
            <Text style={styles.amountCardSub}>
              Based on {booking.hoursWorked || 1} hr(s) of service rendered
            </Text>
          </View>

          {/* Method Switcher Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, collectionMethod === 'QR' && styles.activeTabBtn]}
              onPress={() => setCollectionMethod('QR')}
              activeOpacity={0.8}
            >
              <QrCode size={18} color={collectionMethod === 'QR' ? '#FFFFFF' : COLORS.textSecondary} />
              <Text style={[styles.tabBtnText, collectionMethod === 'QR' && styles.activeTabBtnText]}>
                LANKAQR Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, collectionMethod === 'Cash' && styles.activeTabBtn]}
              onPress={() => setCollectionMethod('Cash')}
              activeOpacity={0.8}
            >
              <Banknote size={18} color={collectionMethod === 'Cash' ? '#FFFFFF' : COLORS.textSecondary} />
              <Text style={[styles.tabBtnText, collectionMethod === 'Cash' && styles.activeTabBtnText]}>
                Cash on Hand
              </Text>
            </TouchableOpacity>
          </View>

          {/* QR Method View */}
          {collectionMethod === 'QR' && (
            <View style={styles.qrSection}>
              <View style={styles.qrHeaderRow}>
                <Text style={styles.qrHelpText}>📱 Show this QR to the customer to scan:</Text>
                <TouchableOpacity style={styles.copyRefBtn} onPress={handleCopyReference}>
                  {copiedRef ? <Check size={12} color={COLORS.success} /> : <Copy size={12} color={COLORS.primary} />}
                  <Text style={styles.copyRefText}>Ref: {referenceId}</Text>
                </TouchableOpacity>
              </View>

              {/* Official QR Code Box */}
              <View style={styles.qrFrame}>
                <Image source={PAYMENT_QR_IMAGE} style={styles.qrImage} resizeMode="contain" />
              </View>

              <Text style={styles.scanNotice}>
                Customer can scan with <Text style={{ fontWeight: '800' }}>Commercial Bank Q+, BOC SmartPay, Sampath Pay, HNB Solo, FriMi, Genie,</Text> or any banking app.
              </Text>

              {/* Slide to Confirm Bar */}
              <SlideToConfirm
                title="Slide to Confirm QR Payment ➔"
                confirmedTitle="QR Payment Received! ✓"
                onConfirm={handleConfirmPayment}
                disabled={loading}
              />
            </View>
          )}

          {/* Cash Method View */}
          {collectionMethod === 'Cash' && (
            <View style={styles.cashSection}>
              <View style={styles.cashNoticeBox}>
                <Banknote size={36} color={COLORS.success} />
                <Text style={styles.cashNoticeTitle}>Collect Cash in Person</Text>
                <Text style={styles.cashNoticeDesc}>
                  Please collect the exact cash amount of <Text style={{ fontWeight: '800' }}>LKR {Number(amount).toLocaleString()}</Text> from {clientName}.
                </Text>
              </View>

              {/* Slide to Confirm Bar */}
              <SlideToConfirm
                title="Slide to Confirm Cash Received ➔"
                confirmedTitle="Cash Payment Confirmed! ✓"
                onConfirm={handleConfirmPayment}
                disabled={loading}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    ...SHADOWS.lg
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  closeBtn: {
    padding: 4
  },
  amountCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: SIZES.radiusLg,
    padding: 14,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#99F6E4'
  },
  amountCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  amountCardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    marginVertical: 2
  },
  amountCardSub: {
    fontSize: 11,
    color: '#0F766E'
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: SIZES.radiusFull,
    padding: 4,
    marginBottom: 14
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: SIZES.radiusFull,
    gap: 6
  },
  activeTabBtn: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  activeTabBtnText: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  qrSection: {
    alignItems: 'center'
  },
  qrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8
  },
  qrHelpText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  copyRefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: SIZES.radiusFull,
    gap: 4
  },
  copyRefText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary
  },
  qrFrame: {
    width: 200,
    height: 200,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...SHADOWS.sm
  },
  qrImage: {
    width: '100%',
    height: '100%'
  },
  scanNotice: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 6,
    paddingHorizontal: 10
  },
  cashSection: {
    alignItems: 'center',
    paddingVertical: 10
  },
  cashNoticeBox: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
    width: '100%'
  },
  cashNoticeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
    marginTop: 8,
    marginBottom: 4
  },
  cashNoticeDesc: {
    fontSize: 12,
    color: '#15803D',
    textAlign: 'center',
    lineHeight: 18
  }
});

export default WorkerPaymentCollectionModal;
