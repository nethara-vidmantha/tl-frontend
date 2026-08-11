import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { Users, Mail, Phone, Shield, Power } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { adminApi } from '../../api';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';

const AdminUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      if (res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.warn('Admin users notice:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminApi.toggleUserStatus(userId);
      fetchUsers();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="User Directory"
        subtitle={`${users.length} registered accounts in Sri Lanka`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUsers} colors={[COLORS.primary]} />}
      >
        {loading ? (
          <LoadingSpinner message="Loading user accounts..." />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          users.map((u) => (
            <View key={u._id} style={styles.userCard}>
              <View style={styles.topRow}>
                <Image
                  source={{ uri: u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }}
                  style={styles.avatar}
                />
                <View style={styles.infoCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.nameText}>{u.name}</Text>
                    <Badge
                      label={(u.role || 'customer').toUpperCase()}
                      variant={u.role === 'admin' ? 'danger' : u.role === 'worker' ? 'warning' : 'primary'}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.emailText}>{u.email}</Text>
                  <Text style={styles.phoneText}>📞 {u.phone || '0771234567'} • {u.location?.district || 'Colombo'}</Text>
                </View>
              </View>

              <View style={styles.bottomBar}>
                <Badge
                  label={u.isActive !== false ? 'Active Account' : 'Deactivated'}
                  variant={u.isActive !== false ? 'success' : 'danger'}
                  size="sm"
                />

                {u.role !== 'admin' && (
                  <TouchableOpacity
                    style={[styles.toggleBtn, u.isActive !== false ? styles.deactivateBtn : styles.activateBtn]}
                    onPress={() => handleToggleStatus(u._id)}
                  >
                    <Power size={12} color={u.isActive !== false ? COLORS.danger : COLORS.success} />
                    <Text style={[styles.toggleBtnText, { color: u.isActive !== false ? COLORS.danger : COLORS.success }]}>
                      {u.isActive !== false ? 'Deactivate' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                )}
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
    ...SHADOWS.sm
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary
  },
  infoCol: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  nameText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  emailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  phoneText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radiusSm
  },
  deactivateBtn: {
    backgroundColor: COLORS.dangerLight
  },
  activateBtn: {
    backgroundColor: COLORS.successLight
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4
  }
});

export default AdminUsersScreen;
