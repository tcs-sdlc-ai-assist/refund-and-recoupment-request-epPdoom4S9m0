import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { REQUEST_TYPE_LABELS } from '../constants';
import { StatusBadge } from './StatusBadge';
import { getMemberById } from '../services/memberRepository';
import { getProviderById } from '../services/providerRepository';

/**
 * Formats a currency amount for display.
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
function formatAmount(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '$0.00';
  }
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Resolves a member ID to a display name.
 * @param {string} memberId - The member ID to resolve
 * @returns {string} The member display name or the raw ID
 */
function getMemberDisplay(memberId) {
  if (!memberId) return '—';
  const member = getMemberById(memberId);
  if (member) {
    return `${member.firstName} ${member.lastName}`;
  }
  return memberId;
}

/**
 * Resolves a provider ID to a display name.
 * @param {string} providerId - The provider ID to resolve
 * @returns {string} The provider display name or the raw ID
 */
function getProviderDisplay(providerId) {
  if (!providerId) return '—';
  const provider = getProviderById(providerId);
  if (provider) {
    return provider.name;
  }
  return providerId;
}

/**
 * Request results table component matching PRD wireframe.
 * Displays columns: ID, Type, Member, Provider, Amount, Status (with StatusBadge).
 * Each row has a View/Edit action button that navigates to the edit form.
 * Shows an empty state message when no results are available.
 *
 * @param {Object} props
 * @param {Array<Object>|null} props.requests - Array of request objects to display, or null if no search performed
 * @returns {JSX.Element} The rendered RequestList component
 */
export function RequestList({ requests }) {
  const navigate = useNavigate();

  if (requests === null || requests === undefined) {
    return null;
  }

  if (Array.isArray(requests) && requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <p className="text-sm text-neutral-500 text-center">
          No requests found matching your search criteria.
        </p>
      </div>
    );
  }

  const thClasses =
    'px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider';
  const tdClasses = 'px-4 py-3 text-sm text-neutral-700 whitespace-nowrap';

  return (
    <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className={thClasses}>ID</th>
              <th className={thClasses}>Type</th>
              <th className={thClasses}>Member</th>
              <th className={thClasses}>Provider</th>
              <th className={thClasses}>Amount</th>
              <th className={thClasses}>Status</th>
              <th className={thClasses}>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {requests.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-neutral-50 transition-colors"
              >
                <td className={tdClasses}>
                  <span className="font-medium text-neutral-900">
                    {request.id}
                  </span>
                </td>
                <td className={tdClasses}>
                  {REQUEST_TYPE_LABELS[request.requestType] || request.requestType || '—'}
                </td>
                <td className={tdClasses}>
                  {getMemberDisplay(request.memberId)}
                </td>
                <td className={tdClasses}>
                  {getProviderDisplay(request.providerId)}
                </td>
                <td className={tdClasses}>
                  {formatAmount(request.amount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {request.status ? (
                    <StatusBadge status={request.status} />
                  ) : (
                    <span className="text-sm text-neutral-500">—</span>
                  )}
                </td>
                <td className={tdClasses}>
                  <button
                    type="button"
                    onClick={() => navigate(`/edit/${request.id}`)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
                  >
                    View / Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

RequestList.propTypes = {
  /** Array of request objects to display, or null if no search has been performed */
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      requestType: PropTypes.string,
      memberId: PropTypes.string,
      providerId: PropTypes.string,
      amount: PropTypes.number,
      status: PropTypes.string,
    })
  ),
};

RequestList.defaultProps = {
  requests: null,
};

export default RequestList;