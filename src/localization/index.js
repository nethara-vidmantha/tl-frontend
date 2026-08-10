import en from './en.json';
import si from './si.json';
import ta from './ta.json';

export const translations = {
  en,
  si,
  ta
};

/**
 * Nested key lookup helper: e.g. t('auth.login', 'si')
 */
export const translate = (key, lang = 'en') => {
  const dict = translations[lang] || translations.en;
  const keys = key.split('.');
  
  let current = dict;
  for (const k of keys) {
    if (current && current[k] !== undefined) {
      current = current[k];
    } else {
      // Fallback to English
      let fallback = translations.en;
      for (const fk of keys) {
        if (fallback && fallback[fk] !== undefined) {
          fallback = fallback[fk];
        } else {
          return key; // return raw key if missing
        }
      }
      return fallback;
    }
  }

  return current;
};
