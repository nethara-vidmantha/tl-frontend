import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Calendar, MapPin, DollarSign } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { adminApi } from '../../api';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';

const AdminBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllBookings();
      if (res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.warn('Admin bookings notice:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Global Bookings Monitor"
        subtitle={`${bookings.length} platform service transactions`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchBookings} colors={[COLORS.primary]} />}
      >
        {loading ? (
          <LoadingSpinner message="Loading all bookings..." />
        ) : bookings.length === 0 ? (
          <EmptyState title="No bookings recorded yet" />
        ) : (
          bookings.map((b) => (
            <View key={b._id} style={styles.bookingCard}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.serviceTitle}>{b.serviceType}</Text>
                  <Text style={styles.partyText}>
                    Client: {b.customerId?.name || 'Customer'} ➔ Pro: {b.workerId?.userId?.name || 'Worker'}
                  </Text>
                </View>
                <Badge
                  label={b.status}
                  variant={b.status === 'Completed' ? 'success' : b.status === 'In Progress' ? 'warning' : 'info'}
                  size="sm"
                />
              </View>

              <View style={styles.infoLine}>
                <Calendar size={12} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{b.bookingDate} at {b.bookingTime}</Text>
              </View>

              <View style={styles.infoLine}>
                <MapPin size={12} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{b.location?.district} • {b.location?.address}</Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.hoursText}>
                  {b.hoursWorked || 1} hr(s) @ LKR {b.hourlyRate}/hr
                </Text>
                <Text style={styles.priceText}>LKR {b.amount}</Text>
              </View>
            </View>
          ))
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
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
    ...SHADOWS.sm
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  partyText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  infoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 6
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider
  },
  hoursText: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary
  }
});

export default AdminBookingsScreen;
