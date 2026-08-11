import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { bookingApi } from '../../api';
import BookingItemCard from '../../components/customer/BookingItemCard';
import Header from '../../components/common/Header';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';

const BookingHistoryScreen = ({ navigation }) => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'cancelled'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getCustomerBookings();
      if (res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.warn('Booking history error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filterBookings = () => {
    if (activeTab === 'active') {
      return bookings.filter((b) => ['Pending', 'Accepted', 'In Progress'].includes(b.status));
    }
    if (activeTab === 'completed') {
      return bookings.filter((b) => b.status === 'Completed');
    }
    if (activeTab === 'cancelled') {
      return bookings.filter((b) => ['Cancelled', 'Rejected'].includes(b.status));
    }
    return bookings;
  };

  const displayedList = filterBookings();

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('history.title')} showBack={false} />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' && styles.activeTabBtn]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            {t('history.upcoming')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'completed' && styles.activeTabBtn]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            {t('history.completed')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'cancelled' && styles.activeTabBtn]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>
            {t('history.cancelled')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {loading ? (
          <LoadingSpinner message="Loading your bookings..." />
        ) : displayedList.length === 0 ? (
          <EmptyState
            icon={<Calendar size={40} color={COLORS.primary} />}
            title={activeTab === 'active' ? t('history.emptyActive') : t('history.emptyCompleted')}
            subtitle="Book a verified electrician, plumber, or tutor to see it here."
          />
        ) : (
          displayedList.map((item) => (
            <BookingItemCard
              key={item._id}
              booking={item}
              onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id })}
            />
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
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.radiusSm
  },
  activeTabBtn: {
    backgroundColor: COLORS.primaryLight
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  activeTabText: {
    color: COLORS.primary
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 30
  }
});

export default BookingHistoryScreen;
