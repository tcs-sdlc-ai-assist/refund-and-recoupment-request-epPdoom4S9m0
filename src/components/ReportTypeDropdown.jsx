import PropTypes from 'prop-types';

/**
 * Report type options for the dropdown.
 * @type {Array<{value: string, label: string}>}
 */
const REPORT_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Requests' },
  { value: 'TOTAL_REFUNDS', label: 'Total Refunds' },
  { value: 'TOTAL_RECOUPMENTS', label: 'Total Recoupments' },
  { value: 'MONTHLY_SUMMARY', label: 'Monthly Summary' },
];

/**
 * Report type selection dropdown component.
 * Options include: All Requests, Total Refunds, Total Recoupments, Monthly Summary.
 * Used on the Reports screen to filter which metrics are displayed.
 *
 * @param {Object} props
 * @param {string} props.selectedType - The currently selected report type value
 * @param {function} props.onChange - Callback invoked with the new report type value when selection changes
 * @returns {JSX.Element} The rendered ReportTypeDropdown component
 */
export function ReportTypeDropdown({ selectedType, onChange }) {
  /**
   * Handles the select element change event.
   * @param {React.ChangeEvent<HTMLSelectElement>} e
   */
  function handleChange(e) {
    onChange(e.target.value);
  }

  const inputBaseClasses =
    'block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors';
  const labelClasses = 'block text-sm font-medium text-neutral-700 mb-1';

  return (
    <div>
      <label htmlFor="reportType" className={labelClasses}>
        Report Type
      </label>
      <select
        id="reportType"
        name="reportType"
        value={selectedType}
        onChange={handleChange}
        className={inputBaseClasses}
      >
        {REPORT_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

ReportTypeDropdown.propTypes = {
  /** The currently selected report type value */
  selectedType: PropTypes.string.isRequired,
  /** Callback invoked with the new report type value when selection changes */
  onChange: PropTypes.func.isRequired,
};

export default ReportTypeDropdown;