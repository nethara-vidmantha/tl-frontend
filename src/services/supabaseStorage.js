import * as ImagePicker from 'expo-image-picker';
import { createClient } from '@supabase/supabase-js';
import { Alert, Platform } from 'react-native';

// Live TaskLanka Supabase Storage Configuration
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://igkjrsielojdzobrvcui.supabase.co',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_K2Qfwhw-25FR8Od_35T_ZA_2J26tJVJ',
  bucketName: process.env.EXPO_PUBLIC_SUPABASE_BUCKET || 'profile-pictures'
};

// Safe React Native client initialization
let supabaseClient = null;
try {
  supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false
    }
  });
} catch (e) {
  console.warn('Supabase initialization fallback:', e.message);
}

export const supabase = supabaseClient;

/**
 * Configure Supabase credentials dynamically
 */
export const configureSupabase = (url, anonKey, bucketName = 'profile-pictures') => {
  SUPABASE_CONFIG.url = url;
  SUPABASE_CONFIG.anonKey = anonKey;
  SUPABASE_CONFIG.bucketName = bucketName;
  try {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
        autoRefreshToken: false
      }
    });
  } catch (e) {
    console.warn('Dynamic Supabase initialization error:', e.message);
  }
};

/**
 * Base64 string to ArrayBuffer helper for React Native / Expo binary uploads
 */
const base64ToArrayBuffer = (base64) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let bufferLength = base64.length * 0.75;
  const len = base64.length;
  let i;
  let p = 0;
  let encoded1, encoded2, encoded3, encoded4;

  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  for (i = 0; i < len; i += 4) {
    encoded1 = chars.indexOf(base64[i]);
    encoded2 = chars.indexOf(base64[i + 1]);
    encoded3 = chars.indexOf(base64[i + 2]);
    encoded4 = chars.indexOf(base64[i + 3]);

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (encoded3 !== 64 && p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (encoded4 !== 64 && p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return arrayBuffer;
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
 * Upload Image to live Supabase Storage 'profile-pictures' Bucket
 * Returns the public HTTPS URL directly
 */
export const uploadImageToSupabase = async (imageAsset, customFolder = 'avatars') => {
  if (!imageAsset) return null;

  const fileName = `${customFolder}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

  try {
    if (supabaseClient && imageAsset.base64) {
      const arrayBuffer = base64ToArrayBuffer(imageAsset.base64);

      const { data, error } = await supabaseClient.storage
        .from(SUPABASE_CONFIG.bucketName)
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.warn('Supabase upload notice:', error.message);
      } else {
        const { data: publicUrlData } = supabaseClient.storage
          .from(SUPABASE_CONFIG.bucketName)
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    }
  } catch (err) {
    console.warn('Supabase storage upload error:', err.message);
  }

  // Resilient fallback: Return Base64 or local URI
  if (imageAsset.base64) {
    return `data:image/jpeg;base64,${imageAsset.base64}`;
  }

  return imageAsset.uri;
};
