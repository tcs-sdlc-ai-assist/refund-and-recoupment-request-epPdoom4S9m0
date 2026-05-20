import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { STATUS, STATUS_OPTIONS, STATUS_LABELS, REQUEST_TYPE, REQUEST_TYPE_OPTIONS, REQUEST_TYPE_LABELS } from '../constants';
import { getAllMembers } from '../services/memberRepository';
import { getAllProviders } from '../services/providerRepository';
import { searchRequests } from '../services/searchService';

/**
 * Returns the initial empty filter state.
 * @returns {Object} The default filter data
 */
function getEmptyFilters() {
  return {
    requestId: '',
    memberId: '',
    providerId: '',
    status: '',
    requestType: '',
    dateFrom: '',
    dateTo: '',
  };
}

/**
 * Search filter panel component matching PRD wireframe.
 * Provides filter inputs for Request ID, Member, Provider, Status, Request Type,
 * Date From, and Date To. Calls searchService with filter criteria and passes
 * results to parent via onResults callback prop.
 *
 * @param {Object} props
 * @param {function} props.onResults - Callback invoked with the array of matching request objects
 * @returns {JSX.Element} The rendered SearchPanel component
 */
export function SearchPanel({ onResults }) {
  const [filters, setFilters] = useState(getEmptyFilters());
  const [members] = useState(() => getAllMembers());
  const [providers] = useState(() => getAllProviders());

  /**
   * Handles input field changes.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Executes the search with current filter values and passes results to parent.
   */
  const handleSearch = useCallback(() => {
    const results = searchRequests({
      requestId: filters.requestId.trim() || undefined,
      memberId: filters.memberId || undefined,
      providerId: filters.providerId || undefined,
      status: filters.status || undefined,
      requestType: filters.requestType || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    });
    onResults(results);
  }, [filters, onResults]);

  /**
   * Resets all filters to their default empty state and clears results.
   */
  const handleReset = useCallback(() => {
    setFilters(getEmptyFilters());
    onResults(null);
  }, [onResults]);

  /**
   * Handles form submission via Enter key.
   * @param {React.FormEvent} e
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    handleSearch();
  }, [handleSearch]);

  const inputBaseClasses =
    'block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors';
  const labelClasses = 'block text-sm font-medium text-neutral-700 mb-1';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Search Requests</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Request ID */}
          <div>
            <label htmlFor="searchRequestId" className={labelClasses}>
              Request ID
            </label>
            <input
              type="text"
              id="searchRequestId"
              name="requestId"
              value={filters.requestId}
              onChange={handleChange}
              placeholder="e.g. REQ001"
              className={inputBaseClasses}
            />
          </div>

          {/* Member */}
          <div>
            <label htmlFor="searchMemberId" className={labelClasses}>
              Member
            </label>
            <select
              id="searchMemberId"
              name="memberId"
              value={filters.memberId}
              onChange={handleChange}
              className={inputBaseClasses}
            >
              <option value="">All Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Provider */}
          <div>
            <label htmlFor="searchProviderId" className={labelClasses}>
              Provider
            </label>
            <select
              id="searchProviderId"
              name="providerId"
              value={filters.providerId}
              onChange={handleChange}
              className={inputBaseClasses}
            >
              <option value="">All Providers</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="searchStatus" className={labelClasses}>
              Status
            </label>
            <select
              id="searchStatus"
              name="status"
              value={filters.status}
              onChange={handleChange}
              className={inputBaseClasses}
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Request Type */}
          <div>
            <label htmlFor="searchRequestType" className={labelClasses}>
              Request Type
            </label>
            <select
              id="searchRequestType"
              name="requestType"
              value={filters.requestType}
              onChange={handleChange}
              className={inputBaseClasses}
            >
              <option value="">All Types</option>
              {REQUEST_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {REQUEST_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label htmlFor="searchDateFrom" className={labelClasses}>
              Date From
            </label>
            <input
              type="date"
              id="searchDateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleChange}
              className={inputBaseClasses}
            />
          </div>

          {/* Date To */}
          <div>
            <label htmlFor="searchDateTo" className={labelClasses}>
              Date To
            </label>
            <input
              type="date"
              id="searchDateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleChange}
              className={inputBaseClasses}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

SearchPanel.propTypes = {
  /** Callback invoked with the array of matching request objects, or null on reset */
  onResults: PropTypes.func.isRequired,
};

export default SearchPanel;