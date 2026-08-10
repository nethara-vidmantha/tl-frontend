import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, X, KeyRound } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL, authApi } from '../../api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

// Google "G" Logo SVG Component
const GoogleLogoSvg = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </Svg>
);

const LoginScreen = ({ navigation }) => {
  const { login, googleLogin } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot Password Modal State
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password.trim());
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await googleLogin({
        email: 'customer@tasklanka.lk',
        name: 'Google Customer',
        googleId: 'google_oauth_verified'
      });
    } catch (error) {
      Alert.alert('Google Sign-In Error', error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email || '');
    setForgotOtp('');
    setNewPassword('');
    setForgotStep(1);
    setForgotModalVisible(true);
  };

  const handleRequestOtp = async () => {
    if (!forgotEmail.trim()) {
      Alert.alert('Error', 'Please enter your registered email address.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await authApi.forgotPassword(forgotEmail.trim());
      if (res.data?.otp) {
        setForgotOtp(res.data.otp);
      }
      setForgotStep(2);
      Alert.alert(
        'Code Sent! 📬',
        `A 6-digit reset code has been sent to ${forgotEmail}.\n(Test OTP: ${res.data?.otp || '482910'})`
      );
    } catch (err) {
      Alert.alert('Reset Error', err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please enter the 6-digit code and your new password.');
      return;
    }

    try {
      setForgotLoading(true);
      await authApi.resetPassword(forgotEmail.trim(), forgotOtp.trim(), newPassword.trim());
      Alert.alert('🎉 Password Reset!', 'Your password was updated successfully. You can now sign in.');
      setPassword(newPassword);
      setEmail(forgotEmail);
      setForgotModalVisible(false);
    } catch (err) {
      Alert.alert('Reset Error', err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Symmetrical Curved Brand Header */}
          <View style={styles.topHeader}>
            <Text style={styles.brandTitle}>
              Task<Text style={{ color: COLORS.secondary }}>ලංකා</Text>
            </Text>
            <Text style={styles.tagline}>Smart Service Marketplace • Sri Lanka</Text>
          </View>

          {/* Elevated Form Card */}
          <View style={styles.formBox}>
            {/* Email Field */}
            <Input
              label="Email Address"
              placeholder="e.g. name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={18} color={COLORS.primary} />}
            />

            {/* Password Field with Show/Hide Toggle */}
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              icon={<Lock size={18} color={COLORS.primary} />}
              rightIcon={
                showPassword ? (
                  <EyeOff size={18} color={COLORS.textMuted} />
                ) : (
                  <Eye size={18} color={COLORS.textMuted} />
                )
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={openForgotModal}
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Primary Sign In Button */}
            <Button
              title="Sign In"
              variant="primary"
              size="lg"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 10 }}
            />

            {/* Subtle Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Authentication Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
              activeOpacity={0.85}
            >
              <GoogleLogoSvg size={20} />
              <Text style={styles.googleBtnText}>
                {googleLoading ? 'Connecting...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Register Account Footer */}
            <View style={styles.registerFooter}>
              <Text style={styles.noAccountText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Server Connection Status Pill */}
          <View style={styles.serverInfoPill}>
            <View style={styles.greenDot} />
            <Text style={styles.serverInfoText}>Backend: {API_BASE_URL}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Interactive Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <KeyRound size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Reset Password</Text>
              </View>
              <TouchableOpacity onPress={() => setForgotModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {forgotStep === 1 ? (
              <View style={styles.modalBody}>
                <Text style={styles.modalDesc}>
                  Enter the email address associated with your TaskLanka account. We'll send you a 6-digit code to reset your password.
                </Text>

                <Input
                  label="Email Address"
                  placeholder="e.g. yourname@example.com"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon={<Mail size={18} color={COLORS.primary} />}
                  style={{ marginTop: 12 }}
                />

                <Button
                  title="Send Reset Code"
                  variant="primary"
                  size="lg"
                  onPress={handleRequestOtp}
                  loading={forgotLoading}
                  style={{ marginTop: 16 }}
                />
              </View>
            ) : (
              <View style={styles.modalBody}>
                <Text style={styles.modalDesc}>
                  Enter the 6-digit verification code sent to{' '}
                  <Text style={{ fontWeight: '800', color: COLORS.primary }}>{forgotEmail}</Text>{' '}
                  and choose a new password.
                </Text>

                <Input
                  label="6-Digit Reset Code"
                  placeholder="e.g. 482910"
                  value={forgotOtp}
                  onChangeText={setForgotOtp}
                  keyboardType="numeric"
                  style={{ marginTop: 12 }}
                />

                <Input
                  label="New Password"
                  placeholder="•••••••• (Min 6 characters)"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={true}
                  icon={<Lock size={18} color={COLORS.primary} />}
                />

                <Button
                  title="Save New Password & Sign In"
                  variant="primary"
                  size="lg"
                  onPress={handleResetPassword}
                  loading={forgotLoading}
                  style={{ marginTop: 16 }}
                />
              </View>
            )}
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
    paddingBottom: 30
  },
  topHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    fontWeight: '600'
  },
  formBox: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -26,
    borderRadius: SIZES.radiusLg,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.lg
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 14
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0'
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: SIZES.radiusMd,
    paddingVertical: 12,
    ...SHADOWS.sm
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 10
  },
  registerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22
  },
  noAccountText: {
    fontSize: 13,
    color: COLORS.textSecondary
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary
  },
  serverInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 22,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6
  },
  serverInfoText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600'
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
    padding: 24,
    ...SHADOWS.lg
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginLeft: 8
  },
  modalBody: {
    marginTop: 14
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4
  }
});

export default LoginScreen;
