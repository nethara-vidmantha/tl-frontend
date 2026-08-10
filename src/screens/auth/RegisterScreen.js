import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import {
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  MapPin,
  DollarSign,
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import TownSelectorModal from '../../components/common/TownSelectorModal';
import { pickImageFromDevice, uploadImageToSupabase } from '../../services/supabaseStorage';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const { t, language } = useLanguage();

  const [role, setRole] = useState('customer'); // 'customer' or 'worker'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Device Profile Photo & Supabase Storage
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Town / Location Selection
  const [selectedTown, setSelectedTown] = useState('Bambalapitiya');
  const [selectedDistrict, setSelectedDistrict] = useState('Colombo');
  const [selectedProvince, setSelectedProvince] = useState('Western');
  const [address, setAddress] = useState('Bambalapitiya, Colombo');
  const [townModalVisible, setTownModalVisible] = useState(false);

  // Worker-specific fields
  const [category, setCategory] = useState('plumbing');
  const [hourlyRate, setHourlyRate] = useState('1500');

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
    setSelectedTown(locationData.town);
    setSelectedDistrict(locationData.district);
    setSelectedProvince(locationData.province);
    setAddress(locationData.address);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number (e.g. 0771234567).');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const finalAvatar = profileImageUri || DEFAULT_AVATAR;

      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        district: selectedDistrict,
        address: address || `${selectedTown}, ${selectedDistrict}, Sri Lanka`,
        profileImage: finalAvatar,
        category: role === 'worker' ? category : undefined,
        hourlyRate: role === 'worker' ? Number(hourlyRate) : undefined,
        language
      });
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Could not register user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.topHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('auth.register')}</Text>
            <Text style={styles.headerSubtitle}>Join TaskLanka Service Network</Text>
          </View>

          {/* Role Toggle Selector */}
          <View style={styles.rolePickerBox}>
            <TouchableOpacity
              style={[styles.roleOption, role === 'customer' && styles.selectedRoleOption]}
              onPress={() => setRole('customer')}
              activeOpacity={0.8}
            >
              <User size={18} color={role === 'customer' ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.roleOptionText, role === 'customer' && styles.selectedRoleOptionText]}>
                {t('auth.customerRole')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleOption, role === 'worker' && styles.selectedRoleOption]}
              onPress={() => setRole('worker')}
              activeOpacity={0.8}
            >
              <Briefcase size={18} color={role === 'worker' ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.roleOptionText, role === 'worker' && styles.selectedRoleOptionText]}>
                {t('auth.workerRole')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Supabase Device Photo Upload Section */}
            <View style={styles.photoUploadCard}>
              <View style={styles.avatarPreviewBox}>
                <Image
                  source={{ uri: profileImageUri || DEFAULT_AVATAR }}
                  style={styles.avatarImg}
                />
                {uploadingPhoto && (
                  <View style={styles.uploadSpinnerOverlay}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  </View>
                )}
              </View>

              <View style={styles.photoActionButtons}>
                <Text style={styles.photoUploadTitle}>
                  {profileImageUri ? 'Photo Selected ✓' : 'Upload Profile Photo'}
                </Text>
                <Text style={styles.photoUploadSub}>
                  Pick a real photo from your device camera roll
                </Text>

                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={styles.pickGalleryBtn}
                    onPress={() => handlePickPhoto(false)}
                    disabled={uploadingPhoto}
                    activeOpacity={0.8}
                  >
                    <ImageIcon size={14} color={COLORS.primary} />
                    <Text style={styles.pickGalleryText}>Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pickCameraBtn}
                    onPress={() => handlePickPhoto(true)}
                    disabled={uploadingPhoto}
                    activeOpacity={0.8}
                  >
                    <Camera size={14} color="#FFFFFF" />
                    <Text style={styles.pickCameraText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Name, Email, Phone */}
            <Input
              label={t('auth.fullName')}
              placeholder={role === 'worker' ? 'e.g. Kasun Fernando (Plumber)' : 'e.g. Nethara Vidmantha'}
              value={name}
              onChangeText={setName}
              icon={<User size={18} color={COLORS.primary} />}
            />

            <Input
              label={t('auth.email')}
              placeholder="e.g. name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={18} color={COLORS.primary} />}
            />

            <Input
              label={t('auth.phone')}
              placeholder="e.g. 0771234567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon={<Phone size={18} color={COLORS.primary} />}
            />

            {/* If registering as Worker -> Category & Hourly Rate */}
            {role === 'worker' && (
              <View style={styles.workerSpecialBox}>
                <Text style={styles.specialSectionTitle}>🔧 Worker Trade & Hourly Rate</Text>

                <Text style={styles.inputLabel}>{t('auth.selectCategory')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catPill, category === cat.id && styles.selectedCatPill]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Text style={[styles.catPillText, category === cat.id && styles.selectedCatPillText]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Input
                  label={t('auth.hourlyRateLabel')}
                  placeholder="1500"
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  keyboardType="numeric"
                  icon={<DollarSign size={18} color={COLORS.primary} />}
                  style={{ marginTop: 8 }}
                />
              </View>
            )}

            {/* Town & District Selector via Search & Province Hierarchy */}
            <View style={styles.locationPickerField}>
              <Text style={styles.inputLabel}>Your Town & District (Sri Lanka)</Text>
              <TouchableOpacity
                style={styles.townSelectorButton}
                onPress={() => setTownModalVisible(true)}
                activeOpacity={0.85}
              >
                <View style={styles.townIconBox}>
                  <MapPin size={18} color={COLORS.primary} />
                </View>
                <View style={styles.townTextCol}>
                  <Text style={styles.townSelectedName}>{selectedTown}</Text>
                  <Text style={styles.townSelectedMeta}>
                    {selectedDistrict} District • {selectedProvince} Province
                  </Text>
                </View>
                <View style={styles.townChangeBadge}>
                  <Text style={styles.townChangeText}>Select Town</Text>
                  <ChevronRight size={14} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            </View>

            <Input
              label={t('auth.addressLabel')}
              placeholder="e.g. 14/2 Galle Road, Bambalapitiya"
              value={address}
              onChangeText={setAddress}
              icon={<MapPin size={18} color={COLORS.textMuted} />}
            />

            <Input
              label={t('auth.password')}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              icon={<Lock size={18} color={COLORS.primary} />}
            />

            <Input
              label={t('auth.confirmPassword')}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              icon={<Lock size={18} color={COLORS.primary} />}
            />

            <Button
              title={t('auth.register')}
              variant="primary"
              size="lg"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: 12 }}
            />

            <View style={styles.loginFooter}>
              <Text style={styles.haveAccountText}>{t('auth.haveAccount')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>{t('auth.login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Town Selector Modal (Province -> District -> Town with Search) */}
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
    paddingBottom: 40
  },
  topHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...SHADOWS.md
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2
  },
  rolePickerBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: SIZES.radiusMd,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.md
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: SIZES.radiusSm
  },
  selectedRoleOption: {
    backgroundColor: COLORS.primaryLight
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginLeft: 6
  },
  selectedRoleOptionText: {
    color: COLORS.primary
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: SIZES.radiusLg,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm
  },
  photoUploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  avatarPreviewBox: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%'
  },
  uploadSpinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoActionButtons: {
    flex: 1,
    marginLeft: 14
  },
  photoUploadTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  photoUploadSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 8
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8
  },
  pickGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  pickGalleryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4
  },
  pickCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusSm
  },
  pickCameraText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6
  },
  workerSpecialBox: {
    backgroundColor: '#FAF5FF',
    padding: 14,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    marginBottom: 16
  },
  specialSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7E22CE',
    marginBottom: 10
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 10
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    marginRight: 8
  },
  selectedCatPill: {
    backgroundColor: '#7E22CE',
    borderColor: '#7E22CE'
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  selectedCatPillText: {
    color: '#FFFFFF'
  },
  locationPickerField: {
    marginBottom: 16
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
  loginFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  haveAccountText: {
    fontSize: 13,
    color: COLORS.textSecondary
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary
  }
});

export default RegisterScreen;
