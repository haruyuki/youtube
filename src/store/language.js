import { ref } from 'vue';
import translationsData from '../data/translations.json';

// Define available languages
export const LANGUAGES = {
  EN: 'en',
  ZH_TW: 'zh-tw'
};

// Current language state
export const currentLanguage = ref(LANGUAGES.EN);

// Toggle between languages
export function toggleLanguage() {
  currentLanguage.value = currentLanguage.value === LANGUAGES.EN ? LANGUAGES.ZH_TW : LANGUAGES.EN;
}

// Translations dictionary imported from JSON file
const translations = translationsData;

// Translation function
export function t(key) {
  const keys = key.split('.');
  let result = translations[currentLanguage.value];
  
  for (const k of keys) {
    if (result && result[k]) {
      result = result[k];
    } else {
      // Fallback to English if translation not found
      let fallback = translations[LANGUAGES.EN];
      for (const fk of keys) {
        if (fallback && fallback[fk]) {
          fallback = fallback[fk];
        } else {
          return key; // Return the key if no translation found
        }
      }
      return fallback;
    }
  }
  
  return result;
}