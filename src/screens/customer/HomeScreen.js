import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  StatusBar
} from 'react-native';
import {
  MapPin,
  Search,
  ChevronRight,
  Map as MapIcon,
  SlidersHorizontal,
  Bell,
  Sparkles,
  Navigation,
  X,
  Wrench,
  Zap,
  Stethoscope,
  GraduationCap,
  Hammer,
  TreePine,
  Sparkle,
  Fan,
  Car,
  Paintbrush
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { workerApi } from '../../api';
import CategoryCard from '../../components/customer/CategoryCard';
import WorkerCard from '../../components/customer/WorkerCard';
import LocationPickerModal from '../../components/common/LocationPickerModal';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';

// Comprehensive Suggestion Registry with Keywords, Typos, and Sinhala/Tamil
const SEARCH_SUGGESTIONS_DB = [
  { id: 'plumbing', title: 'Plumber', subtitle: 'Pipes, Leaks, Taps & Bathroom fittings', categoryId: 'plumbing', icon: '🔧', aliases: ['plumber', 'plumbing', 'pumbler', 'pumber', 'pipe', 'pipes', 'tap', 'leak', 'water', 'නල', 'ජල'] },
  { id: 'electrical', title: 'Electrician', subtitle: 'Wiring, Sockets, Lighting & Circuit breaker', categoryId: 'electrical', icon: '⚡', aliases: ['electrician', 'electric', 'electrical', 'wire', 'wiring', 'socket', 'light', 'fan', 'විදුලි'] },
  { id: 'doctor', title: 'Doctor / Medical', subtitle: 'General physician, First aid, Home visit', categoryId: 'doctor', icon: '🩺', aliases: ['doctor', 'doc', 'medical', 'physician', 'health', 'clinic', 'medicine', 'දොස්තර', 'වෛද්‍ය'] },
  { id: 'teaching', title: 'Teacher / Tutor', subtitle: 'Tuition, O/L, A/L, Languages & Math', categoryId: 'teaching', icon: '📚', aliases: ['teacher', 'tutor', 'tuition', 'teach', 'maths', 'science', 'english', 'ගුරු', 'පන්ති'] },
  { id: 'caregiver', title: 'Caregiver / Nurse', subtitle: 'Elderly care, Patient support & Babysitting', categoryId: 'caregiver', icon: '🤲', aliases: ['caregiver', 'nurse', 'elderly', 'baby', 'care', 'patient', 'හෙද'] },
  { id: 'carpentry', title: 'Carpenter', subtitle: 'Furniture, Woodwork, Doors & Locks', categoryId: 'carpentry', icon: '🪚', aliases: ['carpenter', 'carpentry', 'wood', 'furniture', 'door', 'lock', 'වඩුවා'] },
  { id: 'gardening', title: 'Gardener', subtitle: 'Lawn mowing, Tree trimming & Landscaping', categoryId: 'gardening', icon: '🌿', aliases: ['gardener', 'gardening', 'grass', 'lawn', 'plants', 'tree', 'වත්ත'] },
  { id: 'cleaning', title: 'Cleaner', subtitle: 'Deep cleaning, Home, Office & Water tank', categoryId: 'cleaning', icon: '🧹', aliases: ['cleaner', 'cleaning', 'clean', 'maid', 'tank', 'wash', 'පිරිසිදු'] },
  { id: 'ac_repair', title: 'AC Technician', subtitle: 'Air conditioning service, Gas refill & repair', categoryId: 'ac_repair', icon: '❄️', aliases: ['ac', 'aircon', 'cooler', 'gas', 'technician', 'cooling'] },
  { id: 'mechanic', title: 'Mechanic', subtitle: 'Auto repair, Bike, Car & Battery jumpstart', categoryId: 'mechanic', icon: '🚗', aliases: ['mechanic', 'auto', 'car', 'bike', 'motor', 'vehicle', 'battery'] },
  { id: 'painting', title: 'Painter', subtitle: 'Wall painting, Waterproofing & Colour wash', categoryId: 'painting', icon: '🎨', aliases: ['painter', 'paint', 'painting', 'wall', 'colour', 'තීන්ත'] }
];

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { selectedLocation } = useLocation();
  const { t } = useLanguage();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, [selectedLocation.district, selectedCategory, searchQuery]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const params = {
        district: selectedLocation.district,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined
      };

      let res = await workerApi.getWorkers(params);
      let list = res.data || [];

      // If no workers found in selected district, fetch all Sri Lankan workers
      if (list.length === 0 && selectedLocation.district) {
        const fallbackRes = await workerApi.getWorkers({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        });
        if (fallbackRes.data && fallbackRes.data.length > 0) {
          list = fallbackRes.data;
        }
      }

      setWorkers(list);
    } catch (err) {
      console.warn('Failed to load workers:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkers();
  };

  const handleSelectCategory = (catId) => {
    if (selectedCategory === catId) {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(catId);
    }
  };

  // Real-time Auto-suggestions computation
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 1) return [];

    // Match categories and aliases
    const matchedCategories = SEARCH_SUGGESTIONS_DB.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const subtitleMatch = item.subtitle.toLowerCase().includes(q);
      const aliasMatch = item.aliases.some((alias) => alias.includes(q) || q.includes(alias));
      return titleMatch || subtitleMatch || aliasMatch;
    });

    // Match worker names in currently loaded list
    const matchedWorkers = workers
      .filter((w) => {
        const name = (w.userId?.name || w.name || '').toLowerCase();
        const skills = (w.skills || []).map((s) => s.toLowerCase()).join(' ');
        return name.includes(q) || skills.includes(q);
      })
      .map((w) => ({
        id: `worker-${w._id}`,
        title: w.userId?.name || w.name,
        subtitle: `${(w.category || 'Service Pro').toUpperCase()} • LKR ${w.hourlyRate || 1500}/hr`,
        categoryId: w.category,
        icon: '👤',
        isWorker: true,
        workerObj: w
      }));

    return [...matchedCategories, ...matchedWorkers.slice(0, 3)];
  }, [searchQuery, workers]);

  const handleApplySuggestion = (item) => {
    if (item.isWorker && item.workerObj) {
      navigation.navigate('WorkerProfile', { workerId: item.workerObj._id });
      setIsSearchFocused(false);
      return;
    }

    if (item.categoryId) {
      setSelectedCategory(item.categoryId);
    }
    setSearchQuery(item.title);
    setIsSearchFocused(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setIsSearchFocused(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Two-Tone Top Header */}
        <View style={styles.headerSection}>
          <View style={styles.userBar}>
            <View>
              <Text style={styles.greetingText}>
                {t('home.greeting')}, {user?.name ? user.name.split(' ')[0] : 'Customer'} 👋
              </Text>
              <Text style={styles.appTitle}>
                Task<Text style={{ color: COLORS.secondary }}>ලංකා</Text>
              </Text>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.8}
              >
                <Bell size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }}
                  style={styles.headerAvatar}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* PickMe / Uber Style Service Location Card */}
          <TouchableOpacity
            style={styles.locationSelectorCard}
            onPress={() => setLocationModalVisible(true)}
            activeOpacity={0.9}
          >
            <View style={styles.locIconCircle}>
              <MapPin size={18} color={COLORS.primary} />
            </View>

            <View style={styles.locTextContainer}>
              <View style={styles.locTagRow}>
                <Text style={styles.locTagLabel}>{t('home.locationLabel')}</Text>
                {selectedLocation.isCustom && (
                  <View style={styles.customBadge}>
                    <Text style={styles.customBadgeText}>Custom Pin</Text>
                  </View>
                )}
              </View>
              <Text style={styles.locDistrictText} numberOfLines={1}>
                {selectedLocation.district} District • {selectedLocation.address || 'Sri Lanka'}
              </Text>
            </View>

            <View style={styles.changeLocBtn}>
              <Text style={styles.changeLocText}>Change</Text>
              <ChevronRight size={14} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar with Auto-Suggestions Engine */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBox}>
            <Search size={18} color={COLORS.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
                <X size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Auto-Suggestions Elevated Dropdown */}
          {isSearchFocused && suggestions.length > 0 && (
            <View style={styles.suggestionsDropdown}>
              <View style={styles.suggestionsHeader}>
                <Sparkles size={12} color={COLORS.primary} />
                <Text style={styles.suggestionsHeaderText}>Suggested Services & Pros</Text>
              </View>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionRow}
                  onPress={() => handleApplySuggestion(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.suggestionIconBox}>
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  </View>
                  <View style={styles.suggestionTextCol}>
                    <Text style={styles.suggestionTitle}>{item.title}</Text>
                    <Text style={styles.suggestionSub} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <ChevronRight size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Interactive Map View CTA Banner */}
        <TouchableOpacity
          style={styles.mapBanner}
          onPress={() => navigation.navigate('Map', { workers, district: selectedLocation.district })}
          activeOpacity={0.9}
        >
          <View style={styles.mapBannerContent}>
            <View style={styles.mapIconCircle}>
              <MapIcon size={22} color="#FFFFFF" />
            </View>
            <View style={styles.mapBannerText}>
              <Text style={styles.mapBannerTitle}>Interactive Map View</Text>
              <Text style={styles.mapBannerSub}>
                Explore {workers.length} nearby workers with pins & hourly rates
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Categories Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.categories')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategory === cat.id}
              onPress={() => handleSelectCategory(cat.id)}
            />
          ))}
        </ScrollView>

        {/* Workers List Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithCount}>
            <Text style={styles.sectionTitle}>{t('home.nearbyPros')}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{workers.length}</Text>
            </View>
          </View>
          {(selectedCategory !== 'all' || searchQuery.length > 0) && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Text style={styles.clearFilterText}>Reset filter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Worker Cards Feed */}
        <View style={styles.workersFeed}>
          {loading ? (
            <LoadingSpinner message="Searching nearby verified professionals..." />
          ) : workers.length === 0 ? (
            <EmptyState
              icon={<MapPin size={40} color={COLORS.primary} />}
              title={`No workers found in ${selectedLocation.district}`}
              subtitle="Try switching to another category or select a different district (like Colombo or Matara)."
              actionButton={
                <TouchableOpacity
                  style={styles.switchDistrictBtn}
                  onPress={() => setLocationModalVisible(true)}
                >
                  <Text style={styles.switchDistrictText}>Select Another District</Text>
                </TouchableOpacity>
              }
            />
          ) : (
            workers.map((worker) => (
              <WorkerCard
                key={worker._id}
                worker={worker}
                onPress={() => navigation.navigate('WorkerProfile', { workerId: worker._id })}
                onBookPress={() => navigation.navigate('BookService', { worker })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Location Picker Modal (PickMe / Uber Style) */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    paddingBottom: 30
  },
  headerSection: {
    backgroundColor: COLORS.primary,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.md
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  greetingText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600'
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  locationSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: SIZES.radiusLg,
    ...SHADOWS.md
  },
  locIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  locTextContainer: {
    flex: 1
  },
  locTagRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locTagLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  customBadge: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6
  },
  customBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.secondaryDark
  },
  locDistrictText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2
  },
  changeLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusFull,
    marginLeft: 6
  },
  changeLocText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 2
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginTop: -14,
    zIndex: 100
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.md
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 10
  },
  clearBtn: {
    padding: 4
  },
  suggestionsDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.lg
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 4
  },
  suggestionsHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: SIZES.radiusMd
  },
  suggestionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  suggestionTextCol: {
    flex: 1
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  suggestionSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1
  },
  mapBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F766E', // Teal 700
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: SIZES.radiusLg,
    ...SHADOWS.sm
  },
  mapBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  mapIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  mapBannerText: {
    flex: 1
  },
  mapBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  mapBannerSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  titleWithCount: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  countBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
    marginLeft: 6
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger
  },
  categoriesScroll: {
    paddingLeft: 16,
    paddingRight: 6
  },
  workersFeed: {
    paddingHorizontal: 16,
    marginTop: 8
  },
  switchDistrictBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: SIZES.radiusMd,
    marginTop: 8
  },
  switchDistrictText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  }
});

export default HomeScreen;
