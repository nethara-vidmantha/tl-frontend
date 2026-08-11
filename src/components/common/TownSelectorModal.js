import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput
} from 'react-native';
import { MapPin, Search, ChevronRight, ArrowLeft, X, Check, Building2, Compass } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_HIERARCHY,
  searchSriLankaLocations
} from '../../constants/sriLankaLocations';
import { DISTRICT_COORDINATES } from '../../constants/districts';

const TownSelectorModal = ({ visible, onClose, onSelectTown, title = 'Select Your Town' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Reset navigation when opened
  const handleClose = () => {
    setSearchQuery('');
    setSelectedProvince(null);
    setSelectedDistrict(null);
    onClose();
  };

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchSriLankaLocations(searchQuery);
  }, [searchQuery]);

  const handleSelectResult = (item) => {
    const coords = DISTRICT_COORDINATES[item.district] || DISTRICT_COORDINATES['Colombo'];
    onSelectTown({
      town: item.town,
      district: item.district,
      province: item.province,
      address: `${item.town}, ${item.district}`,
      latitude: coords.latitude,
      longitude: coords.longitude
    });
    handleClose();
  };

  const handleSelectDirectTown = (townName) => {
    const coords = DISTRICT_COORDINATES[selectedDistrict] || DISTRICT_COORDINATES['Colombo'];
    onSelectTown({
      town: townName,
      district: selectedDistrict,
      province: selectedProvince,
      address: `${townName}, ${selectedDistrict}`,
      latitude: coords.latitude,
      longitude: coords.longitude
    });
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {selectedDistrict ? (
                <TouchableOpacity onPress={() => setSelectedDistrict(null)} style={styles.backBtn}>
                  <ArrowLeft size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              ) : selectedProvince ? (
                <TouchableOpacity onPress={() => setSelectedProvince(null)} style={styles.backBtn}>
                  <ArrowLeft size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              ) : null}
              <Text style={styles.headerTitle}>{title}</Text>
            </View>

            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Breadcrumbs Navigation */}
          {(selectedProvince || selectedDistrict) && (
            <View style={styles.breadcrumbsRow}>
              <TouchableOpacity onPress={() => { setSelectedProvince(null); setSelectedDistrict(null); }}>
                <Text style={styles.breadLink}>Sri Lanka</Text>
              </TouchableOpacity>
              <ChevronRight size={12} color={COLORS.textMuted} />

              {selectedProvince && (
                <TouchableOpacity onPress={() => setSelectedDistrict(null)}>
                  <Text style={[styles.breadLink, !selectedDistrict && styles.breadActive]}>
                    {selectedProvince}
                  </Text>
                </TouchableOpacity>
              )}

              {selectedDistrict && (
                <>
                  <ChevronRight size={12} color={COLORS.textMuted} />
                  <Text style={[styles.breadLink, styles.breadActive]}>{selectedDistrict}</Text>
                </>
              )}
            </View>
          )}

          {/* Real-Time Search Bar */}
          <View style={styles.searchBarBox}>
            <Search size={18} color={COLORS.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search any town, district or province..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content Body */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* If user is typing in Search Bar */}
            {searchQuery.trim().length > 0 ? (
              <View>
                <Text style={styles.sectionHeading}>Search Results ({searchResults.length})</Text>
                {searchResults.length === 0 ? (
                  <View style={styles.emptySearch}>
                    <Text style={styles.emptyText}>No towns found matching "{searchQuery}".</Text>
                  </View>
                ) : (
                  searchResults.map((res, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.itemRow}
                      onPress={() => handleSelectResult(res)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.pinCircle}>
                        <MapPin size={16} color={COLORS.primary} />
                      </View>
                      <View style={styles.itemTextCol}>
                        <Text style={styles.itemTitle}>{res.town}</Text>
                        <Text style={styles.itemSub}>{res.district} District • {res.province} Province</Text>
                      </View>
                      <ChevronRight size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ) : !selectedProvince ? (
              /* Step 1: Province Selection */
              <View>
                <Text style={styles.stepPrompt}>Step 1: Select Your Province</Text>
                {SRI_LANKA_PROVINCES.map((prov) => {
                  const districtCount = Object.keys(SRI_LANKA_HIERARCHY[prov] || {}).length;
                  return (
                    <TouchableOpacity
                      key={prov}
                      style={styles.itemRow}
                      onPress={() => setSelectedProvince(prov)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.pinCircle}>
                        <Compass size={18} color={COLORS.primary} />
                      </View>
                      <View style={styles.itemTextCol}>
                        <Text style={styles.itemTitle}>{prov} Province</Text>
                        <Text style={styles.itemSub}>{districtCount} Districts included</Text>
                      </View>
                      <ChevronRight size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : !selectedDistrict ? (
              /* Step 2: District Selection */
              <View>
                <Text style={styles.stepPrompt}>Step 2: Select District in {selectedProvince} Province</Text>
                {Object.keys(SRI_LANKA_HIERARCHY[selectedProvince] || {}).map((dist) => {
                  const townsCount = (SRI_LANKA_HIERARCHY[selectedProvince][dist] || []).length;
                  return (
                    <TouchableOpacity
                      key={dist}
                      style={styles.itemRow}
                      onPress={() => setSelectedDistrict(dist)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.pinCircle}>
                        <Building2 size={18} color={COLORS.primary} />
                      </View>
                      <View style={styles.itemTextCol}>
                        <Text style={styles.itemTitle}>{dist} District</Text>
                        <Text style={styles.itemSub}>{townsCount} Towns & Municipalities</Text>
                      </View>
                      <ChevronRight size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* Step 3: Town Selection */
              <View>
                <Text style={styles.stepPrompt}>Step 3: Select Your Town in {selectedDistrict}</Text>
                {(SRI_LANKA_HIERARCHY[selectedProvince][selectedDistrict] || []).map((town, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.itemRow}
                    onPress={() => handleSelectDirectTown(town)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pinCircle}>
                      <MapPin size={16} color={COLORS.secondaryDark} />
                    </View>
                    <View style={styles.itemTextCol}>
                      <Text style={styles.itemTitle}>{town}</Text>
                      <Text style={styles.itemSub}>{selectedDistrict} • {selectedProvince} Province</Text>
                    </View>
                    <Check size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '88%',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: {
    marginRight: 10,
    padding: 4
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  closeBtn: {
    padding: 6
  },
  breadcrumbsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 6
  },
  breadLink: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600'
  },
  breadActive: {
    color: COLORS.primary,
    fontWeight: '800'
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 10
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 30
  },
  stepPrompt: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 10
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusMd,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
    ...SHADOWS.sm
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  itemTextCol: {
    flex: 1
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  itemSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 30
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted
  }
});

export default TownSelectorModal;
