import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Badge from '../common/Badge';

const BookingItemCard = ({ booking, onPress }) => {
  const workerName = booking.workerId?.userId?.name || 'Assigned Professional';
  const workerAvatar = booking.workerId?.profileImage || booking.workerId?.userId?.profileImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80';
  const serviceType = booking.serviceType || 'Service Booking';
  const status = booking.status || 'Pending';
  const bookingDate = booking.bookingDate;
  const bookingTime = booking.bookingTime;
  const district = booking.location?.district || 'Colombo';
  const amount = booking.amount || (booking.hourlyRate * (booking.hoursWorked || 1));
  const hoursWorked = booking.hoursWorked || 1;

  const getStatusVariant = () => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Accepted': return 'info';
      case 'Pending': return 'warning';
      case 'Cancelled':
      case 'Rejected': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.serviceTitleCol}>
          <Text style={styles.serviceText} numberOfLines={1}>
            {serviceType}
          </Text>
          <Text style={styles.workerNameText}>
            with {workerName}
          </Text>
        </View>
        <Badge label={status} variant={getStatusVariant()} size="sm" />
      </View>

      <View style={styles.detailsRow}>
        <Image source={{ uri: workerAvatar }} style={styles.avatar} />

        <View style={styles.metaCol}>
          <View style={styles.metaItem}>
            <Calendar size={12} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{bookingDate} at {bookingTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={12} color={COLORS.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{district} • {booking.location?.address}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.amountBox}>
          <Text style={styles.hoursText}>{hoursWorked} hr(s) @ LKR {booking.hourlyRate}/hr</Text>
          <Text style={styles.totalText}>Total: LKR {amount}</Text>
        </View>

        <View style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>Details</Text>
          <ChevronRight size={14} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 12,
    ...SHADOWS.sm
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  serviceTitleCol: {
    flex: 1,
    marginRight: 8
  },
  serviceText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  workerNameText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.primary
  },
  metaCol: {
    flex: 1
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 6
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 10
  },
  amountBox: {
    flex: 1
  },
  hoursText: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  totalText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusFull
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 2
  }
});

export default BookingItemCard;
