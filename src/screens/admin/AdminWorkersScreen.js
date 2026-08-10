import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { ShieldCheck, XCircle, CheckCircle2, FileText, MapPin } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { workerApi, adminApi } from '../../api';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';

const AdminWorkersScreen = ({ navigation }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await workerApi.getWorkers();
      if (res.data) {
        setWorkers(res.data);
      }
    } catch (err) {
      console.warn('Admin workers fetch notice:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVerify = async (workerId, status) => {
    try {
      await adminApi.verifyWorker(workerId, status);
      Alert.alert('Updated', `Worker status updated to ${status}.`);
      fetchWorkers();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Worker Verification Portal"
        subtitle="Approve national credentials and badges"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchWorkers} colors={[COLORS.primary]} />}
      >
        {loading ? (
          <LoadingSpinner message="Loading worker submissions..." />
        ) : workers.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck size={40} color={COLORS.primary} />}
            title="No worker applications"
            subtitle="Registered workers will appear here for verification."
          />
        ) : (
          workers.map((w) => {
            const isVerified = w.verified;
            const status = w.verificationStatus || (isVerified ? 'Verified' : 'Pending');

            return (
              <View key={w._id} style={styles.workerCard}>
                <View style={styles.topRow}>
                  <Image
                    source={{ uri: w.profileImage || w.userId?.profileImage }}
                    style={styles.avatar}
                  />

                  <View style={styles.infoCol}>
                    <View style={styles.nameBadgeRow}>
                      <Text style={styles.nameText}>{w.userId?.name || w.name}</Text>
                      <Badge
                        label={status}
                        variant={isVerified ? 'success' : status === 'Rejected' ? 'danger' : 'warning'}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.categoryText}>
                      {(w.category || '').toUpperCase()} • {w.district}
                    </Text>
                    <Text style={styles.nicText}>
                      🪪 NIC: {w.nicVerification?.nicNumber || '198812345678'}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  {!isVerified ? (
                    <>
                      <Button
                        title="Reject"
                        variant="outline"
                        size="sm"
                        style={{ flex: 1, marginRight: 8, borderColor: COLORS.danger }}
                        textStyle={{ color: COLORS.danger }}
                        onPress={() => handleVerify(w._id, 'Rejected')}
                      />
                      <Button
                        title="✓ Approve Blue Badge"
                        variant="primary"
                        size="sm"
                        style={{ flex: 1.8 }}
                        onPress={() => handleVerify(w._id, 'Verified')}
                      />
                    </>
                  ) : (
                    <Button
                      title="Revoke Verification"
                      variant="outline"
                      size="sm"
                      style={{ flex: 1, borderColor: COLORS.danger }}
                      textStyle={{ color: COLORS.danger }}
                      onPress={() => handleVerify(w._id, 'Rejected')}
                    />
                  )}
                </View>
              </View>
            );
          })
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
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    ...SHADOWS.sm
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary
  },
  infoCol: {
    flex: 1
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  nameText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2
  },
  nicText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider
  }
});

export default AdminWorkersScreen;
