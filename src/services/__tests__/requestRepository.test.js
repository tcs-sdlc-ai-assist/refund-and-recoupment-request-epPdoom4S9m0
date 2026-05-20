import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAllRequests, getRequestById, saveRequest, updateRequest, deleteRequest } from '../requestRepository';
import { STORAGE_KEYS } from '../../constants';

describe('requestRepository', () => {
  let store;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => {
        return key in store ? store[key] : null;
      }),
      setItem: vi.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    });
  });

  describe('getAllRequests', () => {
    it('returns an empty array when no requests exist in localStorage', () => {
      const result = getAllRequests();
      expect(result).toEqual([]);
    });

    it('returns all stored requests', () => {
      const requests = [
        { id: 'REQ-1', requestType: 'REFUND', amount: 100, status: 'NEW' },
        { id: 'REQ-2', requestType: 'RECOUPMENT', amount: 200, status: 'IN_PROGRESS' },
      ];
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify(requests);

      const result = getAllRequests();
      expect(result).toEqual(requests);
      expect(result).toHaveLength(2);
    });

    it('returns default empty array when localStorage contains corrupted data', () => {
      store[STORAGE_KEYS.REQUEST_MASTER] = '{invalid json';

      const result = getAllRequests();
      expect(result).toEqual([]);
    });
  });

  describe('getRequestById', () => {
    it('returns the matching request when found', () => {
      const requests = [
        { id: 'REQ-1', requestType: 'REFUND', amount: 100 },
        { id: 'REQ-2', requestType: 'RECOUPMENT', amount: 200 },
      ];
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify(requests);

      const result = getRequestById('REQ-2');
      expect(result).toEqual({ id: 'REQ-2', requestType: 'RECOUPMENT', amount: 200 });
    });

    it('returns null when the request ID does not exist', () => {
      const requests = [
        { id: 'REQ-1', requestType: 'REFUND', amount: 100 },
      ];
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify(requests);

      const result = getRequestById('REQ-NONEXISTENT');
      expect(result).toBeNull();
    });

    it('returns null when the store is empty', () => {
      const result = getRequestById('REQ-1');
      expect(result).toBeNull();
    });
  });

  describe('saveRequest', () => {
    it('saves a new request with auto-generated ID and timestamps', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 1500.00,
        status: 'NEW',
        reason: 'Duplicate payment',
        notes: '',
      };

      const saved = saveRequest(requestData);

      expect(saved.id).toBeDefined();
      expect(saved.id).toMatch(/^REQ-/);
      expect(saved.createdDate).toBeDefined();
      expect(saved.updatedDate).toBeDefined();
      expect(saved.createdDate).toBe(saved.updatedDate);
      expect(saved.requestType).toBe('REFUND');
      expect(saved.memberId).toBe('MEM001');
      expect(saved.providerId).toBe('PRV001');
      expect(saved.amount).toBe(1500.00);
      expect(saved.status).toBe('NEW');
      expect(saved.reason).toBe('Duplicate payment');

      // Verify it was persisted
      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(saved.id);
    });

    it('appends to existing requests without overwriting', () => {
      const existingRequests = [
        { id: 'REQ-EXISTING', requestType: 'RECOUPMENT', amount: 500, status: 'NEW', createdDate: '2024-01-01T00:00:00.000Z', updatedDate: '2024-01-01T00:00:00.000Z' },
      ];
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify(existingRequests);

      const newRequest = {
        requestType: 'REFUND',
        memberId: 'MEM002',
        providerId: 'PRV002',
        amount: 750.00,
        status: 'NEW',
      };

      saveRequest(newRequest);

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      expect(stored).toHaveLength(2);
      expect(stored[0].id).toBe('REQ-EXISTING');
    });

    it('generates unique IDs for multiple saves', () => {
      const saved1 = saveRequest({ requestType: 'REFUND', memberId: 'MEM001', providerId: 'PRV001', amount: 100, status: 'NEW' });
      const saved2 = saveRequest({ requestType: 'RECOUPMENT', memberId: 'MEM002', providerId: 'PRV002', amount: 200, status: 'NEW' });

      expect(saved1.id).not.toBe(saved2.id);
    });

    it('sets createdDate and updatedDate as valid ISO strings', () => {
      const saved = saveRequest({ requestType: 'REFUND', memberId: 'MEM001', providerId: 'PRV001', amount: 100, status: 'NEW' });

      const createdDate = new Date(saved.createdDate);
      const updatedDate = new Date(saved.updatedDate);

      expect(createdDate.getTime()).not.toBeNaN();
      expect(updatedDate.getTime()).not.toBeNaN();
    });
  });

  describe('updateRequest', () => {
    beforeEach(() => {
      const requests = [
        {
          id: 'REQ-UPDATE-1',
          requestType: 'REFUND',
          memberId: 'MEM001',
          providerId: 'PRV001',
          amount: 1000,
          status: 'NEW',
          reason: 'Original reason',
          notes: '',
          createdDate: '2024-01-01T00:00:00.000Z',
          updatedDate: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'REQ-UPDATE-2',
          requestType: 'RECOUPMENT',
          memberId: 'MEM002',
          providerId: 'PRV002',
          amount: 2000,
          status: 'IN_PROGRESS',
          reason: 'Another reason',
          notes: 'Some notes',
          createdDate: '2024-02-01T00:00:00.000Z',
          updatedDate: '2024-02-01T00:00:00.000Z',
        },
      ];
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify(requests);
    });

    it('updates the specified fields and refreshes updatedDate', () => {
      const updated = updateRequest('REQ-UPDATE-1', {
        amount: 1500,
        status: 'IN_PROGRESS',
        reason: 'Updated reason',
      });

      expect(updated).not.toBeNull();
      expect(updated.id).toBe('REQ-UPDATE-1');
      expect(updated.amount).toBe(1500);
      expect(updated.status).toBe('IN_PROGRESS');
      expect(updated.reason).toBe('Updated reason');
      expect(updated.createdDate).toBe('2024-01-01T00:00:00.000Z');
      expect(updated.updatedDate).not.toBe('2024-01-01T00:00:00.000Z');
    });

    it('preserves the original ID and createdDate even if updates try to override them', () => {
      const updated = updateRequest('REQ-UPDATE-1', {
        id: 'REQ-HACKED',
        createdDate: '1999-01-01T00:00:00.000Z',
        amount: 999,
      });

      expect(updated.id).toBe('REQ-UPDATE-1');
      expect(updated.createdDate).toBe('2024-01-01T00:00:00.000Z');
      expect(updated.amount).toBe(999);
    });

    it('updates status from NEW to PROCESSED', () => {
      const updated = updateRequest('REQ-UPDATE-1', {
        status: 'PROCESSED',
      });

      expect(updated.status).toBe('PROCESSED');
    });

    it('returns null when the request ID does not exist', () => {
      const result = updateRequest('REQ-NONEXISTENT', { amount: 500 });
      expect(result).toBeNull();
    });

    it('does not affect other requests in the store', () => {
      updateRequest('REQ-UPDATE-1', { amount: 9999 });

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      const other = stored.find((r) => r.id === 'REQ-UPDATE-2');
      expect(other.amount).toBe(2000);
      expect(other.status).toBe('IN_PROGRESS');
    });

    it('persists the updated request to localStorage', () => {
      updateRequest('REQ-UPDATE-1', { amount: 3000 });

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      const found = stored.find((r) => r.id === 'REQ-UPDATE-1');
      expect(found.amount).toBe(3000);
    });
  });

  describe('deleteRequest', () => {
    beforeEach(() => {
      const requests = [
        { id: 'REQ-DEL-1', requestType: 'REFUND', amount: 100, status: 'NEW', createdDate: '2024-01-01T00:00:00.000Z', updatedDate: '2024-01-01T00:00:00.000Z' },
        { id: 'REQ-DEL-2', requestType: 'RECOUPMENT', amount: 200, status: 'PROCESSED', createdDate: '2024-02-01T00:00:00.000Z', updatedDate: '2024-02-01T00:00:00.000Z' },
        { id: 'REQ-DEL-3', requestType: 'REFUND', amount: 300, status: 'CLOSED', createdDate: '2024-03-01T00:00:00.000Z', updatedDate: '2024-03-01T00:00:00.000Z' },
      ];
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify(requests);
    });

    it('deletes the request and returns true', () => {
      const result = deleteRequest('REQ-DEL-2');
      expect(result).toBe(true);

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      expect(stored).toHaveLength(2);
      expect(stored.find((r) => r.id === 'REQ-DEL-2')).toBeUndefined();
    });

    it('returns false when the request ID does not exist', () => {
      const result = deleteRequest('REQ-NONEXISTENT');
      expect(result).toBe(false);

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      expect(stored).toHaveLength(3);
    });

    it('does not affect other requests when deleting', () => {
      deleteRequest('REQ-DEL-1');

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      expect(stored).toHaveLength(2);
      expect(stored.find((r) => r.id === 'REQ-DEL-2')).toBeDefined();
      expect(stored.find((r) => r.id === 'REQ-DEL-3')).toBeDefined();
    });

    it('handles deleting from a store with a single request', () => {
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify([
        { id: 'REQ-ONLY', requestType: 'REFUND', amount: 50, status: 'NEW', createdDate: '2024-01-01T00:00:00.000Z', updatedDate: '2024-01-01T00:00:00.000Z' },
      ]);

      const result = deleteRequest('REQ-ONLY');
      expect(result).toBe(true);

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      expect(stored).toHaveLength(0);
    });
  });

  describe('data integrity', () => {
    it('maintains data integrity across save, read, update, and delete operations', () => {
      // Save
      const saved = saveRequest({
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 500,
        status: 'NEW',
        reason: 'Test reason',
        notes: 'Test notes',
      });

      // Read
      const fetched = getRequestById(saved.id);
      expect(fetched).toEqual(saved);

      // Update
      const updated = updateRequest(saved.id, { amount: 750, status: 'IN_PROGRESS' });
      expect(updated.amount).toBe(750);
      expect(updated.status).toBe('IN_PROGRESS');
      expect(updated.reason).toBe('Test reason');

      // Verify read after update
      const fetchedAfterUpdate = getRequestById(saved.id);
      expect(fetchedAfterUpdate.amount).toBe(750);

      // Delete
      const deleted = deleteRequest(saved.id);
      expect(deleted).toBe(true);

      // Verify read after delete
      const fetchedAfterDelete = getRequestById(saved.id);
      expect(fetchedAfterDelete).toBeNull();

      // Verify store is empty
      const all = getAllRequests();
      expect(all).toHaveLength(0);
    });

    it('handles multiple concurrent saves correctly', () => {
      saveRequest({ requestType: 'REFUND', memberId: 'MEM001', providerId: 'PRV001', amount: 100, status: 'NEW' });
      saveRequest({ requestType: 'RECOUPMENT', memberId: 'MEM002', providerId: 'PRV002', amount: 200, status: 'NEW' });
      saveRequest({ requestType: 'REFUND', memberId: 'MEM003', providerId: 'PRV003', amount: 300, status: 'NEW' });

      const all = getAllRequests();
      expect(all).toHaveLength(3);

      const amounts = all.map((r) => r.amount);
      expect(amounts).toContain(100);
      expect(amounts).toContain(200);
      expect(amounts).toContain(300);
    });
  });
});