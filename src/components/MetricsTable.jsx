import PropTypes from 'prop-types';

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
 * Metrics display table component for the Reports screen.
 * Renders a two-column table (Metric | Value) showing Total Refund Amount,
 * Total Recoupment Amount, and Total Requests. Accepts metrics object as prop.
 *
 * @param {Object} props
 * @param {Object} props.metrics - The aggregated metrics object
 * @param {number} props.metrics.totalRefundAmount - Total refund amount
 * @param {number} props.metrics.totalRecoupmentAmount - Total recoupment amount
 * @param {number} props.metrics.totalRequests - Total number of requests
 * @returns {JSX.Element} The rendered MetricsTable component
 */
export function MetricsTable({ metrics }) {
  const thClasses =
    'px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider';
  const tdClasses = 'px-4 py-3 text-sm text-neutral-700 whitespace-nowrap';

  const rows = [
    {
      label: 'Total Refund Amount',
      value: formatCurrency(metrics.totalRefundAmount),
    },
    {
      label: 'Total Recoupment Amount',
      value: formatCurrency(metrics.totalRecoupmentAmount),
    },
    {
      label: 'Total Requests',
      value: metrics.totalRequests != null ? String(metrics.totalRequests) : '0',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className={thClasses}>Metric</th>
              <th className={thClasses}>Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {rows.map((row) => (
              <tr
                key={row.label}
                className="hover:bg-neutral-50 transition-colors"
              >
                <td className={tdClasses}>
                  <span className="font-medium text-neutral-900">
                    {row.label}
                  </span>
                </td>
                <td className={tdClasses}>
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

MetricsTable.propTypes = {
  /** The aggregated metrics object containing totals */
  metrics: PropTypes.shape({
    totalRefundAmount: PropTypes.number,
    totalRecoupmentAmount: PropTypes.number,
    totalRequests: PropTypes.number,
  }).isRequired,
};

export default MetricsTable;