import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { Calendar, Clock, MapPin, CheckCircle2, Play, Square } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { bookingApi } from '../../api';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';

const WorkerBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getWorkerBookings();
      if (res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.warn('Worker bookings notice:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getFilteredBookings = () => {
    if (filter === 'pending') return bookings.filter((b) => b.status === 'Pending');
    if (filter === 'active') return bookings.filter((b) => ['Accepted', 'In Progress'].includes(b.status));
    if (filter === 'completed') return bookings.filter((b) => b.status === 'Completed');
    return bookings;
  };

  const list = getFilteredBookings();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="All Bookings & Requests" showBack={false} />

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, filter === 'all' && styles.activeTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>All ({bookings.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filter === 'pending' && styles.activeTab]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.tabText, filter === 'pending' && styles.activeTabText]}>Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filter === 'active' && styles.activeTab]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.tabText, filter === 'active' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filter === 'completed' && styles.activeTab]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.tabText, filter === 'completed' && styles.activeTabText]}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {loading ? (
          <LoadingSpinner message="Loading bookings..." />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Calendar size={40} color={COLORS.primary} />}
            title="No bookings in this category"
            subtitle="Customer requests will appear here in real time."
          />
        ) : (
          list.map((b) => (
            <View key={b._id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.clientName}>{b.customerId?.name || 'Customer'}</Text>
                  <Text style={styles.serviceName}>{b.serviceType}</Text>
                </View>
                <Badge
                  label={b.status}
                  variant={b.status === 'Completed' ? 'success' : b.status === 'In Progress' ? 'warning' : 'info'}
                />
              </View>

              <View style={styles.infoRow}>
                <Calendar size={13} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{b.bookingDate} at {b.bookingTime}</Text>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={13} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{b.location?.district} • {b.location?.address}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.billBreakdown}>
                  {b.hoursWorked || 1} hr(s) @ LKR {b.hourlyRate}/hr
                </Text>
                <Text style={styles.totalPrice}>LKR {b.amount}</Text>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: SIZES.radiusMd,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.md
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: SIZES.radiusSm
  },
  activeTab: {
    backgroundColor: COLORS.primaryLight
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  activeTabText: {
    color: COLORS.primary
  },
  scrollContent: {
    padding: 16,
    paddingTop: 18,
    paddingBottom: 40
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    ...SHADOWS.sm
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  clientName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 1
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider
  },
  billBreakdown: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary
  }
});

export default WorkerBookingsScreen;
