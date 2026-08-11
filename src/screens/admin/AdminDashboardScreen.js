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
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  ShieldCheck,
  Star,
  AlertTriangle,
  ChevronRight,
  LogOut
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';

const AdminDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Admin stats notice:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Admin Control Center"
        subtitle="Platform Analytics & Moderation"
        showBack={false}
        rightComponent={
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <LogOut size={16} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {loading || !stats ? (
          <LoadingSpinner message="Calculating platform metrics..." />
        ) : (
          <>
            {/* Top Revenue Card */}
            <View style={styles.revenueCard}>
              <View style={styles.revIconBox}>
                <DollarSign size={28} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.revSub}>Total Processed Revenue</Text>
                <Text style={styles.revAmount}>
                  LKR {(stats.financials?.totalRevenue || 0).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Platform Metrics 2x2 Grid */}
            <View style={styles.metricsGrid}>
              {/* Total Users */}
              <TouchableOpacity
                style={styles.statBox}
                onPress={() => navigation.navigate('AdminUsers')}
                activeOpacity={0.8}
              >
                <Users size={22} color={COLORS.primary} />
                <Text style={styles.statVal}>{stats.users?.total || 0}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
                <Text style={styles.statSub}>
                  {stats.users?.customers || 0} Customers • {stats.users?.workers || 0} Pros
                </Text>
              </TouchableOpacity>

              {/* Total Workers */}
              <TouchableOpacity
                style={styles.statBox}
                onPress={() => navigation.navigate('AdminWorkers')}
                activeOpacity={0.8}
              >
                <ShieldCheck size={22} color={COLORS.success} />
                <Text style={styles.statVal}>{stats.workers?.verified || 0}</Text>
                <Text style={styles.statLabel}>Verified Pros</Text>
                <Text style={styles.statSub}>
                  {stats.workers?.pendingVerification || 0} Pending Approvals
                </Text>
              </TouchableOpacity>

              {/* Total Bookings */}
              <TouchableOpacity
                style={styles.statBox}
                onPress={() => navigation.navigate('AdminBookings')}
                activeOpacity={0.8}
              >
                <Calendar size={22} color={COLORS.secondaryDark} />
                <Text style={styles.statVal}>{stats.bookings?.total || 0}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
                <Text style={styles.statSub}>
                  {stats.bookings?.completed || 0} Done • {stats.bookings?.inProgress || 0} Active
                </Text>
              </TouchableOpacity>

              {/* Reviews */}
              <View style={styles.statBox}>
                <Star size={22} color={COLORS.secondary} />
                <Text style={styles.statVal}>{stats.reviews?.total || 0}</Text>
                <Text style={styles.statLabel}>Client Reviews</Text>
                <Text style={styles.statSub}>Authentic Ratings</Text>
              </View>
            </View>

            {/* Quick Actions Shortcuts */}
            <Text style={styles.sectionHeading}>Management Portals</Text>

            <TouchableOpacity
              style={styles.portalCard}
              onPress={() => navigation.navigate('AdminWorkers')}
              activeOpacity={0.8}
            >
              <View style={[styles.portalIcon, { backgroundColor: '#FEF3C7' }]}>
                <ShieldCheck size={20} color={COLORS.secondaryDark} />
              </View>
              <View style={styles.portalText}>
                <Text style={styles.portalTitle}>Worker Verification Queue</Text>
                <Text style={styles.portalSub}>Review national IDs & approve blue badges</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.portalCard}
              onPress={() => navigation.navigate('AdminUsers')}
              activeOpacity={0.8}
            >
              <View style={[styles.portalIcon, { backgroundColor: '#E0F2FE' }]}>
                <Users size={20} color={COLORS.primary} />
              </View>
              <View style={styles.portalText}>
                <Text style={styles.portalTitle}>User Management Directory</Text>
                <Text style={styles.portalSub}>View customer & worker accounts, activate/deactivate</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.portalCard}
              onPress={() => navigation.navigate('AdminBookings')}
              activeOpacity={0.8}
            >
              <View style={[styles.portalIcon, { backgroundColor: '#D1FAE5' }]}>
                <Calendar size={20} color={COLORS.success} />
              </View>
              <View style={styles.portalText}>
                <Text style={styles.portalTitle}>Global Service Bookings</Text>
                <Text style={styles.portalSub}>Monitor live service progress across Sri Lanka</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </>
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
  logoutBtn: {
    padding: 6,
    borderRadius: SIZES.radiusFull,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  revenueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F766E', // Teal 700
    borderRadius: SIZES.radiusLg,
    padding: 18,
    marginBottom: 16,
    ...SHADOWS.md
  },
  revIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  revSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600'
  },
  revAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  statBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 8
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2
  },
  statSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12
  },
  portalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
    ...SHADOWS.sm
  },
  portalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  portalText: {
    flex: 1
  },
  portalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  portalSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  }
});

export default AdminDashboardScreen;
