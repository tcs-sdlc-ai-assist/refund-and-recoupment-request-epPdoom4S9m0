import PropTypes from 'prop-types';
import { STATUS, STATUS_LABELS } from '../constants';

/**
 * Color mapping for each request status.
 * @type {Object.<string, string>}
 */
const STATUS_COLORS = {
  [STATUS.NEW]: 'bg-primary-100 text-primary-800',
  [STATUS.IN_PROGRESS]: 'bg-warning-100 text-warning-800',
  [STATUS.PROCESSED]: 'bg-accent-100 text-accent-800',
  [STATUS.CLOSED]: 'bg-neutral-200 text-neutral-700',
};

/**
 * Reusable status badge component that renders a colored pill/badge
 * based on the request status value.
 * @param {Object} props
 * @param {string} props.status - The status value (NEW, IN_PROGRESS, PROCESSED, CLOSED)
 * @returns {JSX.Element} The rendered StatusBadge component
 */
export function StatusBadge({ status }) {
  const colorClasses = STATUS_COLORS[status] || 'bg-neutral-200 text-neutral-700';
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}
    >
      {label}
    </span>
  );
}

StatusBadge.propTypes = {
  /** The status value to display (NEW, IN_PROGRESS, PROCESSED, CLOSED) */
  status: PropTypes.string.isRequired,
};

export default StatusBadge;