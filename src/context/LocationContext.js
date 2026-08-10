import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Location from 'expo-location';
import { DISTRICT_COORDINATES } from '../constants/districts';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [gpsLocation, setGpsLocation] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
    address: 'Colombo, Sri Lanka',
    district: 'Colombo'
  });

  // Active service location (User can override this to any town e.g. Matara, Kandy, Jaffna like PickMe/Uber)
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
    address: 'Colombo, Sri Lanka',
    district: 'Colombo',
    isCustom: false
  });

  const [hasPermission, setHasPermission] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    requestAndFetchLocation();
  }, []);

  const requestAndFetchLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

        const lat = location.coords.latitude;
        const lon = location.coords.longitude;

        // Try reverse geocode
        let resolvedDistrict = 'Colombo';
        let resolvedAddress = 'Current GPS Location';
        try {
          const reverse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (reverse && reverse.length > 0) {
            const place = reverse[0];
            resolvedDistrict = place.subregion || place.city || place.region || 'Colombo';
            resolvedAddress = `${place.name || place.street || ''} ${place.city || ''}`.trim() || 'Current GPS Location';
          }
        } catch (e) {
          // ignore reverse geocode error
        }

        const newGps = {
          latitude: lat,
          longitude: lon,
          address: resolvedAddress,
          district: resolvedDistrict
        };

        setGpsLocation(newGps);
        if (!selectedLocation.isCustom) {
          setSelectedLocation({
            ...newGps,
            isCustom: false
          });
        }
      }
    } catch (err) {
      console.log('Location detection notice (defaulting to Colombo):', err.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  /**
   * User manually switches service location (e.g. from Colombo to Matara)
   */
  const setCustomLocation = (district, customAddress = '') => {
    const coords = DISTRICT_COORDINATES[district] || DISTRICT_COORDINATES['Colombo'];
    const address = customAddress || `${district}, Sri Lanka`;

    setSelectedLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      address,
      district,
      isCustom: true
    });
  };

  /**
   * Revert back to GPS coordinates
   */
  const useCurrentGps = () => {
    setSelectedLocation({
      ...gpsLocation,
      isCustom: false
    });
  };

  return (
    <LocationContext.Provider
      value={{
        gpsLocation,
        selectedLocation,
        hasPermission,
        loadingLocation,
        setCustomLocation,
        useCurrentGps,
        refreshGps: requestAndFetchLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
