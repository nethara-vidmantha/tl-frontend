import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth 2.0 Client IDs
export const GOOGLE_WEB_CLIENT_ID = '43950134170-43ml8vkml6ed0n1dop5orbeoj56vhdea.apps.googleusercontent.com';

/**
 * Generate standard redirect URI for TaskLanka
 */
export const getGoogleRedirectUri = () => {
  return makeRedirectUri({
    scheme: 'tasklanka',
    preferLocalhost: false
  });
};

/**
 * Fetch verified user info using Google Access Token or ID Token
 */
export const fetchGoogleUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve Google user profile.');
    }

    const userInfo = await response.json();
    return {
      email: userInfo.email,
      name: userInfo.name || userInfo.email.split('@')[0],
      profileImage: userInfo.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      googleId: userInfo.sub,
      accessToken
    };
  } catch (error) {
    console.error('Error fetching Google user profile:', error);
    throw error;
  }
};
