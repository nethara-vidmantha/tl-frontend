import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView
} from 'react-native';
import { MapPin, Navigation, X, Check, Search, ChevronRight, Compass } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from './Button';
import TownSelectorModal from './TownSelectorModal';

const LocationPickerModal = ({ visible, onClose }) => {
  const { selectedLocation, setCustomLocation, useCurrentGps, gpsLocation } = useLocation();
  const { t } = useLanguage();

  const [townModalVisible, setTownModalVisible] = useState(false);
  const [chosenTown, setChosenTown] = useState(selectedLocation.district || 'Colombo');
  const [chosenDistrict, setChosenDistrict] = useState(selectedLocation.district || 'Colombo');
  const [customAddress, setCustomAddress] = useState(selectedLocation.address || 'Colombo, Sri Lanka');

  const handleSelectTown = (locationData) => {
    setChosenTown(locationData.town);
    setChosenDistrict(locationData.district);
    setCustomAddress(`${locationData.town}, ${locationData.district}`);
    setCustomLocation(locationData.district, `${locationData.town}, ${locationData.district}`);
    onClose();
  };

  const handleUseGps = () => {
    useCurrentGps();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{t('home.locationLabel')}</Text>
              <Text style={styles.modalSubtitle}>
                Choose your service location in Sri Lanka
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick Option 1: Use Current GPS */}
          <TouchableOpacity style={styles.gpsOption} onPress={handleUseGps} activeOpacity={0.8}>
            <View style={styles.gpsIconBox}>
              <Navigation size={18} color="#FFFFFF" />
            </View>
            <View style={styles.gpsTextContainer}>
              <Text style={styles.gpsTitle}>{t('home.currentGps')}</Text>
              <Text style={styles.gpsSub}>{gpsLocation.address || 'Colombo, Sri Lanka'}</Text>
            </View>
            {!selectedLocation.isCustom && <Check size={20} color={COLORS.primary} />}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR SELECT TOWN BY PROVINCE & SEARCH</Text>
            <View style={styles.line} />
          </View>

          {/* Quick Option 2: Province -> District -> Town Selector Button */}
          <TouchableOpacity
            style={styles.townSearchBtn}
            onPress={() => setTownModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.townSearchIcon}>
              <Compass size={20} color={COLORS.primary} />
            </View>
            <View style={styles.townSearchTextCol}>
              <Text style={styles.townSearchTitle}>Select Town in Sri Lanka</Text>
              <Text style={styles.townSearchSub}>
                Browse 9 Provinces ➔ 25 Districts ➔ 200+ Towns or Search
              </Text>
            </View>
            <ChevronRight size={18} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Current Active Location Display */}
          <View style={styles.currentActiveBox}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.currentActiveText}>
              Active: <Text style={{ fontWeight: '800' }}>{selectedLocation.district}</Text> ({selectedLocation.address})
            </Text>
          </View>
        </View>
      </View>

      {/* Hierarchical Province -> District -> Town Modal */}
      <TownSelectorModal
        visible={townModalVisible}
        onClose={() => setTownModalVisible(false)}
        onSelectTown={handleSelectTown}
        title="Choose Province & Town"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  closeBtn: {
    padding: 6,
    borderRadius: SIZES.radiusFull,
    backgroundColor: '#F1F5F9'
  },
  gpsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginBottom: 14
  },
  gpsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  gpsTextContainer: {
    flex: 1
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary
  },
  gpsSub: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0'
  },
  orText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginHorizontal: 8,
    letterSpacing: 0.5
  },
  townSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: SIZES.radiusLg,
    padding: 14,
    ...SHADOWS.sm
  },
  townSearchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  townSearchTextCol: {
    flex: 1
  },
  townSearchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  townSearchSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  currentActiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: SIZES.radiusMd,
    marginTop: 14
  },
  currentActiveText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginLeft: 8,
    flex: 1
  }
});

export default LocationPickerModal;
