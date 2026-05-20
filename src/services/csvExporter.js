/**
 * CSV export utility for the Reporting & Metrics Dashboard.
 * Generates CSV strings from aggregated metrics data and triggers browser downloads.
 */

/**
 * Formats a number for CSV output with two decimal places.
 * @param {number} value - The number to format
 * @returns {string} The formatted number string
 */
function formatNumber(value) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0.00';
  }
  return Number(value).toFixed(2);
}

/**
 * Escapes a CSV field value to handle commas, quotes, and newlines.
 * @param {*} value - The value to escape
 * @returns {string} The escaped CSV field string
 */
function escapeCSVField(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Generates a CSV string from aggregated metrics data.
 * @param {{
 *   totalRefundAmount: number,
 *   totalRecoupmentAmount: number,
 *   totalRequests: number,
 *   monthlySummary: Array<{month: string, refundAmount: number, recoupmentAmount: number, requestCount: number}>
 * }} metrics - The aggregated metrics object
 * @returns {string} The generated CSV string
 */
export function generateCSVString(metrics) {
  if (!metrics || typeof metrics !== 'object') {
    return 'Metric,Value\nTotal Refund Amount,0.00\nTotal Recoupment Amount,0.00\nTotal Requests,0\n';
  }

  const lines = [];

  // Summary section
  lines.push('Metric,Value');
  lines.push(`Total Refund Amount,${formatNumber(metrics.totalRefundAmount)}`);
  lines.push(`Total Recoupment Amount,${formatNumber(metrics.totalRecoupmentAmount)}`);
  lines.push(`Total Requests,${metrics.totalRequests || 0}`);

  // Monthly summary section
  const monthlySummary = Array.isArray(metrics.monthlySummary) ? metrics.monthlySummary : [];

  if (monthlySummary.length > 0) {
    lines.push('');
    lines.push('Month,Refund Amount,Recoupment Amount,Request Count');

    for (const entry of monthlySummary) {
      const month = escapeCSVField(entry.month);
      const refundAmount = formatNumber(entry.refundAmount);
      const recoupmentAmount = formatNumber(entry.recoupmentAmount);
      const requestCount = entry.requestCount || 0;
      lines.push(`${month},${refundAmount},${recoupmentAmount},${requestCount}`);
    }
  }

  return lines.join('\n') + '\n';
}

/**
 * Generates a timestamped filename for the CSV export.
 * @returns {string} The generated filename
 */
function generateFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `refund_recoupment_report_${year}${month}${day}_${hours}${minutes}${seconds}.csv`;
}

/**
 * Exports aggregated metrics as a CSV file and triggers a browser download.
 * Handles formatting of numbers and dates for spreadsheet compatibility.
 *
 * @param {{
 *   totalRefundAmount: number,
 *   totalRecoupmentAmount: number,
 *   totalRequests: number,
 *   monthlySummary: Array<{month: string, refundAmount: number, recoupmentAmount: number, requestCount: number}>
 * }} metrics - The aggregated metrics object from getAggregatedMetrics()
 * @returns {boolean} True if the export was initiated successfully, false otherwise
 */
export function exportReportCSV(metrics) {
  try {
    const csvContent = generateCSVString(metrics);
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = generateFilename();

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the object URL after a short delay to ensure the download starts
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (error) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error('[csvExporter] Error exporting CSV:', error);
    }
    return false;
  }
}