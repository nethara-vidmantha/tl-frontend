import * as ImagePicker from 'expo-image-picker';
import { createClient } from '@supabase/supabase-js';
import { Alert, Platform } from 'react-native';

// Supabase Configuration
// You can supply your own Project URL & Anon Key or use this configured instance
export const SUPABASE_CONFIG = {
  url: 'https://xyzcompany.supabase.co', // Replace with your Supabase Project URL
  anonKey: 'public-anon-key-placeholder', // Replace with your Supabase Anon Key
  bucketName: 'avatars'
};

let supabase = null;
try {
  if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.url.startsWith('https://')) {
    supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }
} catch (e) {
  console.warn('Supabase initialization notice:', e);
}

/**
 * Configure Supabase credentials dynamically
 */
export const configureSupabase = (url, anonKey, bucketName = 'avatars') => {
  SUPABASE_CONFIG.url = url;
  SUPABASE_CONFIG.anonKey = anonKey;
  SUPABASE_CONFIG.bucketName = bucketName;
  supabase = createClient(url, anonKey);
};

/**
 * Pick an image from the phone's Gallery or Camera
 */
export const pickImageFromDevice = async (useCamera = false) => {
  try {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take a profile photo.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery access is required to pick a profile photo.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Error picking image from device:', error);
    Alert.alert('Image Picker Error', error.message || 'Could not access photos.');
    return null;
  }
};

/**
 * Upload Image to Supabase Storage Bucket or return high-res data URI
 */
export const uploadImageToSupabase = async (imageAsset, customFolder = 'avatars') => {
  if (!imageAsset) return null;

  const fileName = `${customFolder}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

  try {
    // If user has connected live Supabase project
    if (supabase && SUPABASE_CONFIG.anonKey !== 'public-anon-key-placeholder') {
      const response = await fetch(imageAsset.uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from(SUPABASE_CONFIG.bucketName)
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_CONFIG.bucketName)
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    }
  } catch (err) {
    console.warn('Supabase storage upload fallback to local URI:', err.message);
  }

  // Seamless Fallback: Use image URI or Base64 data URI directly
  if (imageAsset.base64) {
    return `data:image/jpeg;base64,${imageAsset.base64}`;
  }

  return imageAsset.uri;
};
