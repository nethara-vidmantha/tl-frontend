import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { Clock, Calendar, ShieldCheck, Check } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { workerApi } from '../../api';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkerAvailabilityScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const workerProfile = user?.workerProfile;

  const [isOnline, setIsOnline] = useState(workerProfile?.availability !== false);
  const [selectedDays, setSelectedDays] = useState(
    workerProfile?.workingHours?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  );
  const [startTime, setStartTime] = useState(workerProfile?.workingHours?.start || '08:00 AM');
  const [endTime, setEndTime] = useState(workerProfile?.workingHours?.end || '06:00 PM');
  const [loading, setLoading] = useState(false);

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await workerApi.updateProfile({
        workingHours: {
          start: startTime,
          end: endTime,
          days: selectedDays
        }
      });
      await workerApi.toggleAvailability(isOnline);
      refreshUser();
      Alert.alert('Saved', 'Working schedule and availability updated successfully.');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Availability & Hours" showBack={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Availability Switch */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.cardTitle}>Online Service Status</Text>
              <Text style={styles.cardSub}>
                When Online, your profile appears on map discovery throughout Sri Lanka.
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
              thumbColor={isOnline ? COLORS.success : '#94A3B8'}
            />
          </View>
        </View>

        {/* Working Days */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Working Days</Text>
          <Text style={styles.cardSub}>Select the days you are available to accept bookings</Text>

          <View style={styles.daysGrid}>
            {DAYS.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, isSelected && styles.selectedDayChip]}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayChipText, isSelected && styles.selectedDayText]}>
                    {day.slice(0, 3)}
                  </Text>
                  {isSelected && <Check size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Working Hours */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Working Hours</Text>
          <Text style={styles.cardSub}>Set your regular service window</Text>

          <View style={styles.hoursRow}>
            <View style={styles.hourBox}>
              <Clock size={16} color={COLORS.primary} />
              <Text style={styles.hourLabel}>Start: {startTime}</Text>
            </View>

            <Text style={styles.hourTo}>to</Text>

            <View style={styles.hourBox}>
              <Clock size={16} color={COLORS.primary} />
              <Text style={styles.hourLabel}>End: {endTime}</Text>
            </View>
          </View>
        </View>

        <Button
          title="Save Availability Changes"
          variant="primary"
          size="lg"
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: 10 }}
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
    ...SHADOWS.sm
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusSm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  selectedDayChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  selectedDayText: {
    color: '#FFFFFF'
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12
  },
  hourBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  hourLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 6
  },
  hourTo: {
    marginHorizontal: 10,
    fontWeight: '800',
    color: COLORS.textMuted
  }
});

export default WorkerAvailabilityScreen;
