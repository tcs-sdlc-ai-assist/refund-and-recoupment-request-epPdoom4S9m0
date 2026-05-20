import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { STATUS, STATUS_OPTIONS, STATUS_LABELS, REQUEST_TYPE, REQUEST_TYPE_OPTIONS, REQUEST_TYPE_LABELS } from '../constants';
import { getAllMembers } from '../services/memberRepository';
import { getAllProviders } from '../services/providerRepository';
import { getRequestById, saveRequest, updateRequest } from '../services/requestRepository';
import { validate } from '../services/requestValidator';
import { StatusBadge } from './StatusBadge';

/**
 * Initial empty form state for creating a new request.
 * @returns {Object} The default form data
 */
function getEmptyFormData() {
  return {
    requestType: '',
    memberId: '',
    providerId: '',
    paymentId: '',
    amount: '',
    status: STATUS.NEW,
    reason: '',
    notes: '',
  };
}

/**
 * Request create/edit form component.
 * Handles both create and edit modes based on route params.
 * Integrates requestValidator for real-time and submit validation.
 * Disables editing when status is Processed.
 *
 * @returns {JSX.Element} The rendered RequestForm component
 */
export function RequestForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(getEmptyFormData());
  const [requestId, setRequestId] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [updatedDate, setUpdatedDate] = useState('');
  const [errors, setErrors] = useState({});
  const [members, setMembers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    setMembers(getAllMembers());
    setProviders(getAllProviders());
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      const existing = getRequestById(id);
      if (existing) {
        setRequestId(existing.id);
        setCreatedDate(existing.createdDate || '');
        setUpdatedDate(existing.updatedDate || '');
        setIsProcessed(existing.status === STATUS.PROCESSED || existing.status === STATUS.CLOSED);
        setFormData({
          requestType: existing.requestType || '',
          memberId: existing.memberId || '',
          providerId: existing.providerId || '',
          paymentId: existing.paymentId || '',
          amount: existing.amount !== undefined && existing.amount !== null ? String(existing.amount) : '',
          status: existing.status || STATUS.NEW,
          reason: existing.reason || '',
          notes: existing.notes || '',
        });
        setErrors({});
        setSubmitMessage('');
        setSubmitError('');
      } else {
        setSubmitError(`Request with ID "${id}" not found.`);
      }
    }
  }, [isEditMode, id]);

  /**
   * Handles input field changes and clears field-level errors.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>} e
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setSubmitMessage('');
    setSubmitError('');
  }, []);

  /**
   * Clears the form to its initial state.
   */
  const handleClear = useCallback(() => {
    if (isEditMode) {
      // In edit mode, reload the original data
      const existing = getRequestById(id);
      if (existing) {
        setFormData({
          requestType: existing.requestType || '',
          memberId: existing.memberId || '',
          providerId: existing.providerId || '',
          paymentId: existing.paymentId || '',
          amount: existing.amount !== undefined && existing.amount !== null ? String(existing.amount) : '',
          status: existing.status || STATUS.NEW,
          reason: existing.reason || '',
          notes: existing.notes || '',
        });
      }
    } else {
      setFormData(getEmptyFormData());
      setRequestId('');
      setCreatedDate('');
      setUpdatedDate('');
      setIsProcessed(false);
    }
    setErrors({});
    setSubmitMessage('');
    setSubmitError('');
  }, [isEditMode, id]);

  /**
   * Validates and saves a new request.
   */
  const handleSave = useCallback(() => {
    setSubmitMessage('');
    setSubmitError('');

    const dataToValidate = {
      ...formData,
      amount: formData.amount !== '' ? Number(formData.amount) : '',
    };

    const result = validate(dataToValidate);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    try {
      const saved = saveRequest({
        requestType: formData.requestType,
        memberId: formData.memberId,
        providerId: formData.providerId,
        paymentId: formData.paymentId.trim() || undefined,
        amount: Number(formData.amount),
        status: STATUS.NEW,
        reason: formData.reason.trim(),
        notes: formData.notes.trim(),
      });

      setRequestId(saved.id);
      setCreatedDate(saved.createdDate);
      setUpdatedDate(saved.updatedDate);
      setSubmitMessage(`Request ${saved.id} created successfully.`);
      setErrors({});

      // Navigate to edit mode for the newly created request
      setTimeout(() => {
        navigate(`/edit/${saved.id}`, { replace: true });
      }, 800);
    } catch (err) {
      setSubmitError('Failed to save request. Please try again.');
    }
  }, [formData, navigate]);

  /**
   * Validates and updates an existing request.
   */
  const handleUpdate = useCallback(() => {
    setSubmitMessage('');
    setSubmitError('');

    if (isProcessed) {
      setSubmitError('Cannot edit a request that has been Processed or Closed.');
      return;
    }

    const dataToValidate = {
      ...formData,
      amount: formData.amount !== '' ? Number(formData.amount) : '',
    };

    const result = validate(dataToValidate);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    try {
      const updated = updateRequest(id, {
        requestType: formData.requestType,
        memberId: formData.memberId,
        providerId: formData.providerId,
        paymentId: formData.paymentId.trim() || undefined,
        amount: Number(formData.amount),
        status: formData.status,
        reason: formData.reason.trim(),
        notes: formData.notes.trim(),
      });

      if (updated) {
        setUpdatedDate(updated.updatedDate);
        setIsProcessed(updated.status === STATUS.PROCESSED || updated.status === STATUS.CLOSED);
        setSubmitMessage(`Request ${updated.id} updated successfully.`);
        setErrors({});
      } else {
        setSubmitError('Request not found. It may have been deleted.');
      }
    } catch (err) {
      setSubmitError('Failed to update request. Please try again.');
    }
  }, [formData, id, isProcessed]);

  /**
   * Marks the request as Processed.
   */
  const handleProcess = useCallback(() => {
    setSubmitMessage('');
    setSubmitError('');

    if (!isEditMode || !id) {
      setSubmitError('Cannot process a request that has not been saved.');
      return;
    }

    try {
      const updated = updateRequest(id, {
        status: STATUS.PROCESSED,
      });

      if (updated) {
        setFormData((prev) => ({ ...prev, status: STATUS.PROCESSED }));
        setUpdatedDate(updated.updatedDate);
        setIsProcessed(true);
        setSubmitMessage(`Request ${updated.id} has been marked as Processed.`);
        setErrors({});
      } else {
        setSubmitError('Request not found. It may have been deleted.');
      }
    } catch (err) {
      setSubmitError('Failed to process request. Please try again.');
    }
  }, [isEditMode, id]);

  /**
   * Formats an ISO date string for display.
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted date string
   */
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  }

  const inputBaseClasses =
    'block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors';
  const inputNormalClasses = 'border-neutral-300 bg-white';
  const inputErrorClasses = 'border-danger-500 bg-danger-50';
  const inputDisabledClasses = 'border-neutral-200 bg-neutral-100 text-neutral-500 cursor-not-allowed';
  const labelClasses = 'block text-sm font-medium text-neutral-700 mb-1';

  /**
   * Returns the appropriate input class string.
   * @param {string} fieldName
   * @returns {string}
   */
  function getInputClasses(fieldName) {
    if (isProcessed) {
      return `${inputBaseClasses} ${inputDisabledClasses}`;
    }
    if (errors[fieldName]) {
      return `${inputBaseClasses} ${inputErrorClasses}`;
    }
    return `${inputBaseClasses} ${inputNormalClasses}`;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">
            {isEditMode ? 'Edit Request' : 'Create Request'}
          </h1>
          {isEditMode && formData.status && (
            <StatusBadge status={formData.status} />
          )}
        </div>

        {submitMessage && (
          <div className="mb-4 rounded-md bg-accent-50 border border-accent-300 p-3">
            <p className="text-sm text-accent-800">{submitMessage}</p>
          </div>
        )}

        {submitError && (
          <div className="mb-4 rounded-md bg-danger-50 border border-danger-300 p-3">
            <p className="text-sm text-danger-800">{submitError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Request ID (read-only) */}
          {isEditMode && requestId && (
            <div className="sm:col-span-2">
              <label className={labelClasses}>Request ID</label>
              <input
                type="text"
                value={requestId}
                readOnly
                disabled
                className={`${inputBaseClasses} ${inputDisabledClasses}`}
              />
            </div>
          )}

          {/* Request Type */}
          <div>
            <label htmlFor="requestType" className={labelClasses}>
              Request Type <span className="text-danger-500">*</span>
            </label>
            <select
              id="requestType"
              name="requestType"
              value={formData.requestType}
              onChange={handleChange}
              disabled={isProcessed}
              className={getInputClasses('requestType')}
            >
              <option value="">Select type...</option>
              {REQUEST_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {REQUEST_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {errors.requestType && (
              <p className="mt-1 text-xs text-danger-600">{errors.requestType}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className={labelClasses}>
              Status
            </label>
            {isEditMode ? (
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isProcessed}
                className={getInputClasses('status')}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={STATUS_LABELS[STATUS.NEW]}
                readOnly
                disabled
                className={`${inputBaseClasses} ${inputDisabledClasses}`}
              />
            )}
          </div>

          {/* Member ID */}
          <div>
            <label htmlFor="memberId" className={labelClasses}>
              Member <span className="text-danger-500">*</span>
            </label>
            <select
              id="memberId"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              disabled={isProcessed}
              className={getInputClasses('memberId')}
            >
              <option value="">Select member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
            {errors.memberId && (
              <p className="mt-1 text-xs text-danger-600">{errors.memberId}</p>
            )}
          </div>

          {/* Provider ID */}
          <div>
            <label htmlFor="providerId" className={labelClasses}>
              Provider <span className="text-danger-500">*</span>
            </label>
            <select
              id="providerId"
              name="providerId"
              value={formData.providerId}
              onChange={handleChange}
              disabled={isProcessed}
              className={getInputClasses('providerId')}
            >
              <option value="">Select provider...</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.name}
                </option>
              ))}
            </select>
            {errors.providerId && (
              <p className="mt-1 text-xs text-danger-600">{errors.providerId}</p>
            )}
          </div>

          {/* Claim / Payment ID */}
          <div>
            <label htmlFor="paymentId" className={labelClasses}>
              Claim / Payment ID
            </label>
            <input
              type="text"
              id="paymentId"
              name="paymentId"
              value={formData.paymentId}
              onChange={handleChange}
              disabled={isProcessed}
              placeholder="e.g. PAY001"
              className={getInputClasses('paymentId')}
            />
            {errors.paymentId && (
              <p className="mt-1 text-xs text-danger-600">{errors.paymentId}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className={labelClasses}>
              Amount <span className="text-danger-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              disabled={isProcessed}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={getInputClasses('amount')}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-danger-600">{errors.amount}</p>
            )}
          </div>

          {/* Reason */}
          <div className="sm:col-span-2">
            <label htmlFor="reason" className={labelClasses}>
              Reason
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              disabled={isProcessed}
              rows={3}
              placeholder="Reason for the request..."
              className={getInputClasses('reason')}
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-danger-600">{errors.reason}</p>
            )}
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label htmlFor="notes" className={labelClasses}>
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isProcessed}
              rows={2}
              placeholder="Additional notes..."
              className={getInputClasses('notes')}
            />
          </div>

          {/* Dates (read-only, shown in edit mode) */}
          {isEditMode && (createdDate || updatedDate) && (
            <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2 border-t border-neutral-200">
              {createdDate && (
                <div>
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    Created
                  </span>
                  <p className="text-sm text-neutral-700">{formatDate(createdDate)}</p>
                </div>
              )}
              {updatedDate && (
                <div>
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    Last Updated
                  </span>
                  <p className="text-sm text-neutral-700">{formatDate(updatedDate)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-neutral-200 pt-4">
          {!isEditMode && (
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Save
            </button>
          )}

          {isEditMode && !isProcessed && (
            <button
              type="button"
              onClick={handleUpdate}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Update
            </button>
          )}

          {isEditMode && !isProcessed && (
            <button
              type="button"
              onClick={handleProcess}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Process
            </button>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-neutral-500 hover:text-neutral-700 focus:outline-none transition-colors"
          >
            Cancel
          </button>
        </div>

        {isProcessed && (
          <div className="mt-4 rounded-md bg-warning-50 border border-warning-300 p-3">
            <p className="text-sm text-warning-800">
              This request has been {formData.status === STATUS.CLOSED ? 'Closed' : 'Processed'} and cannot be edited.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestForm;