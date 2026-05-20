import { STORAGE_KEYS } from '../constants';
import { getItem } from './localStorageService';

/**
 * Retrieves all provider records from localStorage.
 * @returns {Array<Object>} Array of provider objects, or empty array if none exist
 */
export function getAllProviders() {
  return getItem(STORAGE_KEYS.PROVIDER, []);
}

/**
 * Retrieves a single provider by their ID.
 * @param {string} id - The provider ID to look up
 * @returns {Object|null} The matching provider object, or null if not found
 */
export function getProviderById(id) {
  const providers = getAllProviders();
  const found = providers.find((p) => p.id === id);
  return found || null;
}