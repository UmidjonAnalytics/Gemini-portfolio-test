import en from '../locales/en.json';
import ru from '../locales/ru.json';
import uz from '../locales/uz.json';

const dictionaries = {
  en,
  ru,
  uz,
};

export type Locale = keyof typeof dictionaries;

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries['en'];
}

export function getLocalizedField(field: any, locale: Locale): string {
  if (!field) return '';
  if (typeof field === 'string') return field;

  if (field[locale] !== undefined && field[locale] !== null && field[locale] !== '') {
    return String(field[locale]);
  }

  return field.en ? String(field.en) : '';
}
