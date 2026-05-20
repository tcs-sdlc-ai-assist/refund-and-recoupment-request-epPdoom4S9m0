import { STORAGE_KEYS } from '../constants';
import { getItem } from './localStorageService';

/**
 * Retrieves all member records from localStorage.
 * @returns {Array<Object>} Array of member objects, or empty array if none exist
 */
export function getAllMembers() {
  return getItem(STORAGE_KEYS.MEMBER, []);
}

/**
 * Retrieves a single member by their ID.
 * @param {string} id - The member ID to look up
 * @returns {Object|null} The matching member object, or null if not found
 */
export function getMemberById(id) {
  const members = getAllMembers();
  const found = members.find((m) => m.id === id);
  return found || null;
}