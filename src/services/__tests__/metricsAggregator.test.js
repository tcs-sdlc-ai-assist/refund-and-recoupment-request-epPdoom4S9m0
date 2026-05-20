import { describe, it, expect } from 'vitest';
import { getAggregatedMetrics } from '../metricsAggregator';

describe('metricsAggregator', () => {
  describe('getAggregatedMetrics', () => {
    it('returns zeroed metrics when given an empty array', () => {
      const result = getAggregatedMetrics([]);

      expect(result.totalRefundAmount).toBe(0);
      expect(result.totalRecoupmentAmount).toBe(0);
      expect(result.totalRequests).toBe(0);
      expect(result.monthlySummary).toEqual([]);
    });

    it('returns zeroed metrics when given null', () => {
      const result = getAggregatedMetrics(null);

      expect(result.totalRefundAmount).toBe(0);
      expect(result.totalRecoupmentAmount).toBe(0);
      expect(result.totalRequests).toBe(0);
      expect(result.monthlySummary).toEqual([]);
    });

    it('returns zeroed metrics when given undefined', () => {
      const result = getAggregatedMetrics(undefined);

      expect(result.totalRefundAmount).toBe(0);
      expect(result.totalRecoupmentAmount).toBe(0);
      expect(result.totalRequests).toBe(0);
      expect(result.monthlySummary).toEqual([]);
    });

    it('returns zeroed metrics when given a non-array value', () => {
      const result = getAggregatedMetrics('not an array');

      expect(result.totalRefundAmount).toBe(0);
      expect(result.totalRecoupmentAmount).toBe(0);
      expect(result.totalRequests).toBe(0);
      expect(result.monthlySummary).toEqual([]);
    });

    it('correctly aggregates mixed request types', () => {
      const requests = [
        { requestType: 'REFUND', amount: 1500.00, createdDate: '2024-06-01T10:00:00.000Z' },
        { requestType: 'RECOUPMENT', amount: 3200.50, createdDate: '2024-06-15T08:30:00.000Z' },
        { requestType: 'REFUND', amount: 750.00, createdDate: '2024-05-20T12:00:00.000Z' },
        { requestType: 'RECOUPMENT', amount: 2100.75, createdDate: '2024-05-10T07:00:00.000Z' },
        { requestType: 'REFUND', amount: 980.25, createdDate: '2024-06-12T15:30:00.000Z' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(3230.25);
      expect(result.totalRecoupmentAmount).toBe(5301.25);
      expect(result.totalRequests).toBe(5);
    });

    it('correctly aggregates only REFUND requests', () => {
      const requests = [
        { requestType: 'REFUND', amount: 100.00, createdDate: '2024-06-01' },
        { requestType: 'REFUND', amount: 200.50, createdDate: '2024-06-02' },
        { requestType: 'REFUND', amount: 300.75, createdDate: '2024-06-03' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(601.25);
      expect(result.totalRecoupmentAmount).toBe(0);
      expect(result.totalRequests).toBe(3);
    });

    it('correctly aggregates only RECOUPMENT requests', () => {
      const requests = [
        { requestType: 'RECOUPMENT', amount: 500.00, createdDate: '2024-04-01' },
        { requestType: 'RECOUPMENT', amount: 1500.50, createdDate: '2024-04-15' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(0);
      expect(result.totalRecoupmentAmount).toBe(2000.50);
      expect(result.totalRequests).toBe(2);
    });

    it('groups monthly summary correctly by YYYY-MM', () => {
      const requests = [
        { requestType: 'REFUND', amount: 1000.00, createdDate: '2024-06-01T10:00:00.000Z' },
        { requestType: 'RECOUPMENT', amount: 500.00, createdDate: '2024-06-15T08:30:00.000Z' },
        { requestType: 'REFUND', amount: 750.00, createdDate: '2024-05-20T12:00:00.000Z' },
        { requestType: 'RECOUPMENT', amount: 250.00, createdDate: '2024-05-10T07:00:00.000Z' },
        { requestType: 'REFUND', amount: 300.00, createdDate: '2024-04-05T09:00:00.000Z' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.monthlySummary).toHaveLength(3);

      // Sorted descending by month
      expect(result.monthlySummary[0].month).toBe('2024-06');
      expect(result.monthlySummary[1].month).toBe('2024-05');
      expect(result.monthlySummary[2].month).toBe('2024-04');
    });

    it('calculates correct monthly refund and recoupment amounts', () => {
      const requests = [
        { requestType: 'REFUND', amount: 1000.00, createdDate: '2024-06-01' },
        { requestType: 'RECOUPMENT', amount: 500.00, createdDate: '2024-06-15' },
        { requestType: 'REFUND', amount: 200.00, createdDate: '2024-06-20' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.monthlySummary).toHaveLength(1);
      expect(result.monthlySummary[0].month).toBe('2024-06');
      expect(result.monthlySummary[0].refundAmount).toBe(1200.00);
      expect(result.monthlySummary[0].recoupmentAmount).toBe(500.00);
      expect(result.monthlySummary[0].requestCount).toBe(3);
    });

    it('sorts monthly summary in descending order by month', () => {
      const requests = [
        { requestType: 'REFUND', amount: 100, createdDate: '2024-01-15' },
        { requestType: 'REFUND', amount: 200, createdDate: '2024-06-10' },
        { requestType: 'REFUND', amount: 300, createdDate: '2024-03-20' },
        { requestType: 'REFUND', amount: 400, createdDate: '2024-12-01' },
      ];

      const result = getAggregatedMetrics(requests);

      const months = result.monthlySummary.map((s) => s.month);
      expect(months).toEqual(['2024-12', '2024-06', '2024-03', '2024-01']);
    });

    it('handles amount precision correctly with floating point values', () => {
      const requests = [
        { requestType: 'REFUND', amount: 0.1, createdDate: '2024-06-01' },
        { requestType: 'REFUND', amount: 0.2, createdDate: '2024-06-02' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(0.3);
    });

    it('handles large amounts correctly', () => {
      const requests = [
        { requestType: 'REFUND', amount: 999999.99, createdDate: '2024-06-01' },
        { requestType: 'REFUND', amount: 0.01, createdDate: '2024-06-02' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(1000000.00);
    });

    it('skips null entries in the requests array', () => {
      const requests = [
        { requestType: 'REFUND', amount: 100, createdDate: '2024-06-01' },
        null,
        { requestType: 'RECOUPMENT', amount: 200, createdDate: '2024-06-02' },
        undefined,
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(100);
      expect(result.totalRecoupmentAmount).toBe(200);
      expect(result.totalRequests).toBe(2);
    });

    it('treats requests with unknown requestType as neither refund nor recoupment', () => {
      const requests = [
        { requestType: 'UNKNOWN', amount: 500, createdDate: '2024-06-01' },
        { requestType: 'REFUND', amount: 100, createdDate: '2024-06-02' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(100);
      expect(result.totalRecoupmentAmount).toBe(0);
      expect(result.totalRequests).toBe(2);
    });

    it('handles requests with missing amount by treating as 0', () => {
      const requests = [
        { requestType: 'REFUND', createdDate: '2024-06-01' },
        { requestType: 'REFUND', amount: 100, createdDate: '2024-06-02' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(100);
      expect(result.totalRequests).toBe(2);
    });

    it('handles requests with NaN amount by treating as 0', () => {
      const requests = [
        { requestType: 'REFUND', amount: NaN, createdDate: '2024-06-01' },
        { requestType: 'REFUND', amount: 250, createdDate: '2024-06-02' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(250);
      expect(result.totalRequests).toBe(2);
    });

    it('handles requests with string amount by converting to number', () => {
      const requests = [
        { requestType: 'REFUND', amount: '150.50', createdDate: '2024-06-01' },
        { requestType: 'REFUND', amount: 100, createdDate: '2024-06-02' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(250.50);
    });

    it('excludes requests with missing createdDate from monthly summary', () => {
      const requests = [
        { requestType: 'REFUND', amount: 100, createdDate: '2024-06-01' },
        { requestType: 'REFUND', amount: 200, createdDate: null },
        { requestType: 'REFUND', amount: 300 },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(600);
      expect(result.totalRequests).toBe(3);
      expect(result.monthlySummary).toHaveLength(1);
      expect(result.monthlySummary[0].month).toBe('2024-06');
      expect(result.monthlySummary[0].refundAmount).toBe(100);
      expect(result.monthlySummary[0].requestCount).toBe(1);
    });

    it('excludes requests with invalid createdDate from monthly summary', () => {
      const requests = [
        { requestType: 'REFUND', amount: 100, createdDate: '2024-06-01' },
        { requestType: 'REFUND', amount: 200, createdDate: 'invalid' },
        { requestType: 'REFUND', amount: 300, createdDate: '2024' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(600);
      expect(result.totalRequests).toBe(3);
      expect(result.monthlySummary).toHaveLength(1);
      expect(result.monthlySummary[0].month).toBe('2024-06');
    });

    it('handles a single request correctly', () => {
      const requests = [
        { requestType: 'RECOUPMENT', amount: 4500.99, createdDate: '2024-08-15T10:00:00.000Z' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(0);
      expect(result.totalRecoupmentAmount).toBe(4500.99);
      expect(result.totalRequests).toBe(1);
      expect(result.monthlySummary).toHaveLength(1);
      expect(result.monthlySummary[0].month).toBe('2024-08');
      expect(result.monthlySummary[0].refundAmount).toBe(0);
      expect(result.monthlySummary[0].recoupmentAmount).toBe(4500.99);
      expect(result.monthlySummary[0].requestCount).toBe(1);
    });

    it('returns all expected fields in the result object', () => {
      const requests = [
        { requestType: 'REFUND', amount: 100, createdDate: '2024-06-01' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result).toHaveProperty('totalRefundAmount');
      expect(result).toHaveProperty('totalRecoupmentAmount');
      expect(result).toHaveProperty('totalRequests');
      expect(result).toHaveProperty('monthlySummary');
      expect(typeof result.totalRefundAmount).toBe('number');
      expect(typeof result.totalRecoupmentAmount).toBe('number');
      expect(typeof result.totalRequests).toBe('number');
      expect(Array.isArray(result.monthlySummary)).toBe(true);
    });

    it('returns all expected fields in monthly summary entries', () => {
      const requests = [
        { requestType: 'REFUND', amount: 100, createdDate: '2024-06-01' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.monthlySummary).toHaveLength(1);
      const entry = result.monthlySummary[0];
      expect(entry).toHaveProperty('month');
      expect(entry).toHaveProperty('refundAmount');
      expect(entry).toHaveProperty('recoupmentAmount');
      expect(entry).toHaveProperty('requestCount');
      expect(typeof entry.month).toBe('string');
      expect(typeof entry.refundAmount).toBe('number');
      expect(typeof entry.recoupmentAmount).toBe('number');
      expect(typeof entry.requestCount).toBe('number');
    });

    it('correctly handles multiple months with mixed types', () => {
      const requests = [
        { requestType: 'REFUND', amount: 1500.00, createdDate: '2024-06-01T10:00:00.000Z' },
        { requestType: 'RECOUPMENT', amount: 3200.50, createdDate: '2024-05-15T08:30:00.000Z' },
        { requestType: 'REFUND', amount: 750.00, createdDate: '2024-04-20T12:00:00.000Z' },
        { requestType: 'RECOUPMENT', amount: 2100.75, createdDate: '2024-03-01T07:00:00.000Z' },
        { requestType: 'REFUND', amount: 980.25, createdDate: '2024-06-12T15:30:00.000Z' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(3230.25);
      expect(result.totalRecoupmentAmount).toBe(5301.25);
      expect(result.totalRequests).toBe(5);
      expect(result.monthlySummary).toHaveLength(4);

      const june = result.monthlySummary.find((s) => s.month === '2024-06');
      expect(june).toBeDefined();
      expect(june.refundAmount).toBe(2480.25);
      expect(june.recoupmentAmount).toBe(0);
      expect(june.requestCount).toBe(2);

      const may = result.monthlySummary.find((s) => s.month === '2024-05');
      expect(may).toBeDefined();
      expect(may.refundAmount).toBe(0);
      expect(may.recoupmentAmount).toBe(3200.50);
      expect(may.requestCount).toBe(1);

      const april = result.monthlySummary.find((s) => s.month === '2024-04');
      expect(april).toBeDefined();
      expect(april.refundAmount).toBe(750.00);
      expect(april.recoupmentAmount).toBe(0);
      expect(april.requestCount).toBe(1);

      const march = result.monthlySummary.find((s) => s.month === '2024-03');
      expect(march).toBeDefined();
      expect(march.refundAmount).toBe(0);
      expect(march.recoupmentAmount).toBe(2100.75);
      expect(march.requestCount).toBe(1);
    });

    it('rounds amounts to two decimal places', () => {
      const requests = [
        { requestType: 'REFUND', amount: 10.005, createdDate: '2024-06-01' },
        { requestType: 'REFUND', amount: 20.005, createdDate: '2024-06-02' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.totalRefundAmount).toBe(30.01);
    });

    it('handles requests with date-only createdDate format (YYYY-MM-DD)', () => {
      const requests = [
        { requestType: 'REFUND', amount: 100, createdDate: '2024-06-01' },
        { requestType: 'RECOUPMENT', amount: 200, createdDate: '2024-06-15' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.monthlySummary).toHaveLength(1);
      expect(result.monthlySummary[0].month).toBe('2024-06');
      expect(result.monthlySummary[0].requestCount).toBe(2);
    });

    it('handles requests with ISO createdDate format', () => {
      const requests = [
        { requestType: 'REFUND', amount: 100, createdDate: '2024-06-01T10:00:00.000Z' },
        { requestType: 'RECOUPMENT', amount: 200, createdDate: '2024-06-15T08:30:00.000Z' },
      ];

      const result = getAggregatedMetrics(requests);

      expect(result.monthlySummary).toHaveLength(1);
      expect(result.monthlySummary[0].month).toBe('2024-06');
      expect(result.monthlySummary[0].requestCount).toBe(2);
    });
  });
});