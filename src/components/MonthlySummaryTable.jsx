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
 * Formats a YYYY-MM month string into a more readable display format.
 * @param {string} month - The month string in YYYY-MM format
 * @returns {string} The formatted month string (e.g. "June 2024")
 */
function formatMonth(month) {
  if (!month || typeof month !== 'string') return '—';
  const parts = month.split('-');
  if (parts.length !== 2) return month;
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) return month;
  return `${monthNames[monthNum - 1]} ${year}`;
}

/**
 * Monthly summary table component for the Reports screen.
 * Renders a table with columns: Month, Refund Amount, Recoupment Amount,
 * Request Count. Accepts monthlySummary array as prop.
 *
 * @param {Object} props
 * @param {Array<Object>} props.monthlySummary - Array of monthly summary objects
 * @param {string} props.monthlySummary[].month - The month in YYYY-MM format
 * @param {number} props.monthlySummary[].refundAmount - Total refund amount for the month
 * @param {number} props.monthlySummary[].recoupmentAmount - Total recoupment amount for the month
 * @param {number} props.monthlySummary[].requestCount - Total request count for the month
 * @returns {JSX.Element} The rendered MonthlySummaryTable component
 */
export function MonthlySummaryTable({ monthlySummary }) {
  const thClasses =
    'px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider';
  const tdClasses = 'px-4 py-3 text-sm text-neutral-700 whitespace-nowrap';

  if (!Array.isArray(monthlySummary) || monthlySummary.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-sm text-neutral-500 text-center">
          No monthly summary data available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className={thClasses}>Month</th>
              <th className={thClasses}>Refund Amount</th>
              <th className={thClasses}>Recoupment Amount</th>
              <th className={thClasses}>Request Count</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {monthlySummary.map((entry) => (
              <tr
                key={entry.month}
                className="hover:bg-neutral-50 transition-colors"
              >
                <td className={tdClasses}>
                  <span className="font-medium text-neutral-900">
                    {formatMonth(entry.month)}
                  </span>
                </td>
                <td className={tdClasses}>
                  {formatCurrency(entry.refundAmount)}
                </td>
                <td className={tdClasses}>
                  {formatCurrency(entry.recoupmentAmount)}
                </td>
                <td className={tdClasses}>
                  {entry.requestCount != null ? String(entry.requestCount) : '0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

MonthlySummaryTable.propTypes = {
  /** Array of monthly summary objects containing aggregated metrics per month */
  monthlySummary: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      refundAmount: PropTypes.number,
      recoupmentAmount: PropTypes.number,
      requestCount: PropTypes.number,
    })
  ).isRequired,
};

export default MonthlySummaryTable;