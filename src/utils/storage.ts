import { FormConfig } from '../types/form';

const STORAGE_KEY = 'formBuilderData';
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

export interface StorageData {
  config: FormConfig;
  formState: Record<string, any>;
  timestamp: number;
}

export function saveToStorage(data: StorageData) {
  data.timestamp = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsedData: StorageData = JSON.parse(data);
    if (Date.now() - parsedData.timestamp < EXPIRATION_TIME) {
      return parsedData;
    } else {
      clearStorage();
    }
  }
  return null;
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadConfigFromStorage(): FormConfig | null {
  const data = loadFromStorage();
  return data ? data.config : null;
}