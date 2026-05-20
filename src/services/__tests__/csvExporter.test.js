import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCSVString, exportReportCSV } from '../csvExporter';

describe('csvExporter', () => {
  describe('generateCSVString', () => {
    it('generates correct CSV string with full metrics data', () => {
      const metrics = {
        totalRefundAmount: 2500.50,
        totalRecoupmentAmount: 1800.75,
        totalRequests: 10,
        monthlySummary: [
          { month: '2024-06', refundAmount: 1500.00, recoupmentAmount: 800.00, requestCount: 5 },
          { month: '2024-05', refundAmount: 1000.50, recoupmentAmount: 1000.75, requestCount: 5 },
        ],
      };

      const csv = generateCSVString(metrics);

      expect(csv).toContain('Metric,Value');
      expect(csv).toContain('Total Refund Amount,2500.50');
      expect(csv).toContain('Total Recoupment Amount,1800.75');
      expect(csv).toContain('Total Requests,10');
      expect(csv).toContain('Month,Refund Amount,Recoupment Amount,Request Count');
      expect(csv).toContain('2024-06,1500.00,800.00,5');
      expect(csv).toContain('2024-05,1000.50,1000.75,5');
    });

    it('generates correct CSV string with empty metrics', () => {
      const metrics = {
        totalRefundAmount: 0,
        totalRecoupmentAmount: 0,
        totalRequests: 0,
        monthlySummary: [],
      };

      const csv = generateCSVString(metrics);

      expect(csv).toContain('Metric,Value');
      expect(csv).toContain('Total Refund Amount,0.00');
      expect(csv).toContain('Total Recoupment Amount,0.00');
      expect(csv).toContain('Total Requests,0');
      expect(csv).not.toContain('Month,Refund Amount,Recoupment Amount,Request Count');
    });

    it('generates default CSV when given null', () => {
      const csv = generateCSVString(null);

      expect(csv).toContain('Metric,Value');
      expect(csv).toContain('Total Refund Amount,0.00');
      expect(csv).toContain('Total Recoupment Amount,0.00');
      expect(csv).toContain('Total Requests,0');
    });

    it('generates default CSV when given undefined', () => {
      const csv = generateCSVString(undefined);

      expect(csv).toContain('Metric,Value');
      expect(csv).toContain('Total Refund Amount,0.00');
      expect(csv).toContain('Total Recoupment Amount,0.00');
      expect(csv).toContain('Total Requests,0');
    });

    it('generates default CSV when given a non-object value', () => {
      const csv = generateCSVString('not an object');

      expect(csv).toContain('Metric,Value');
      expect(csv).toContain('Total Refund Amount,0.00');
      expect(csv).toContain('Total Recoupment Amount,0.00');
      expect(csv).toContain('Total Requests,0');
    });

    it('formats numbers to two decimal places', () => {
      const metrics = {
        totalRefundAmount: 1234.5,
        totalRecoupmentAmount: 5678,
        totalRequests: 3,
        monthlySummary: [],
      };

      const csv = generateCSVString(metrics);

      expect(csv).toContain('Total Refund Amount,1234.50');
      expect(csv).toContain('Total Recoupment Amount,5678.00');
    });

    it('handles NaN amounts by treating as 0.00', () => {
      const metrics = {
        totalRefundAmount: NaN,
        totalRecoupmentAmount: NaN,
        totalRequests: 0,
        monthlySummary: [],
      };

      const csv = generateCSVString(metrics);

      expect(csv).toContain('Total Refund Amount,0.00');
      expect(csv).toContain('Total Recoupment Amount,0.00');
    });

    it('handles null amounts by treating as 0.00', () => {
      const metrics = {
        totalRefundAmount: null,
        totalRecoupmentAmount: null,
        totalRequests: 0,
        monthlySummary: [],
      };

      const csv = generateCSVString(metrics);

      expect(csv).toContain('Total Refund Amount,0.00');
      expect(csv).toContain('Total Recoupment Amount,0.00');
    });

    it('handles missing monthlySummary gracefully', () => {
      const metrics = {
        totalRefundAmount: 100,
        totalRecoupmentAmount: 200,
        totalRequests: 2,
      };

      const csv = generateCSVString(metrics);

      expect(csv).toContain('Metric,Value');
      expect(csv).toContain('Total Refund Amount,100.00');
      expect(csv).toContain('Total Recoupment Amount,200.00');
      expect(csv).toContain('Total Requests,2');
      expect(csv).not.toContain('Month,Refund Amount,Recoupment Amount,Request Count');
    });

    it('handles monthlySummary with missing amounts', () => {
      const metrics = {
        totalRefundAmount: 100,
        totalRecoupmentAmount: 0,
        totalRequests: 1,
        monthlySummary: [
          { month: '2024-06', refundAmount: null, recoupmentAmount: undefined, requestCount: 0 },
        ],
      };

      const csv = generateCSVString(metrics);

      expect(csv).toContain('2024-06,0.00,0.00,0');
    });

    it('includes headers in the correct order', () => {
      const metrics = {
        totalRefundAmount: 100,
        totalRecoupmentAmount: 200,
        totalRequests: 5,
        monthlySummary: [
          { month: '2024-06', refundAmount: 100, recoupmentAmount: 200, requestCount: 5 },
        ],
      };

      const csv = generateCSVString(metrics);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('Metric,Value');
      expect(lines[1]).toBe('Total Refund Amount,100.00');
      expect(lines[2]).toBe('Total Recoupment Amount,200.00');
      expect(lines[3]).toBe('Total Requests,5');
      expect(lines[4]).toBe('');
      expect(lines[5]).toBe('Month,Refund Amount,Recoupment Amount,Request Count');
      expect(lines[6]).toBe('2024-06,100.00,200.00,5');
    });

    it('ends with a newline character', () => {
      const metrics = {
        totalRefundAmount: 0,
        totalRecoupmentAmount: 0,
        totalRequests: 0,
        monthlySummary: [],
      };

      const csv = generateCSVString(metrics);

      expect(csv.endsWith('\n')).toBe(true);
    });

    it('handles large amounts correctly', () => {
      const metrics = {
        totalRefundAmount: 999999999.99,
        totalRecoupmentAmount: 1000000.01,
        totalRequests: 50000,
        monthlySummary: [],
      };

      const csv = generateCSVString(metrics);

      expect(csv).toContain('Total Refund Amount,999999999.99');
      expect(csv).toContain('Total Recoupment Amount,1000000.01');
      expect(csv).toContain('Total Requests,50000');
    });

    it('handles multiple monthly summary entries', () => {
      const metrics = {
        totalRefundAmount: 600,
        totalRecoupmentAmount: 300,
        totalRequests: 6,
        monthlySummary: [
          { month: '2024-06', refundAmount: 200, recoupmentAmount: 100, requestCount: 2 },
          { month: '2024-05', refundAmount: 200, recoupmentAmount: 100, requestCount: 2 },
          { month: '2024-04', refundAmount: 200, recoupmentAmount: 100, requestCount: 2 },
        ],
      };

      const csv = generateCSVString(metrics);

      expect(csv).toContain('2024-06,200.00,100.00,2');
      expect(csv).toContain('2024-05,200.00,100.00,2');
      expect(csv).toContain('2024-04,200.00,100.00,2');
    });
  });

  describe('exportReportCSV', () => {
    let mockCreateObjectURL;
    let mockRevokeObjectURL;
    let mockClick;
    let mockLink;

    beforeEach(() => {
      mockClick = vi.fn();
      mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: mockClick,
      };

      mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost/fake-url');
      mockRevokeObjectURL = vi.fn();

      vi.stubGlobal('URL', {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      });

      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return mockLink;
        }
        return document.createElement(tag);
      });

      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns true on successful export', () => {
      const metrics = {
        totalRefundAmount: 1000,
        totalRecoupmentAmount: 500,
        totalRequests: 5,
        monthlySummary: [],
      };

      const result = exportReportCSV(metrics);

      expect(result).toBe(true);
    });

    it('creates a Blob with CSV content', () => {
      const metrics = {
        totalRefundAmount: 1000,
        totalRecoupmentAmount: 500,
        totalRequests: 5,
        monthlySummary: [],
      };

      exportReportCSV(metrics);

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      const blobArg = mockCreateObjectURL.mock.calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);
    });

    it('creates a download link and triggers click', () => {
      const metrics = {
        totalRefundAmount: 1000,
        totalRecoupmentAmount: 500,
        totalRequests: 5,
        monthlySummary: [],
      };

      exportReportCSV(metrics);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:http://localhost/fake-url');
      expect(mockLink.download).toMatch(/^refund_recoupment_report_\d{8}_\d{6}\.csv$/);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('appends and removes the link from document body', () => {
      const metrics = {
        totalRefundAmount: 1000,
        totalRecoupmentAmount: 500,
        totalRequests: 5,
        monthlySummary: [],
      };

      exportReportCSV(metrics);

      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });

    it('sets link style to display none', () => {
      const metrics = {
        totalRefundAmount: 1000,
        totalRecoupmentAmount: 500,
        totalRequests: 5,
        monthlySummary: [],
      };

      exportReportCSV(metrics);

      expect(mockLink.style.display).toBe('none');
    });

    it('returns false when an error occurs during export', () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Blob creation failed');
      });

      const metrics = {
        totalRefundAmount: 1000,
        totalRecoupmentAmount: 500,
        totalRequests: 5,
        monthlySummary: [],
      };

      const result = exportReportCSV(metrics);

      expect(result).toBe(false);
    });

    it('generates a filename with correct format', () => {
      const metrics = {
        totalRefundAmount: 0,
        totalRecoupmentAmount: 0,
        totalRequests: 0,
        monthlySummary: [],
      };

      exportReportCSV(metrics);

      expect(mockLink.download).toMatch(/^refund_recoupment_report_\d{8}_\d{6}\.csv$/);
    });

    it('handles null metrics gracefully', () => {
      const result = exportReportCSV(null);

      expect(result).toBe(true);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('handles metrics with monthlySummary data', () => {
      const metrics = {
        totalRefundAmount: 2000,
        totalRecoupmentAmount: 1000,
        totalRequests: 10,
        monthlySummary: [
          { month: '2024-06', refundAmount: 1000, recoupmentAmount: 500, requestCount: 5 },
          { month: '2024-05', refundAmount: 1000, recoupmentAmount: 500, requestCount: 5 },
        ],
      };

      const result = exportReportCSV(metrics);

      expect(result).toBe(true);
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });
  });
});