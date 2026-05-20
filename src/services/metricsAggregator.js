import { REQUEST_TYPE } from '../constants';

/**
 * Aggregates metrics from an array of request objects.
 *
 * @param {Array<Object>} requests - Array of request objects from localStorage
 * @param {string} requests[].requestType - The type of request (REFUND or RECOUPMENT)
 * @param {number} requests[].amount - The request amount
 * @param {string} requests[].createdDate - The created date (ISO or YYYY-MM-DD string)
 * @returns {{
 *   totalRefundAmount: number,
 *   totalRecoupmentAmount: number,
 *   totalRequests: number,
 *   monthlySummary: Array<{month: string, refundAmount: number, recoupmentAmount: number, requestCount: number}>
 * }} Aggregated metrics object
 */
export function getAggregatedMetrics(requests) {
  if (!Array.isArray(requests)) {
    return {
      totalRefundAmount: 0,
      totalRecoupmentAmount: 0,
      totalRequests: 0,
      monthlySummary: [],
    };
  }

  let totalRefundAmount = 0;
  let totalRecoupmentAmount = 0;
  let totalRequests = 0;
  const monthlyMap = {};

  for (const req of requests) {
    if (!req || typeof req !== 'object') {
      continue;
    }

    const amount = Number(req.amount) || 0;
    totalRequests++;

    if (req.requestType === REQUEST_TYPE.REFUND) {
      totalRefundAmount += amount;
    } else if (req.requestType === REQUEST_TYPE.RECOUPMENT) {
      totalRecoupmentAmount += amount;
    }

    const month = extractMonth(req.createdDate);
    if (month) {
      if (!monthlyMap[month]) {
        monthlyMap[month] = {
          refundAmount: 0,
          recoupmentAmount: 0,
          requestCount: 0,
        };
      }

      if (req.requestType === REQUEST_TYPE.REFUND) {
        monthlyMap[month].refundAmount += amount;
      } else if (req.requestType === REQUEST_TYPE.RECOUPMENT) {
        monthlyMap[month].recoupmentAmount += amount;
      }
      monthlyMap[month].requestCount++;
    }
  }

  const monthlySummary = Object.entries(monthlyMap)
    .map(([month, vals]) => ({
      month,
      refundAmount: roundToTwo(vals.refundAmount),
      recoupmentAmount: roundToTwo(vals.recoupmentAmount),
      requestCount: vals.requestCount,
    }))
    .sort((a, b) => (a.month > b.month ? -1 : a.month < b.month ? 1 : 0));

  return {
    totalRefundAmount: roundToTwo(totalRefundAmount),
    totalRecoupmentAmount: roundToTwo(totalRecoupmentAmount),
    totalRequests,
    monthlySummary,
  };
}

/**
 * Extracts the YYYY-MM portion from a date string.
 * @param {string} dateStr - A date string in ISO or YYYY-MM-DD format
 * @returns {string|null} The YYYY-MM month string, or null if invalid
 */
function extractMonth(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }
  const trimmed = dateStr.trim();
  if (trimmed.length < 7) {
    return null;
  }
  const month = trimmed.slice(0, 7);
  // Validate YYYY-MM format
  const monthPattern = /^\d{4}-\d{2}$/;
  if (!monthPattern.test(month)) {
    return null;
  }
  return month;
}

/**
 * Rounds a number to two decimal places.
 * @param {number} value - The number to round
 * @returns {number} The rounded number
 */
function roundToTwo(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}