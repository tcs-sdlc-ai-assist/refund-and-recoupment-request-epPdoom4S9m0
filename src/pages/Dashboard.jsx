import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SummaryCard } from '../components/SummaryCard';
import { seedData } from '../services/seedData';
import { getAllRequests } from '../services/requestRepository';
import { getAggregatedMetrics } from '../services/metricsAggregator';
import { clearAll } from '../services/localStorageService';

/**
 * Formats a currency amount for display.
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '$0.00';
  }
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Main Dashboard page component matching PRD wireframe.
 * Displays summary section with SummaryCards (Total Requests, Total Refund Amt,
 * Total Recoupment Amt) calculated from requestRepository.
 * Actions section with navigation buttons: Create Request, Search Requests,
 * Reports, and Exit (clears session).
 * Seeds data on first load via seedData utility.
 *
 * @returns {JSX.Element} The rendered Dashboard page
 */
export function Dashboard() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalRefundAmount: 0,
    totalRecoupmentAmount: 0,
    totalRequests: 0,
  });

  useEffect(() => {
    seedData();
    loadMetrics();
  }, []);

  /**
   * Loads all requests and computes aggregated metrics for display.
   */
  function loadMetrics() {
    const requests = getAllRequests();
    const aggregated = getAggregatedMetrics(requests);
    setMetrics({
      totalRefundAmount: aggregated.totalRefundAmount,
      totalRecoupmentAmount: aggregated.totalRecoupmentAmount,
      totalRequests: aggregated.totalRequests,
    });
  }

  /**
   * Handles the Exit action by clearing all application data from localStorage
   * and reloading the page.
   */
  const handleExit = useCallback(() => {
    clearAll();
    window.location.reload();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Overview of refund and recoupment request activity.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <SummaryCard
          title="Total Requests"
          value={String(metrics.totalRequests)}
        />
        <SummaryCard
          title="Total Refund Amount"
          value={formatCurrency(metrics.totalRefundAmount)}
        />
        <SummaryCard
          title="Total Recoupment Amount"
          value={formatCurrency(metrics.totalRecoupmentAmount)}
        />
      </div>

      {/* Actions Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            Create Request
          </button>
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            Search Requests
          </button>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            Reports
          </button>
          <button
            type="button"
            onClick={handleExit}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;