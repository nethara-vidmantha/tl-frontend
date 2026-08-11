import React, { useState, useMemo } from 'react';
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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Clock,
  Sparkles
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarPickerModal = ({
  visible,
  onClose,
  selectedDate, // Format: 'YYYY-MM-DD'
  onSelectDate,
  minDate = new Date()
}) => {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [tempSelectedDate, setTempSelectedDate] = useState(
    selectedDate || new Date().toISOString().split('T')[0]
  );

  // Normalize minDate to start of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate calendar grid
  const daysInMonth = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];

    // Blank padding for days before the 1st of the month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: null, isPast: true });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const dateObj = new Date(currentYear, currentMonth, d);
      dateObj.setHours(0, 0, 0, 0);

      const isPast = dateObj < today;
      const isToday =
        d === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      days.push({
        day: d,
        dateStr,
        isPast,
        isToday
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleQuickSelect = (daysFromToday) => {
    const target = new Date();
    target.setDate(today.getDate() + daysFromToday);
    const monthStr = String(target.getMonth() + 1).padStart(2, '0');
    const dayStr = String(target.getDate()).padStart(2, '0');
    const dateStr = `${target.getFullYear()}-${monthStr}-${dayStr}`;

    setCurrentMonth(target.getMonth());
    setCurrentYear(target.getFullYear());
    setTempSelectedDate(dateStr);
  };

  const handleConfirm = () => {
    if (tempSelectedDate) {
      onSelectDate(tempSelectedDate);
    }
    onClose();
  };

  // Format header display date (e.g. "Tuesday, 12 August 2026")
  const formattedSelectedDisplay = useMemo(() => {
    if (!tempSelectedDate) return 'Select a date';
    const [y, m, d] = tempSelectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [tempSelectedDate]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBox}>
              <CalendarIcon size={20} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Choose Service Date</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Quick Shortcuts */}
          <View style={styles.quickPillsRow}>
            <TouchableOpacity
              style={[
                styles.quickPill,
                tempSelectedDate === new Date().toISOString().split('T')[0] && styles.activeQuickPill
              ]}
              onPress={() => handleQuickSelect(0)}
            >
              <Text
                style={[
                  styles.quickPillText,
                  tempSelectedDate === new Date().toISOString().split('T')[0] &&
                    styles.activeQuickPillText
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickPill,
                tempSelectedDate ===
                  new Date(Date.now() + 86400000).toISOString().split('T')[0] &&
                  styles.activeQuickPill
              ]}
              onPress={() => handleQuickSelect(1)}
            >
              <Text
                style={[
                  styles.quickPillText,
                  tempSelectedDate ===
                    new Date(Date.now() + 86400000).toISOString().split('T')[0] &&
                    styles.activeQuickPillText
                ]}
              >
                Tomorrow
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickPill,
                tempSelectedDate ===
                  new Date(Date.now() + 172800000).toISOString().split('T')[0] &&
                  styles.activeQuickPill
              ]}
              onPress={() => handleQuickSelect(2)}
            >
              <Text
                style={[
                  styles.quickPillText,
                  tempSelectedDate ===
                    new Date(Date.now() + 172800000).toISOString().split('T')[0] &&
                    styles.activeQuickPillText
                ]}
              >
                In 2 Days
              </Text>
            </TouchableOpacity>
          </View>

          {/* Month Navigator */}
          <View style={styles.monthNavRow}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              style={styles.monthNavBtn}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.monthNavTitle}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>

            <TouchableOpacity
              onPress={handleNextMonth}
              style={styles.monthNavBtn}
              activeOpacity={0.7}
            >
              <ChevronRight size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Days of Week Header */}
          <View style={styles.weekDaysRow}>
            {DAYS_OF_WEEK.map((dw) => (
              <Text key={dw} style={styles.weekDayText}>
                {dw}
              </Text>
            ))}
          </View>

          {/* Calendar Day Grid */}
          <View style={styles.daysGrid}>
            {daysInMonth.map((item, idx) => {
              if (!item.day) {
                return <View key={`blank-${idx}`} style={styles.emptyDayCell} />;
              }

              const isSelected = tempSelectedDate === item.dateStr;

              return (
                <TouchableOpacity
                  key={item.dateStr}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDayCell,
                    item.isToday && !isSelected && styles.todayDayCell
                  ]}
                  onPress={() => {
                    if (!item.isPast) {
                      setTempSelectedDate(item.dateStr);
                    }
                  }}
                  disabled={item.isPast}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      item.isPast && styles.pastDayText,
                      item.isToday && !isSelected && styles.todayDayText
                    ]}
                  >
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Date Summary & Confirm Bar */}
          <View style={styles.footerBar}>
            <View style={styles.selectedDateInfo}>
              <Text style={styles.selectedDateLabel}>Selected Date:</Text>
              <Text style={styles.selectedDateValue}>{formattedSelectedDisplay}</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Set Date</Text>
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
    paddingBottom: 14,
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
  quickPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 14
  },
  quickPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  activeQuickPill: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  activeQuickPillText: {
    color: COLORS.primary,
    fontWeight: '800'
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8
  },
  monthNavBtn: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  monthNavTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radiusSm,
    marginBottom: 8
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  emptyDayCell: {
    width: 40,
    height: 40,
    margin: 2
  },
  dayCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    margin: 2
  },
  selectedDayCell: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm
  },
  todayDayCell: {
    borderWidth: 1.5,
    borderColor: COLORS.secondary
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  todayDayText: {
    color: COLORS.secondary,
    fontWeight: '800'
  },
  pastDayText: {
    color: '#CBD5E1',
    fontWeight: '400'
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
    marginTop: 16
  },
  selectedDateInfo: {
    flex: 1
  },
  selectedDateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  selectedDateValue: {
    fontSize: 14,
    fontWeight: '800',
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

export default CalendarPickerModal;
