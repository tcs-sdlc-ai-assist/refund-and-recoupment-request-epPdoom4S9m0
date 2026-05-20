import { STORAGE_KEYS } from '../constants';

/**
 * Generic localStorage abstraction layer with JSON serialization/deserialization
 * and error handling for quota exceeded and corrupted data.
 */

/**
 * Retrieves an item from localStorage and deserializes it from JSON.
 * @param {string} key - The localStorage key to retrieve
 * @param {*} [defaultValue=null] - The default value to return if the key does not exist or data is corrupted
 * @returns {*} The deserialized value, or defaultValue if not found or on error
 */
export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error(`[localStorageService] Error reading key "${key}":`, error);
    }
    return defaultValue;
  }
}

/**
 * Serializes a value to JSON and stores it in localStorage.
 * @param {string} key - The localStorage key to set
 * @param {*} value - The value to serialize and store
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
export function setItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error instanceof DOMException && (
      error.code === 22 ||
      error.code === 1014 ||
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      console.error(`[localStorageService] Storage quota exceeded when setting key "${key}":`, error);
    } else {
      console.error(`[localStorageService] Error setting key "${key}":`, error);
    }
    return false;
  }
}

/**
 * Removes an item from localStorage.
 * @param {string} key - The localStorage key to remove
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[localStorageService] Error removing key "${key}":`, error);
    return false;
  }
}

/**
 * Clears all application-specific keys from localStorage.
 * Only removes keys defined in STORAGE_KEYS to avoid affecting other applications.
 * @returns {boolean} True if all keys were successfully removed, false otherwise
 */
export function clearAll() {
  try {
    const keys = Object.values(STORAGE_KEYS);
    for (const key of keys) {
      localStorage.removeItem(key);
    }
    return true;
  } catch (error) {
    console.error('[localStorageService] Error clearing application storage:', error);
    return false;
  }
}

/**
 * Resets localStorage completely (calls localStorage.clear()).
 * Use with caution — this removes ALL localStorage data, not just application keys.
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
export function reset() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('[localStorageService] Error resetting storage:', error);
    return false;
  }
}