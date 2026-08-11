import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { MapPin, ArrowLeft, RefreshCw, SlidersHorizontal } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { workerApi } from '../../api';
import MapViewWrapper from '../../components/common/MapViewWrapper';
import LocationPickerModal from '../../components/common/LocationPickerModal';
import Header from '../../components/common/Header';

const MapScreen = ({ navigation, route }) => {
  const { selectedLocation } = useLocation();
  const { t } = useLanguage();

  const [workers, setWorkers] = useState(route.params?.workers || []);
  const [loading, setLoading] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    fetchMapWorkers();
  }, [selectedLocation.district]);

  const fetchMapWorkers = async () => {
    try {
      setLoading(true);
      const res = await workerApi.getWorkers({
        district: selectedLocation.district,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude
      });
      if (res.data) {
        setWorkers(res.data);
      }
    } catch (err) {
      console.warn('Map worker fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('map.title')}
        subtitle={`${selectedLocation.district} (${workers.length} available)`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.changeLocHeaderBtn}
            onPress={() => setLocationModalVisible(true)}
          >
            <MapPin size={14} color="#FFFFFF" />
            <Text style={styles.changeLocHeaderText}>Change Area</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.mapContainer}>
        <MapViewWrapper
          centerCoordinate={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude
          }}
          districtName={selectedLocation.district}
          workers={workers}
          onSelectWorker={(worker) => {}}
          onViewProfile={(worker) => navigation.navigate('WorkerProfile', { workerId: worker._id })}
          onBookWorker={(worker) => navigation.navigate('BookService', { worker })}
        />
      </View>

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
  mapContainer: {
    flex: 1
  },
  changeLocHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusFull,
    marginLeft: 6
  },
  changeLocHeaderText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4
  }
});

export default MapScreen;
