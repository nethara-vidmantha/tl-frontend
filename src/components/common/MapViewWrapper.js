import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin, Navigation, Star, ShieldCheck, Clock, Phone, ChevronRight, Compass, Route } from 'lucide-react-native';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import Badge from './Badge';
import Button from './Button';
import { openTurnByTurnDirections, getEstimatedTravelTime } from '../../utils/navigationHelper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Production PickMe / Uber Style MapView for TaskLanka
 * Uses high-performance OpenStreetMap / CartoDB Street Tiles with Custom Worker Markers,
 * Live Pricing Bubbles (LKR/hr), Customer Radar Beacon, Route Polylines, and Turn-by-Turn Navigation.
 */
const MapViewWrapper = ({
  centerCoordinate = { latitude: 6.9271, longitude: 79.8612 },
  districtName = 'Colombo',
  workers = [],
  selectedWorker = null,
  showRoute = true,
  onSelectWorker,
  onBookWorker,
  onViewProfile,
  style
}) => {
  const [activeWorker, setActiveWorker] = useState(
    selectedWorker || (workers.length > 0 ? workers[0] : null)
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef(null);

  useEffect(() => {
    if (selectedWorker) {
      setActiveWorker(selectedWorker);
    } else if (workers.length > 0 && !activeWorker) {
      setActiveWorker(workers[0]);
    }
  }, [selectedWorker, workers]);

  const handleMarkerClickFromWeb = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_WORKER') {
        const found = workers.find((w) => String(w._id) === String(data.workerId));
        if (found) {
          setActiveWorker(found);
          if (onSelectWorker) onSelectWorker(found);
        }
      }
    } catch (e) {
      console.warn('Map message parse error:', e);
    }
  };

  // Generate self-contained Leaflet HTML with CartoDB Voyager tiles
  const generateMapHtml = () => {
    const lat = centerCoordinate?.latitude || 6.9271;
    const lng = centerCoordinate?.longitude || 79.8612;

    const workersDataJson = JSON.stringify(
      workers.map((w) => ({
        id: w._id,
        name: w.userId?.name || w.name || 'Service Pro',
        category: w.category || 'plumbing',
        rate: w.hourlyRate || w.pricing?.hourlyRate || 1500,
        rating: w.rating || 5.0,
        lat: w.latitude || lat + (Math.random() - 0.5) * 0.03,
        lng: w.longitude || lng + (Math.random() - 0.5) * 0.03,
        verified: !!w.verified,
        image: w.profileImage || w.userId?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      }))
    );

    const activeWorkerId = activeWorker ? String(activeWorker._id) : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #E8EDF2; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; }
    
    /* Customer Pickup Beacon (Uber/PickMe Style) */
    .customer-beacon-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .customer-pulse {
      position: absolute;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(13, 92, 117, 0.25);
      border: 2px solid #0D5C75;
      animation: pulseAnim 2s infinite ease-out;
      pointer-events: none;
    }
    @keyframes pulseAnim {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .customer-dot {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #0D5C75;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      z-index: 2;
    }
    .customer-pill {
      background: #0D5C75;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 12px;
      margin-top: 4px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      letter-spacing: 0.3px;
    }

    /* Worker Marker Pin (PickMe / Uber Style) */
    .worker-marker-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transform: translate3d(0,0,0);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .worker-marker-wrapper:hover, .worker-marker-wrapper.active {
      transform: scale(1.15);
      z-index: 1000 !important;
    }
    .price-callout {
      background: #0D5C75;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 12px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
      white-space: nowrap;
      margin-bottom: 3px;
      border: 1px solid rgba(255,255,255,0.4);
    }
    .worker-marker-wrapper.active .price-callout {
      background: #F59E0B;
      color: #1E293B;
      border-color: #D97706;
    }
    .worker-avatar-box {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 3px solid #0D5C75;
      background: #FFFFFF;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      position: relative;
    }
    .worker-marker-wrapper.active .worker-avatar-box {
      border-color: #F59E0B;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.4), 0 6px 16px rgba(0,0,0,0.4);
    }
    .worker-avatar-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .verified-badge-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #10B981;
      border: 2px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 8px;
      font-weight: bold;
    }
    .marker-triangle {
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 8px solid #0D5C75;
      margin-top: -1px;
    }
    .worker-marker-wrapper.active .marker-triangle {
      border-top-color: #F59E0B;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    var customerLat = ${lat};
    var customerLng = ${lng};
    var workersList = ${workersDataJson};
    var activeId = "${activeWorkerId}";

    // Initialize Leaflet Map with smooth inertia
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([customerLat, customerLng], 13);

    // High-resolution CartoDB Voyager street map tiles (Fast & Crystal Clear)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Add Customer Pickup / Service Pin
    var customerIcon = L.divIcon({
      className: '',
      html: '<div class="customer-beacon-wrapper"><div class="customer-pulse"></div><div class="customer-dot"></div><div class="customer-pill">📍 Service Location</div></div>',
      iconSize: [120, 60],
      iconAnchor: [60, 30]
    });
    L.marker([customerLat, customerLng], { icon: customerIcon, zIndexOffset: 500 }).addTo(map);

    var markersMap = {};
    var routePolyline = null;

    // Draw route line to active worker
    function drawRoute(workerLat, workerLng) {
      if (routePolyline) {
        map.removeLayer(routePolyline);
      }
      routePolyline = L.polyline([
        [customerLat, customerLng],
        [workerLat, workerLng]
      ], {
        color: '#0D5C75',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(map);
    }

    // Add Worker Markers with Real Hourly Prices
    workersList.forEach(function(w) {
      var isActive = (String(w.id) === activeId);
      var verifiedHtml = w.verified ? '<div class="verified-badge-dot">✓</div>' : '';

      var iconHtml = '<div class="worker-marker-wrapper ' + (isActive ? 'active' : '') + '" id="marker-' + w.id + '">' +
        '<div class="price-callout">LKR ' + w.rate + '/hr</div>' +
        '<div class="worker-avatar-box">' +
          '<img src="' + w.image + '" />' +
          verifiedHtml +
        '</div>' +
        '<div class="marker-triangle"></div>' +
      '</div>';

      var workerIcon = L.divIcon({
        className: '',
        html: iconHtml,
        iconSize: [90, 80],
        iconAnchor: [45, 80]
      });

      var marker = L.marker([w.lat, w.lng], { icon: workerIcon }).addTo(map);
      markersMap[w.id] = marker;

      if (isActive) {
        drawRoute(w.lat, w.lng);
      }

      marker.on('click', function() {
        // Send message to React Native
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SELECT_WORKER',
            workerId: w.id
          }));
        }
        
        // Pan smoothly to selected worker
        map.flyTo([w.lat, w.lng], 14, { duration: 0.8 });
        drawRoute(w.lat, w.lng);
      });
    });

    // Auto-fit bounds to show customer and workers nicely
    if (workersList.length > 0) {
      var bounds = L.latLngBounds([[customerLat, customerLng]]);
      workersList.forEach(function(w) {
        bounds.extend([w.lat, w.lng]);
      });
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  </script>
</body>
</html>
    `;
  };

  const handleOpenTurnByTurn = () => {
    if (!activeWorker) return;
    openTurnByTurnDirections(
      activeWorker.latitude || centerCoordinate.latitude,
      activeWorker.longitude || centerCoordinate.longitude,
      activeWorker.userId?.name || activeWorker.name
    );
  };

  const distanceVal = activeWorker?.distance !== undefined && activeWorker?.distance !== null
    ? activeWorker.distance
    : 2.4;

  const eta = getEstimatedTravelTime(distanceVal);

  return (
    <View style={[styles.container, style]}>
      {/* Real Interactive Street MapView */}
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={generateMapHtml()}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="TaskLanka Interactive Map"
        />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: generateMapHtml() }}
          style={styles.webView}
          onMessage={handleMarkerClickFromWeb}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onLoadEnd={() => setMapLoaded(true)}
        />
      )}

      {/* District & Location Badge Overlay */}
      <View style={styles.topBadgeRow}>
        <View style={styles.locationPill}>
          <MapPin size={14} color={COLORS.primary} />
          <Text style={styles.locationPillText}>
            {districtName} ({workers.length} Pros Nearby)
          </Text>
        </View>

        <TouchableOpacity
          style={styles.directionsQuickBtn}
          onPress={handleOpenTurnByTurn}
          activeOpacity={0.85}
        >
          <Compass size={14} color="#FFFFFF" />
          <Text style={styles.directionsQuickText}>GPS Nav</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Worker Preview Sheet (PickMe / Uber Style) */}
      {activeWorker && (
        <View style={styles.bottomSheet}>
          {/* Top Sheet Drag Indicator */}
          <View style={styles.sheetHandle} />

          <View style={styles.workerCard}>
            <Image
              source={{
                uri:
                  activeWorker.profileImage ||
                  activeWorker.userId?.profileImage ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
              }}
              style={styles.sheetAvatar}
            />

            <View style={styles.sheetInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.sheetName} numberOfLines={1}>
                  {activeWorker.userId?.name || activeWorker.name}
                </Text>
                {activeWorker.verified && (
                  <Badge label="Verified" variant="success" size="sm" />
                )}
              </View>

              <Text style={styles.sheetCategory}>
                {(activeWorker.category || 'plumbing').toUpperCase()} • {activeWorker.district}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.ratingBadge}>
                  <Star size={12} color={COLORS.secondary} fill={COLORS.secondary} />
                  <Text style={styles.ratingText}>
                    {Number(activeWorker.rating || 5.0).toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.etaText}>
                  🚗 {eta} • {distanceVal} km away
                </Text>
              </View>
            </View>

            {/* Hourly Rate Box */}
            <View style={styles.sheetPriceBox}>
              <Text style={styles.priceLabel}>Hourly Rate</Text>
              <Text style={styles.priceValue}>
                LKR {activeWorker.hourlyRate || activeWorker.pricing?.hourlyRate || 1500}
              </Text>
              <Text style={styles.priceUnit}>per hour</Text>
            </View>
          </View>

          {/* Action Buttons: Directions, View Profile, Book Service */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={handleOpenTurnByTurn}
              activeOpacity={0.8}
            >
              <Route size={16} color={COLORS.primary} />
              <Text style={styles.navBtnText}>Directions</Text>
            </TouchableOpacity>

            <Button
              title="View Profile"
              variant="outline"
              size="sm"
              style={{ flex: 1, marginRight: 8 }}
              onPress={() => onViewProfile && onViewProfile(activeWorker)}
            />

            <Button
              title="Book Service"
              variant="primary"
              size="sm"
              style={{ flex: 1.4 }}
              onPress={() => onBookWorker && onBookWorker(activeWorker)}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EDF2',
    position: 'relative'
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  topBadgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusFull,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  locationPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 6
  },
  directionsQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusFull,
    ...SHADOWS.md
  },
  directionsQuickText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 14,
    ...SHADOWS.lg,
    zIndex: 30,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  sheetAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  sheetInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sheetName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 6
  },
  sheetCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 8
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 3
  },
  etaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  sheetPriceBox: {
    alignItems: 'flex-end',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusMd,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  priceLabel: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '700'
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary
  },
  priceUnit: {
    fontSize: 9,
    color: COLORS.textMuted
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4
  }
});

export default MapViewWrapper;
