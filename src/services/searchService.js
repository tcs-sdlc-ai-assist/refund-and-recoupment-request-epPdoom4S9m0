import { getAllRequests } from './requestRepository';

/**
 * Searches and filters requests based on the provided filter criteria.
 * Performs in-memory filtering on all requests from localStorage.
 *
 * @param {Object} [filters={}] - The filter criteria to apply
 * @param {string} [filters.requestId] - Filter by request ID (exact match)
 * @param {string} [filters.memberId] - Filter by member ID (exact match)
 * @param {string} [filters.providerId] - Filter by provider ID (exact match)
 * @param {string} [filters.status] - Filter by status (exact match, e.g. 'NEW', 'IN_PROGRESS', 'PROCESSED', 'CLOSED')
 * @param {string} [filters.requestType] - Filter by request type (exact match, e.g. 'REFUND', 'RECOUPMENT')
 * @param {string} [filters.dateFrom] - Filter by created date >= dateFrom (ISO or YYYY-MM-DD string)
 * @param {string} [filters.dateTo] - Filter by created date <= dateTo (ISO or YYYY-MM-DD string)
 * @returns {Array<Object>} Array of request objects matching all provided filters
 */
export function searchRequests(filters = {}) {
  let requests = getAllRequests();

  if (filters.requestId && String(filters.requestId).trim() !== '') {
    const trimmedId = String(filters.requestId).trim();
    requests = requests.filter((r) => r.id === trimmedId);
  }

  if (filters.memberId && String(filters.memberId).trim() !== '') {
    const trimmedMemberId = String(filters.memberId).trim();
    requests = requests.filter((r) => r.memberId === trimmedMemberId);
  }

  if (filters.providerId && String(filters.providerId).trim() !== '') {
    const trimmedProviderId = String(filters.providerId).trim();
    requests = requests.filter((r) => r.providerId === trimmedProviderId);
  }

  if (filters.status && String(filters.status).trim() !== '') {
    const trimmedStatus = String(filters.status).trim();
    requests = requests.filter((r) => r.status === trimmedStatus);
  }

  if (filters.requestType && String(filters.requestType).trim() !== '') {
    const trimmedType = String(filters.requestType).trim();
    requests = requests.filter((r) => r.requestType === trimmedType);
  }

  if (filters.dateFrom && String(filters.dateFrom).trim() !== '') {
    const fromDate = String(filters.dateFrom).trim();
    requests = requests.filter((r) => {
      if (!r.createdDate) return false;
      return r.createdDate >= fromDate;
    });
  }

  if (filters.dateTo && String(filters.dateTo).trim() !== '') {
    const toDate = String(filters.dateTo).trim();
    // If dateTo is a date-only string (YYYY-MM-DD), include the entire day
    const effectiveTo = toDate.length === 10 ? toDate + 'T23:59:59.999Z' : toDate;
    requests = requests.filter((r) => {
      if (!r.createdDate) return false;
      return r.createdDate <= effectiveTo;
    });
  }

  return requests;
}