import { useState, useEffect, useCallback } from 'react';
import { ReportTypeDropdown } from '../components/ReportTypeDropdown';
import { MetricsTable } from '../components/MetricsTable';
import { MonthlySummaryTable } from '../components/MonthlySummaryTable';
import { getAllRequests } from '../services/requestRepository';
import { getAggregatedMetrics } from '../services/metricsAggregator';
import { exportReportCSV } from '../services/csvExporter';

/**
 * Reports page component matching PRD wireframe.
 * Composes ReportTypeDropdown, MetricsTable, and MonthlySummaryTable.
 * Fetches all requests from requestRepository, calculates metrics via metricsAggregator,
 * and displays based on selected report type. Includes Generate Report button to refresh
 * metrics and Export button that triggers csvExporter.
 *
 * @returns {JSX.Element} The rendered Reports page
 */
export function Reports() {
  const [selectedType, setSelectedType] = useState('ALL');
  const [metrics, setMetrics] = useState({
    totalRefundAmount: 0,
    totalRecoupmentAmount: 0,
    totalRequests: 0,
    monthlySummary: [],
  });
  const [exportMessage, setExportMessage] = useState('');
  const [exportError, setExportError] = useState('');

  /**
   * Loads all requests and computes aggregated metrics.
   */
  const loadMetrics = useCallback(() => {
    try {
      const requests = getAllRequests();
      const aggregated = getAggregatedMetrics(requests);
      setMetrics({
        totalRefundAmount: aggregated.totalRefundAmount,
        totalRecoupmentAmount: aggregated.totalRecoupmentAmount,
        totalRequests: aggregated.totalRequests,
        monthlySummary: aggregated.monthlySummary,
      });
      setExportError('');
    } catch (err) {
      setExportError('Failed to load report data. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  /**
   * Handles report type selection change.
   * @param {string} newType - The newly selected report type value
   */
  const handleTypeChange = useCallback((newType) => {
    setSelectedType(newType);
    setExportMessage('');
    setExportError('');
  }, []);

  /**
   * Handles the Generate Report button click by refreshing metrics.
   */
  const handleGenerateReport = useCallback(() => {
    setExportMessage('');
    setExportError('');
    loadMetrics();
    setExportMessage('Report generated successfully.');
  }, [loadMetrics]);

  /**
   * Handles the Export CSV button click by triggering a CSV download.
   */
  const handleExport = useCallback(() => {
    setExportMessage('');
    setExportError('');

    const success = exportReportCSV(metrics);
    if (success) {
      setExportMessage('CSV export initiated successfully.');
    } else {
      setExportError('Failed to export CSV. Please try again.');
    }
  }, [metrics]);

  /**
   * Determines whether to show the metrics table based on selected report type.
   * @returns {boolean}
   */
  function shouldShowMetricsTable() {
    return selectedType === 'ALL' || selectedType === 'TOTAL_REFUNDS' || selectedType === 'TOTAL_RECOUPMENTS';
  }

  /**
   * Determines whether to show the monthly summary table based on selected report type.
   * @returns {boolean}
   */
  function shouldShowMonthlySummary() {
    return selectedType === 'ALL' || selectedType === 'MONTHLY_SUMMARY';
  }

  /**
   * Returns a filtered metrics object based on the selected report type.
   * @returns {Object} The filtered metrics for the MetricsTable
   */
  function getFilteredMetrics() {
    if (selectedType === 'TOTAL_REFUNDS') {
      return {
        totalRefundAmount: metrics.totalRefundAmount,
        totalRecoupmentAmount: 0,
        totalRequests: metrics.totalRequests,
      };
    }
    if (selectedType === 'TOTAL_RECOUPMENTS') {
      return {
        totalRefundAmount: 0,
        totalRecoupmentAmount: metrics.totalRecoupmentAmount,
        totalRequests: metrics.totalRequests,
      };
    }
    return {
      totalRefundAmount: metrics.totalRefundAmount,
      totalRecoupmentAmount: metrics.totalRecoupmentAmount,
      totalRequests: metrics.totalRequests,
    };
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Reports</h1>
        <p className="mt-2 text-sm text-neutral-500">
          View aggregated metrics and summary reports for refund and recoupment requests.
        </p>
      </div>

      {exportMessage && (
        <div className="mb-4 rounded-md bg-accent-50 border border-accent-300 p-3">
          <p className="text-sm text-accent-800">{exportMessage}</p>
        </div>
      )}

      {exportError && (
        <div className="mb-4 rounded-md bg-danger-50 border border-danger-300 p-3">
          <p className="text-sm text-danger-800">{exportError}</p>
        </div>
      )}

      {/* Controls Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <ReportTypeDropdown
            selectedType={selectedType}
            onChange={handleTypeChange}
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerateReport}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Generate Report
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      {shouldShowMetricsTable() && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">
            Summary Metrics
          </h2>
          <MetricsTable metrics={getFilteredMetrics()} />
        </div>
      )}

      {/* Monthly Summary Table */}
      {shouldShowMonthlySummary() && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">
            Monthly Summary
          </h2>
          <MonthlySummaryTable monthlySummary={metrics.monthlySummary} />
        </div>
      )}
    </div>
  );
}

export default Reports;