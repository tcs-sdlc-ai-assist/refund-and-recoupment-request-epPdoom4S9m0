import { useState, useCallback } from 'react';
import { SearchPanel } from '../components/SearchPanel';
import { RequestList } from '../components/RequestList';
import { getAllRequests } from '../services/requestRepository';

/**
 * Search/View Requests page component matching PRD wireframe.
 * Composes SearchPanel and RequestList components.
 * Manages search results state. Includes Refresh button to reload all requests.
 * Handles navigation to edit form when a request is selected (via RequestList).
 *
 * @returns {JSX.Element} The rendered SearchRequests page
 */
export function SearchRequests() {
  const [results, setResults] = useState(null);

  /**
   * Callback invoked by SearchPanel with search results or null on reset.
   * @param {Array<Object>|null} searchResults - The matching request objects, or null
   */
  const handleResults = useCallback((searchResults) => {
    setResults(searchResults);
  }, []);

  /**
   * Refreshes the results list by loading all requests from the repository.
   */
  const handleRefresh = useCallback(() => {
    const allRequests = getAllRequests();
    setResults(allRequests);
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Search Requests</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Search and filter refund and recoupment requests.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
        >
          Refresh
        </button>
      </div>

      <SearchPanel onResults={handleResults} />

      <RequestList requests={results} />
    </div>
  );
}

export default SearchRequests;