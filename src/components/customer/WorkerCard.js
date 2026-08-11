import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, ShieldCheck, MapPin, Clock, ArrowRight } from 'lucide-react-native';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import Badge from '../common/Badge';

const WorkerCard = ({ worker, onPress, onBookPress }) => {
  const name = worker.userId?.name || worker.name || 'Service Professional';
  const profileImage = worker.profileImage || worker.userId?.profileImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80';
  const category = (worker.category || 'Service').toUpperCase();
  const district = worker.district || 'Colombo';
  const rating = Number(worker.rating || 5.0).toFixed(1);
  const totalReviews = worker.totalReviews || 0;
  const hourlyRate = worker.hourlyRate || worker.pricing?.hourlyRate || 1500;
  const isAvailable = worker.availability !== false;
  const distance = worker.distance;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.topRow}>
        {/* Avatar with status indicator */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: profileImage }} style={styles.avatar} />
          <View style={[styles.statusDot, { backgroundColor: isAvailable ? COLORS.success : COLORS.danger }]} />
        </View>

        {/* Info Column */}
        <View style={styles.infoCol}>
          <View style={styles.nameBadgeRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {name}
            </Text>
            {worker.verified && (
              <ShieldCheck size={16} color={COLORS.primary} style={styles.verifiedIcon} />
            )}
          </View>

          <Text style={styles.categoryText}>{category}</Text>

          <View style={styles.ratingLocationRow}>
            <Star size={13} color={COLORS.secondary} fill={COLORS.secondary} />
            <Text style={styles.ratingText}>{rating}</Text>
            <Text style={styles.reviewsText}>({totalReviews})</Text>

            <Text style={styles.dotSeparator}>•</Text>

            <MapPin size={12} color={COLORS.textMuted} />
            <Text style={styles.districtText}>
              {district} {distance !== null && distance !== undefined ? `(${distance} km)` : ''}
            </Text>
          </View>
        </View>

        {/* Pricing Box */}
        <View style={styles.pricingBox}>
          <Text style={styles.priceAmount}>LKR {hourlyRate}</Text>
          <Text style={styles.pricePer}>per hour</Text>
          <Badge
            label={isAvailable ? 'Available' : 'Offline'}
            variant={isAvailable ? 'success' : 'danger'}
            size="sm"
            style={{ marginTop: 4 }}
          />
        </View>
      </View>

      {/* Skills Snippet */}
      {worker.skills && worker.skills.length > 0 && (
        <View style={styles.skillsRow}>
          {worker.skills.slice(0, 3).map((skill, i) => (
            <View key={i} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {worker.skills.length > 3 && (
            <Text style={styles.moreSkillsText}>+{worker.skills.length - 3} more</Text>
          )}
        </View>
      )}

      {/* Bottom CTA Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.workingHoursText}>
          {worker.workingHours?.start || '8:00 AM'} - {worker.workingHours?.end || '6:00 PM'}
        </Text>

        <TouchableOpacity
          style={[styles.bookBtn, !isAvailable && styles.bookBtnDisabled]}
          onPress={isAvailable ? onBookPress : null}
          activeOpacity={0.8}
        >
          <Text style={styles.bookBtnText}>
            {isAvailable ? 'Book Service' : 'Unavailable'}
          </Text>
          {isAvailable && <ArrowRight size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 12,
    ...SHADOWS.sm
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: COLORS.primary
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  infoCol: {
    flex: 1
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  nameText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginRight: 4
  },
  verifiedIcon: {
    marginLeft: 2
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2
  },
  ratingLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 3
  },
  reviewsText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 2
  },
  dotSeparator: {
    color: COLORS.textMuted,
    marginHorizontal: 4,
    fontSize: 10
  },
  districtText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 2
  },
  pricingBox: {
    alignItems: 'flex-end',
    marginLeft: 6
  },
  priceAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary
  },
  pricePer: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  skillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6
  },
  skillChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  skillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  moreSkillsText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic'
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider
  },
  workingHoursText: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusMd
  },
  bookBtnDisabled: {
    backgroundColor: '#94A3B8'
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});

export default WorkerCard;
