import { STORAGE_KEYS } from '../constants';
import { getItem, setItem } from './localStorageService';

/**
 * Generates a unique request ID based on timestamp and random suffix.
 * @returns {string} A unique request ID string
 */
function generateRequestId() {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REQ-${timestamp}-${randomSuffix}`;
}

/**
 * Returns the current ISO date string.
 * @returns {string} Current date/time in ISO format
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Retrieves all request records from localStorage.
 * @returns {Array<Object>} Array of request objects, or empty array if none exist
 */
export function getAllRequests() {
  return getItem(STORAGE_KEYS.REQUEST_MASTER, []);
}

/**
 * Retrieves a single request by its ID.
 * @param {string} id - The request ID to look up
 * @returns {Object|null} The matching request object, or null if not found
 */
export function getRequestById(id) {
  const requests = getAllRequests();
  const found = requests.find((r) => r.id === id);
  return found || null;
}

/**
 * Saves a new request to localStorage. Auto-generates an ID and sets
 * createdDate and updatedDate timestamps.
 * @param {Object} request - The request data to save (without id or timestamps)
 * @returns {Object} The saved request object with generated id and timestamps
 */
export function saveRequest(request) {
  const requests = getAllRequests();
  const now = getCurrentTimestamp();

  const newRequest = {
    ...request,
    id: generateRequestId(),
    createdDate: now,
    updatedDate: now,
  };

  requests.push(newRequest);
  const success = setItem(STORAGE_KEYS.REQUEST_MASTER, requests);

  if (!success) {
    console.error('[requestRepository] Failed to save request to localStorage');
  }

  return newRequest;
}

/**
 * Updates an existing request by ID. Merges the provided updates into the
 * existing record and refreshes the updatedDate timestamp.
 * @param {string} id - The ID of the request to update
 * @param {Object} updates - An object containing the fields to update
 * @returns {Object|null} The updated request object, or null if the request was not found
 */
export function updateRequest(id, updates) {
  const requests = getAllRequests();
  const index = requests.findIndex((r) => r.id === id);

  if (index === -1) {
    console.error(`[requestRepository] Request with id "${id}" not found`);
    return null;
  }

  const updatedRequest = {
    ...requests[index],
    ...updates,
    id: requests[index].id,
    createdDate: requests[index].createdDate,
    updatedDate: getCurrentTimestamp(),
  };

  requests[index] = updatedRequest;
  const success = setItem(STORAGE_KEYS.REQUEST_MASTER, requests);

  if (!success) {
    console.error('[requestRepository] Failed to update request in localStorage');
  }

  return updatedRequest;
}

/**
 * Deletes a request by its ID from localStorage.
 * @param {string} id - The ID of the request to delete
 * @returns {boolean} True if the request was found and deleted, false otherwise
 */
export function deleteRequest(id) {
  const requests = getAllRequests();
  const index = requests.findIndex((r) => r.id === id);

  if (index === -1) {
    console.error(`[requestRepository] Request with id "${id}" not found for deletion`);
    return false;
  }

  requests.splice(index, 1);
  const success = setItem(STORAGE_KEYS.REQUEST_MASTER, requests);

  if (!success) {
    console.error('[requestRepository] Failed to delete request from localStorage');
    return false;
  }

  return true;
}