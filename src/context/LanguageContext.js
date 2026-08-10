import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../localization';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('@tasklanka_language');
      if (savedLang && ['en', 'si', 'ta'].includes(savedLang)) {
        setLanguage(savedLang);
      }
    } catch (e) {
      console.warn('Failed to load language', e);
    }
  };

  const changeLanguage = async (newLang) => {
    if (['en', 'si', 'ta'].includes(newLang)) {
      setLanguage(newLang);
      try {
        await AsyncStorage.setItem('@tasklanka_language', newLang);
      } catch (e) {
        console.warn('Failed to save language', e);
      }
    }
  };

  const t = (key) => {
    return translate(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
