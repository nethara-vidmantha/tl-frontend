import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import {
  Clock,
  X,
  Check,
  Sun,
  Sunrise,
  Moon
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

// Strict 30-Minute Interval Time Slots
export const THIRTY_MIN_TIME_SLOTS = [
  {
    category: 'Morning',
    icon: Sunrise,
    slots: [
      '08:00 AM',
      '08:30 AM',
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM'
    ]
  },
  {
    category: 'Afternoon',
    icon: Sun,
    slots: [
      '12:00 PM',
      '12:30 PM',
      '01:00 PM',
      '01:30 PM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM'
    ]
  },
  {
    category: 'Evening',
    icon: Moon,
    slots: [
      '05:00 PM',
      '05:30 PM',
      '06:00 PM',
      '06:30 PM',
      '07:00 PM',
      '07:30 PM',
      '08:00 PM'
    ]
  }
];

const TimePickerModal = ({
  visible,
  onClose,
  selectedTime,
  onSelectTime
}) => {
  const [tempTime, setTempTime] = useState(selectedTime || '10:00 AM');

  const handleConfirm = () => {
    if (tempTime) {
      onSelectTime(tempTime);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBox}>
              <Clock size={20} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Choose Service Time</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.helperText}>
            ⏱️ Appointments are scheduled in 30-minute intervals for punctuality.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.slotsScroll}
            style={{ maxHeight: 380 }}
          >
            {THIRTY_MIN_TIME_SLOTS.map((group) => {
              const IconComponent = group.icon;
              return (
                <View key={group.category} style={styles.groupSection}>
                  <View style={styles.groupHeader}>
                    <IconComponent size={16} color={COLORS.primary} />
                    <Text style={styles.groupTitle}>{group.category}</Text>
                  </View>

                  <View style={styles.slotsGrid}>
                    {group.slots.map((slot) => {
                      const isSelected = tempTime === slot;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[styles.slotChip, isSelected && styles.selectedSlotChip]}
                          onPress={() => setTempTime(slot)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.slotChipText,
                              isSelected && styles.selectedSlotChipText
                            ]}
                          >
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer Bar */}
          <View style={styles.footerBar}>
            <View style={styles.selectedTimeInfo}>
              <Text style={styles.selectedTimeLabel}>Selected Time:</Text>
              <Text style={styles.selectedTimeValue}>{tempTime}</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Set Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginLeft: 8
  },
  closeBtn: {
    padding: 4
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 10,
    marginBottom: 12
  },
  slotsScroll: {
    paddingBottom: 10
  },
  groupSection: {
    marginBottom: 14
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  slotChip: {
    width: '31%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  selectedSlotChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.sm
  },
  slotChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  selectedSlotChipText: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12
  },
  selectedTimeInfo: {
    flex: 1
  },
  selectedTimeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  selectedTimeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: SIZES.radiusFull,
    ...SHADOWS.sm
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6
  }
});

export default TimePickerModal;
