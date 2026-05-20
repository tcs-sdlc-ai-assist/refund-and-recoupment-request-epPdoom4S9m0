import PropTypes from 'prop-types';

/**
 * Reusable summary card component displaying a metric label and value.
 * Used on Dashboard and Reports screens to show key metrics.
 * @param {Object} props
 * @param {string} props.title - The metric label to display
 * @param {string|number} props.value - The metric value to display
 * @returns {JSX.Element} The rendered SummaryCard component
 */
export function SummaryCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start transition-shadow hover:shadow-lg">
      <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
        {title}
      </span>
      <span className="mt-2 text-3xl font-bold text-neutral-900">
        {value}
      </span>
    </div>
  );
}

SummaryCard.propTypes = {
  /** The metric label to display */
  title: PropTypes.string.isRequired,
  /** The metric value to display */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default SummaryCard;