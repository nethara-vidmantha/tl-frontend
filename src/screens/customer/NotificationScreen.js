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
import { Bell, CheckCheck, Clock, ShieldCheck, DollarSign, Star } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { notificationApi } from '../../api';
import Header from '../../components/common/Header';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      if (res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.warn('Notifications notice:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch (e) {}
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'Payment': return <DollarSign size={18} color={COLORS.success} />;
      case 'Review': return <Star size={18} color={COLORS.secondary} />;
      case 'Account': return <ShieldCheck size={18} color={COLORS.primary} />;
      case 'Booking':
      default:
        return <Bell size={18} color={COLORS.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Notification Center"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          notifications.length > 0 && (
            <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
              <CheckCheck size={16} color="#FFFFFF" />
              <Text style={styles.markAllText}>Mark Read</Text>
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} colors={[COLORS.primary]} />}
      >
        {loading ? (
          <LoadingSpinner message="Checking for alerts..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={40} color={COLORS.primary} />}
            title="No notifications yet"
            subtitle="You will receive alerts here when your booking status updates or workers accept requests."
          />
        ) : (
          notifications.map((notif) => (
            <View
              key={notif._id}
              style={[
                styles.notifCard,
                !notif.isRead && styles.unreadCard
              ]}
            >
              <View style={styles.notifIconBox}>
                {getNotifIcon(notif.type)}
              </View>

              <View style={styles.notifContent}>
                <View style={styles.notifHeaderRow}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  {!notif.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMessage}>{notif.message}</Text>
                <Text style={styles.notifTime}>
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                </Text>
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
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radiusFull
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
    ...SHADOWS.sm
  },
  unreadCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD'
  },
  notifIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  notifContent: {
    flex: 1
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary
  },
  notifMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 17
  },
  notifTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 6
  }
});

export default NotificationScreen;
