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
  Modal,
  ActivityIndicator
} from 'react-native';
import {
  User,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Camera,
  X,
  Image as ImageIcon
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { pickImageFromDevice, uploadImageToSupabase } from '../../services/supabaseStorage';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

const CustomerProfileScreen = ({ navigation }) => {
  const { user, logout, refreshUser } = useAuth();
  const { selectedLocation } = useLocation();
  const { language, changeLanguage, t } = useLanguage();
  const toast = useToast();

  // Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(user?.profileImage || DEFAULT_AVATAR);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updating, setUpdating] = useState(false);

  const openEditModal = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setCurrentAvatarUrl(user?.profileImage || DEFAULT_AVATAR);
    setEditModalVisible(true);
  };

  const handlePickPhoto = async (fromCamera = false) => {
    try {
      setUploadingPhoto(true);
      const asset = await pickImageFromDevice(fromCamera);
      if (asset) {
        setCurrentAvatarUrl(asset.uri);
        const uploadedUrl = await uploadImageToSupabase(asset, 'avatars');
        if (uploadedUrl) {
          setCurrentAvatarUrl(uploadedUrl);
          toast.success('Photo ready to save.');
        }
      }
    } catch (e) {
      toast.error('Could not process selected image.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.warning('Name cannot be empty.');
      return;
    }

    try {
      setUpdating(true);
      await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        profileImage: currentAvatarUrl
      });
      await refreshUser();
      setEditModalVisible(false);
      toast.success('Profile photo & information updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of TaskLanka?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="My Account" showBack={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card with Edit Button */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.profileImage || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarBtn} onPress={openEditModal} activeOpacity={0.8}>
              <Camera size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'Customer'}</Text>
          <Text style={styles.userRole}>
            {(user?.role || 'customer').toUpperCase()} • SRI LANKA
          </Text>

          <View style={styles.infoPillsRow}>
            <View style={styles.infoPill}>
              <Mail size={12} color={COLORS.primary} />
              <Text style={styles.infoPillText}>{user?.email || 'customer@tasklanka.lk'}</Text>
            </View>
            <View style={styles.infoPill}>
              <Phone size={12} color={COLORS.primary} />
              <Text style={styles.infoPillText}>{user?.phone || '077 123 4567'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileBtn} onPress={openEditModal} activeOpacity={0.8}>
            <Camera size={14} color={COLORS.primary} />
            <Text style={styles.editProfileBtnText}>Update Profile & Photo</Text>
          </TouchableOpacity>
        </View>

        {/* App Language Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          <View style={styles.card}>
            <View style={styles.langGrid}>
              <TouchableOpacity
                style={[styles.langBtn, language === 'en' && styles.selectedLangBtn]}
                onPress={() => changeLanguage('en')}
              >
                <Text style={[styles.langText, language === 'en' && styles.selectedLangText]}>
                  English
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.langBtn, language === 'si' && styles.selectedLangBtn]}
                onPress={() => changeLanguage('si')}
              >
                <Text style={[styles.langText, language === 'si' && styles.selectedLangText]}>
                  සිංහල (Sinhala)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.langBtn, language === 'ta' && styles.selectedLangBtn]}
                onPress={() => changeLanguage('ta')}
              >
                <Text style={[styles.langText, language === 'ta' && styles.selectedLangText]}>
                  தமிழ் (Tamil)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Active Location Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Location</Text>
          <View style={styles.card}>
            <View style={styles.locRow}>
              <MapPin size={18} color={COLORS.primary} />
              <Text style={styles.locText}>
                {selectedLocation.district} District ({selectedLocation.address})
              </Text>
            </View>
          </View>
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & About</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconBox, { backgroundColor: COLORS.primaryLight }]}>
                <HelpCircle size={18} color={COLORS.primary} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{t('profile.helpSupport')}</Text>
                <Text style={styles.menuSub}>24/7 Sri Lanka Customer Hotline</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconBox, { backgroundColor: '#F1F5F9' }]}>
                <FileText size={18} color={COLORS.textSecondary} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{t('profile.termsConditions')}</Text>
                <Text style={styles.menuSub}>Platform usage guidelines</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color={COLORS.danger} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile & Photo Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile & Photo</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Photo Upload Section */}
              <View style={styles.modalPhotoBox}>
                <View style={styles.modalAvatarPreview}>
                  <Image source={{ uri: currentAvatarUrl }} style={styles.previewImg} />
                  {uploadingPhoto && (
                    <View style={styles.uploadSpinner}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    </View>
                  )}
                </View>

                <View style={styles.modalPhotoActions}>
                  <Text style={styles.modalSectionLabel}>Profile Photo</Text>
                  <Text style={styles.modalPhotoSub}>Pick a real photo from your device</Text>
                  <View style={styles.photoBtnRow}>
                    <TouchableOpacity
                      style={styles.modalGalleryBtn}
                      onPress={() => handlePickPhoto(false)}
                      disabled={uploadingPhoto}
                    >
                      <ImageIcon size={14} color={COLORS.primary} />
                      <Text style={styles.modalGalleryText}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalCameraBtn}
                      onPress={() => handlePickPhoto(true)}
                      disabled={uploadingPhoto}
                    >
                      <Camera size={14} color="#FFFFFF" />
                      <Text style={styles.modalCameraText}>Camera</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Name & Phone Inputs */}
              <Input
                label="Full Name"
                placeholder="e.g. Kasun Fernando"
                value={name}
                onChangeText={setName}
                icon={<User size={18} color={COLORS.primary} />}
              />

              <Input
                label="Phone Number"
                placeholder="e.g. 0771234567"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                icon={<Phone size={18} color={COLORS.primary} />}
              />

              <Button
                title="Save Changes"
                variant="primary"
                size="lg"
                onPress={handleSaveProfile}
                loading={updating}
                style={{ marginTop: 16 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  userRole: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: 10
  },
  infoPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusFull
  },
  infoPillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 6
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm
  },
  langGrid: {
    flexDirection: 'row',
    gap: 8
  },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  selectedLangBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  selectedLangText: {
    color: '#FFFFFF'
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
    flex: 1
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  menuInfo: {
    flex: 1
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  menuSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerLight,
    paddingVertical: 14,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 8
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.danger,
    marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    ...SHADOWS.lg
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  modalPhotoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14
  },
  modalAvatarPreview: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden'
  },
  previewImg: {
    width: '100%',
    height: '100%'
  },
  uploadSpinner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalPhotoActions: {
    flex: 1,
    marginLeft: 12
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  modalPhotoSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 6
  },
  photoBtnRow: {
    flexDirection: 'row',
    gap: 8
  },
  modalGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  modalGalleryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4
  },
  modalCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusSm
  },
  modalCameraText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4
  }
});

export default CustomerProfileScreen;
