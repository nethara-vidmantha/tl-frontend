import { Linking, Platform, Alert } from 'react-native';

/**
 * Open Turn-by-Turn GPS Navigation directly to Customer / Destination Location
 * Works with Google Maps, Apple Maps, and Waze (PickMe / Uber Driver Style)
 */
export const openTurnByTurnDirections = async (latitude, longitude, destinationName = 'Customer Location') => {
  if (!latitude || !longitude) {
    Alert.alert('Location Error', 'Destination GPS coordinates are not available.');
    return;
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const googleMapsAppUrl = Platform.select({
    ios: `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
    android: `google.navigation:q=${lat},${lng}&mode=d`
  });

  const webGoogleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  const appleMapsUrl = `maps://?daddr=${lat},${lng}&dirflg=d`;

  try {
    if (Platform.OS === 'ios') {
      const canOpenGoogle = await Linking.canOpenURL(googleMapsAppUrl);
      if (canOpenGoogle) {
        await Linking.openURL(googleMapsAppUrl);
        return;
      }
      const canOpenApple = await Linking.canOpenURL(appleMapsUrl);
      if (canOpenApple) {
        await Linking.openURL(appleMapsUrl);
        return;
      }
    } else if (Platform.OS === 'android') {
      const canOpenGoogle = await Linking.canOpenURL(googleMapsAppUrl);
      if (canOpenGoogle) {
        await Linking.openURL(googleMapsAppUrl);
        return;
      }
    }

    // Universal fallback
    await Linking.openURL(webGoogleMapsUrl);
  } catch (err) {
    console.warn('Could not launch native map, opening browser maps:', err);
    Linking.openURL(webGoogleMapsUrl);
  }
};

/**
 * Calculate estimated driving time (ETA) based on distance in km
 */
export const getEstimatedTravelTime = (distanceKm) => {
  if (!distanceKm || isNaN(distanceKm)) return '10 mins';
  // Average urban Sri Lankan driving speed ~25 km/h
  const minutes = Math.max(3, Math.round((distanceKm / 25) * 60));
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours} hr ${remainingMins} mins`;
};
