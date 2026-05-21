import type { Dictionary } from './types';
import { en } from './locales/en';

export function translate(
  dictionary: Dictionary, 
  key: string, 
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');

  // Helper to get value from a dictionary
  const getValue = (dict: any): string | undefined => {
    let value: any = dict;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    return typeof value === 'string' ? value : undefined;
  };

  // Try current dictionary, fallback to English
  let translated = getValue(dictionary);
  if (translated === undefined) {
    translated = getValue(en);
  }

  if (translated === undefined) {
    return key;
  }

  // Handle interpolation if params provided
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      translated = translated!.split(`{${k}}`).join(String(v));
    });
  }

  return translated;
}
