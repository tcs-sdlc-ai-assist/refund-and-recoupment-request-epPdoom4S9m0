import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchRequests } from '../searchService';
import { STORAGE_KEYS } from '../../constants';

describe('searchService', () => {
  let store;

  const SAMPLE_REQUESTS = [
    {
      id: 'REQ001',
      requestType: 'REFUND',
      status: 'NEW',
      memberId: 'MEM001',
      providerId: 'PRV001',
      paymentId: 'PAY001',
      amount: 1500.00,
      reason: 'Duplicate payment identified during audit',
      createdDate: '2024-06-01T10:00:00.000Z',
      updatedDate: '2024-06-01T10:00:00.000Z',
      notes: 'Initial review pending',
    },
    {
      id: 'REQ002',
      requestType: 'RECOUPMENT',
      status: 'IN_PROGRESS',
      memberId: 'MEM003',
      providerId: 'PRV002',
      paymentId: 'PAY002',
      amount: 3200.50,
      reason: 'Overpayment due to incorrect fee schedule',
      createdDate: '2024-05-15T08:30:00.000Z',
      updatedDate: '2024-06-10T14:00:00.000Z',
      notes: 'Provider contacted, awaiting response',
    },
    {
      id: 'REQ003',
      requestType: 'REFUND',
      status: 'PROCESSED',
      memberId: 'MEM005',
      providerId: 'PRV004',
      paymentId: 'PAY003',
      amount: 750.00,
      reason: 'Service not rendered as billed',
      createdDate: '2024-04-20T12:00:00.000Z',
      updatedDate: '2024-06-05T09:00:00.000Z',
      notes: 'Refund check issued',
    },
    {
      id: 'REQ004',
      requestType: 'RECOUPMENT',
      status: 'CLOSED',
      memberId: 'MEM007',
      providerId: 'PRV006',
      paymentId: 'PAY004',
      amount: 2100.75,
      reason: 'Coordination of benefits adjustment',
      createdDate: '2024-03-01T07:00:00.000Z',
      updatedDate: '2024-05-28T16:00:00.000Z',
      notes: 'Recoupment completed successfully',
    },
    {
      id: 'REQ005',
      requestType: 'REFUND',
      status: 'NEW',
      memberId: 'MEM009',
      providerId: 'PRV008',
      paymentId: 'PAY005',
      amount: 980.25,
      reason: 'Member eligibility terminated prior to service date',
      createdDate: '2024-06-12T15:30:00.000Z',
      updatedDate: '2024-06-12T15:30:00.000Z',
      notes: '',
    },
  ];

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

    store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify(SAMPLE_REQUESTS);
  });

  describe('no filters', () => {
    it('returns all requests when no filters are provided', () => {
      const results = searchRequests();
      expect(results).toHaveLength(5);
    });

    it('returns all requests when filters is an empty object', () => {
      const results = searchRequests({});
      expect(results).toHaveLength(5);
    });

    it('returns an empty array when no requests exist in localStorage', () => {
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify([]);
      const results = searchRequests({});
      expect(results).toEqual([]);
    });
  });

  describe('filter by requestId', () => {
    it('returns the matching request when filtering by exact request ID', () => {
      const results = searchRequests({ requestId: 'REQ003' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ003');
    });

    it('returns an empty array when request ID does not match any request', () => {
      const results = searchRequests({ requestId: 'REQ-NONEXISTENT' });
      expect(results).toEqual([]);
    });

    it('trims whitespace from request ID filter', () => {
      const results = searchRequests({ requestId: '  REQ001  ' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ001');
    });

    it('ignores requestId filter when it is an empty string', () => {
      const results = searchRequests({ requestId: '' });
      expect(results).toHaveLength(5);
    });
  });

  describe('filter by memberId', () => {
    it('returns requests matching the specified member ID', () => {
      const results = searchRequests({ memberId: 'MEM003' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ002');
      expect(results[0].memberId).toBe('MEM003');
    });

    it('returns an empty array when member ID does not match any request', () => {
      const results = searchRequests({ memberId: 'MEM999' });
      expect(results).toEqual([]);
    });

    it('ignores memberId filter when it is an empty string', () => {
      const results = searchRequests({ memberId: '' });
      expect(results).toHaveLength(5);
    });
  });

  describe('filter by providerId', () => {
    it('returns requests matching the specified provider ID', () => {
      const results = searchRequests({ providerId: 'PRV004' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ003');
      expect(results[0].providerId).toBe('PRV004');
    });

    it('returns an empty array when provider ID does not match any request', () => {
      const results = searchRequests({ providerId: 'PRV999' });
      expect(results).toEqual([]);
    });

    it('ignores providerId filter when it is an empty string', () => {
      const results = searchRequests({ providerId: '' });
      expect(results).toHaveLength(5);
    });
  });

  describe('filter by status', () => {
    it('returns requests matching the specified status', () => {
      const results = searchRequests({ status: 'NEW' });
      expect(results).toHaveLength(2);
      results.forEach((r) => {
        expect(r.status).toBe('NEW');
      });
    });

    it('returns a single request for a status with one match', () => {
      const results = searchRequests({ status: 'IN_PROGRESS' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ002');
    });

    it('returns requests matching PROCESSED status', () => {
      const results = searchRequests({ status: 'PROCESSED' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ003');
    });

    it('returns requests matching CLOSED status', () => {
      const results = searchRequests({ status: 'CLOSED' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ004');
    });

    it('returns an empty array when status does not match any request', () => {
      const results = searchRequests({ status: 'NONEXISTENT_STATUS' });
      expect(results).toEqual([]);
    });

    it('ignores status filter when it is an empty string', () => {
      const results = searchRequests({ status: '' });
      expect(results).toHaveLength(5);
    });
  });

  describe('filter by requestType', () => {
    it('returns requests matching REFUND type', () => {
      const results = searchRequests({ requestType: 'REFUND' });
      expect(results).toHaveLength(3);
      results.forEach((r) => {
        expect(r.requestType).toBe('REFUND');
      });
    });

    it('returns requests matching RECOUPMENT type', () => {
      const results = searchRequests({ requestType: 'RECOUPMENT' });
      expect(results).toHaveLength(2);
      results.forEach((r) => {
        expect(r.requestType).toBe('RECOUPMENT');
      });
    });

    it('returns an empty array when request type does not match any request', () => {
      const results = searchRequests({ requestType: 'UNKNOWN' });
      expect(results).toEqual([]);
    });

    it('ignores requestType filter when it is an empty string', () => {
      const results = searchRequests({ requestType: '' });
      expect(results).toHaveLength(5);
    });
  });

  describe('filter by date range', () => {
    it('returns requests created on or after dateFrom', () => {
      const results = searchRequests({ dateFrom: '2024-06-01' });
      expect(results).toHaveLength(2);
      const ids = results.map((r) => r.id);
      expect(ids).toContain('REQ001');
      expect(ids).toContain('REQ005');
    });

    it('returns requests created on or before dateTo', () => {
      const results = searchRequests({ dateTo: '2024-04-20' });
      expect(results).toHaveLength(2);
      const ids = results.map((r) => r.id);
      expect(ids).toContain('REQ003');
      expect(ids).toContain('REQ004');
    });

    it('returns requests within a date range (dateFrom and dateTo)', () => {
      const results = searchRequests({ dateFrom: '2024-04-01', dateTo: '2024-05-31' });
      expect(results).toHaveLength(2);
      const ids = results.map((r) => r.id);
      expect(ids).toContain('REQ002');
      expect(ids).toContain('REQ003');
    });

    it('returns an empty array when no requests fall within the date range', () => {
      const results = searchRequests({ dateFrom: '2025-01-01', dateTo: '2025-12-31' });
      expect(results).toEqual([]);
    });

    it('includes requests on the exact dateTo day', () => {
      const results = searchRequests({ dateTo: '2024-03-01' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ004');
    });

    it('ignores dateFrom filter when it is an empty string', () => {
      const results = searchRequests({ dateFrom: '' });
      expect(results).toHaveLength(5);
    });

    it('ignores dateTo filter when it is an empty string', () => {
      const results = searchRequests({ dateTo: '' });
      expect(results).toHaveLength(5);
    });
  });

  describe('combined filters', () => {
    it('filters by both status and requestType', () => {
      const results = searchRequests({ status: 'NEW', requestType: 'REFUND' });
      expect(results).toHaveLength(2);
      results.forEach((r) => {
        expect(r.status).toBe('NEW');
        expect(r.requestType).toBe('REFUND');
      });
    });

    it('filters by memberId and status', () => {
      const results = searchRequests({ memberId: 'MEM001', status: 'NEW' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ001');
    });

    it('filters by requestType and date range', () => {
      const results = searchRequests({ requestType: 'RECOUPMENT', dateFrom: '2024-05-01', dateTo: '2024-06-30' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ002');
    });

    it('filters by providerId and requestType', () => {
      const results = searchRequests({ providerId: 'PRV001', requestType: 'REFUND' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ001');
    });

    it('returns empty array when combined filters match no requests', () => {
      const results = searchRequests({ memberId: 'MEM001', status: 'CLOSED' });
      expect(results).toEqual([]);
    });

    it('filters by requestId combined with status', () => {
      const results = searchRequests({ requestId: 'REQ001', status: 'NEW' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ001');
    });

    it('returns empty when requestId matches but status does not', () => {
      const results = searchRequests({ requestId: 'REQ001', status: 'PROCESSED' });
      expect(results).toEqual([]);
    });

    it('filters by all criteria simultaneously', () => {
      const results = searchRequests({
        requestId: 'REQ002',
        memberId: 'MEM003',
        providerId: 'PRV002',
        status: 'IN_PROGRESS',
        requestType: 'RECOUPMENT',
        dateFrom: '2024-05-01',
        dateTo: '2024-06-01',
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('REQ002');
    });
  });

  describe('edge cases', () => {
    it('handles undefined filters gracefully', () => {
      const results = searchRequests({
        requestId: undefined,
        memberId: undefined,
        providerId: undefined,
        status: undefined,
        requestType: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      });
      expect(results).toHaveLength(5);
    });

    it('handles requests with missing createdDate when filtering by date', () => {
      const requestsWithMissingDate = [
        ...SAMPLE_REQUESTS,
        {
          id: 'REQ006',
          requestType: 'REFUND',
          status: 'NEW',
          memberId: 'MEM010',
          providerId: 'PRV010',
          amount: 500,
          createdDate: null,
          updatedDate: null,
        },
      ];
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify(requestsWithMissingDate);

      const results = searchRequests({ dateFrom: '2024-01-01' });
      // REQ006 should be excluded because createdDate is null
      expect(results).toHaveLength(5);
      expect(results.find((r) => r.id === 'REQ006')).toBeUndefined();
    });

    it('returns empty array when localStorage has corrupted data', () => {
      store[STORAGE_KEYS.REQUEST_MASTER] = '{invalid json';
      const results = searchRequests({});
      expect(results).toEqual([]);
    });
  });
});