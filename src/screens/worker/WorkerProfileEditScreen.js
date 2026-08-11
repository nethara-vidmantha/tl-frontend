import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  DollarSign,
  MapPin,
  Briefcase,
  FileCheck,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Camera,
  User,
  Check,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { workerApi, authApi } from '../../api';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import TownSelectorModal from '../../components/common/TownSelectorModal';
import { pickImageFromDevice, uploadImageToSupabase } from '../../services/supabaseStorage';

const DEFAULT_WORKER_AVATAR = 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80';

const WorkerProfileEditScreen = ({ navigation }) => {
  const { user, logout, refreshUser } = useAuth();
  const workerProfile = user?.workerProfile;

  const [name, setName] = useState(user?.name || '');
  const [profileImageUri, setProfileImageUri] = useState(
    workerProfile?.profileImage || user?.profileImage || DEFAULT_WORKER_AVATAR
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [hourlyRate, setHourlyRate] = useState(String(workerProfile?.hourlyRate || 1500));
  
  // Location
  const [town, setTown] = useState('Havelock Town');
  const [district, setDistrict] = useState(workerProfile?.district || 'Colombo');
  const [province, setProvince] = useState('Western');
  const [address, setAddress] = useState(workerProfile?.address || 'Havelock Road, Colombo 05');
  const [townModalVisible, setTownModalVisible] = useState(false);

  const [experience, setExperience] = useState(String(workerProfile?.experience || 5));
  const [description, setDescription] = useState(workerProfile?.description || '');
  const [skills, setSkills] = useState((workerProfile?.skills || []).join(', '));
  const [nicNumber, setNicNumber] = useState(workerProfile?.nicVerification?.nicNumber || '198812345678');

  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async (fromCamera = false) => {
    try {
      setUploadingPhoto(true);
      const asset = await pickImageFromDevice(fromCamera);
      if (asset) {
        setProfileImageUri(asset.uri);
        const uploadedUrl = await uploadImageToSupabase(asset, 'avatars');
        if (uploadedUrl) {
          setProfileImageUri(uploadedUrl);
        }
      }
    } catch (e) {
      Alert.alert('Upload Error', 'Could not process selected image.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSelectTownFromModal = (locationData) => {
    setTown(locationData.town);
    setDistrict(locationData.district);
    setProvince(locationData.province);
    setAddress(locationData.address);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const avatarToSave = profileImageUri || DEFAULT_WORKER_AVATAR;

      // Update User details (Name, Photo)
      if (name.trim()) {
        await authApi.updateProfile({
          name: name.trim(),
          profileImage: avatarToSave
        });
      }

      // Update Worker specific details
      await workerApi.updateProfile({
        hourlyRate: Number(hourlyRate),
        district,
        address,
        experience: Number(experience),
        description,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        nicNumber,
        profileImage: avatarToSave
      });

      await refreshUser();
      Alert.alert('Success', 'Worker profile, photo & rates updated.');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const isVerified = workerProfile?.verified;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Professional Profile" showBack={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Verification Status Banner */}
        <View style={[styles.verifBanner, isVerified ? styles.verifOk : styles.verifPending]}>
          <ShieldCheck size={24} color={isVerified ? COLORS.success : COLORS.secondaryDark} />
          <View style={styles.verifTextCol}>
            <Text style={styles.verifTitle}>
              {isVerified ? '✓ Verified Professional Badge Active' : 'NIC Verification Pending Review'}
            </Text>
            <Text style={styles.verifSub}>
              {isVerified
                ? 'Your national credentials have been approved by TaskLanka administration.'
                : 'Your profile has been submitted for admin verification.'}
            </Text>
          </View>
        </View>

        {/* Identity & Photo Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 Personal & Profile Photo</Text>

          <View style={styles.photoUploadBox}>
            <View style={styles.avatarPreviewContainer}>
              <Image source={{ uri: profileImageUri }} style={styles.currentAvatar} />
              {uploadingPhoto && (
                <View style={styles.uploadSpinner}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                </View>
              )}
            </View>

            <View style={styles.photoActionsCol}>
              <Text style={styles.photoUploadTitle}>Profile Photo (Supabase Storage)</Text>
              <Text style={styles.photoUploadSub}>Upload a professional photo from your phone</Text>

              <View style={styles.photoBtnRow}>
                <TouchableOpacity
                  style={styles.galleryBtn}
                  onPress={() => handlePickPhoto(false)}
                  disabled={uploadingPhoto}
                  activeOpacity={0.8}
                >
                  <ImageIcon size={14} color={COLORS.primary} />
                  <Text style={styles.galleryBtnText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={() => handlePickPhoto(true)}
                  disabled={uploadingPhoto}
                  activeOpacity={0.8}
                >
                  <Camera size={14} color="#FFFFFF" />
                  <Text style={styles.cameraBtnText}>Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Input
            label="Full Name / Display Name"
            placeholder="e.g. Saman Kumara"
            value={name}
            onChangeText={setName}
            icon={<User size={18} color={COLORS.primary} />}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Rate Setting Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💰 Hourly Rate Settings</Text>
          <Input
            label="Your Hourly Labor Rate (LKR / hr)"
            placeholder="1500"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
            icon={<DollarSign size={18} color={COLORS.primary} />}
          />
          <Text style={styles.helperText}>
            Customers in your area will see this rate in search and map views.
          </Text>
        </View>

        {/* District & Location */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Service Area & District</Text>
          <TouchableOpacity
            style={styles.townSelectorButton}
            onPress={() => setTownModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.townIconBox}>
              <MapPin size={18} color={COLORS.primary} />
            </View>
            <View style={styles.townTextCol}>
              <Text style={styles.townSelectedName}>{town}</Text>
              <Text style={styles.townSelectedMeta}>{district} District • {province} Province</Text>
            </View>
            <View style={styles.townChangeBadge}>
              <Text style={styles.townChangeText}>Select Town</Text>
              <ChevronRight size={14} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          <Input
            label="Base Address / Workshop Location"
            placeholder="e.g. 14 Havelock Road, Colombo 05"
            value={address}
            onChangeText={setAddress}
            icon={<MapPin size={18} color={COLORS.primary} />}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Skills & Experience */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🛠️ Skills & Experience</Text>
          <Input
            label="Years of Experience"
            placeholder="5"
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
          />

          <Input
            label="Key Skills (Comma Separated)"
            placeholder="Pipe Leak Repair, Bathroom Fitting, Water Pumps"
            value={skills}
            onChangeText={setSkills}
          />

          <Input
            label="Professional Bio / Description"
            placeholder="Tell customers about your expertise and guarantee..."
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={3}
          />
        </View>

        {/* Identity NIC */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🪪 Identity Verification</Text>
          <Input
            label="National Identity Card (NIC) Number"
            placeholder="198812345678"
            value={nicNumber}
            onChangeText={setNicNumber}
            icon={<FileCheck size={18} color={COLORS.primary} />}
          />
        </View>

        <Button
          title="Save Profile & Rates"
          variant="primary"
          size="lg"
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: 8 }}
        />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={16} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out from Worker Mode</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Town Selector Modal */}
      <TownSelectorModal
        visible={townModalVisible}
        onClose={() => setTownModalVisible(false)}
        onSelectTown={handleSelectTownFromModal}
        title="Select Your Town in Sri Lanka"
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
    padding: 16,
    paddingBottom: 40
  },
  verifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1.5,
    marginBottom: 14,
    ...SHADOWS.sm
  },
  verifOk: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  verifPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A'
  },
  verifTextCol: {
    marginLeft: 12,
    flex: 1
  },
  verifTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  verifSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
    ...SHADOWS.sm
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12
  },
  photoUploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6
  },
  avatarPreviewContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden'
  },
  currentAvatar: {
    width: '100%',
    height: '100%'
  },
  uploadSpinner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoActionsCol: {
    flex: 1,
    marginLeft: 14
  },
  photoUploadTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  photoUploadSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
    marginBottom: 6
  },
  photoBtnRow: {
    flexDirection: 'row',
    gap: 8
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  galleryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusSm
  },
  cameraBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: -8,
    marginBottom: 6
  },
  townSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: SIZES.radiusMd,
    padding: 12,
    ...SHADOWS.sm
  },
  townIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  townTextCol: {
    flex: 1
  },
  townSelectedName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  townSelectedMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  townChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusFull
  },
  townChangeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 2
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 12
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
    marginLeft: 6
  }
});

export default WorkerProfileEditScreen;
