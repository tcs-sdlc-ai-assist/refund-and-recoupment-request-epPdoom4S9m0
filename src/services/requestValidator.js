import { REQUEST_TYPE_OPTIONS } from '../constants';

/**
 * Validates a request data object and returns field-level error messages.
 * @param {Object} requestData - The request data to validate
 * @param {string} [requestData.requestType] - The type of request (REFUND or RECOUPMENT)
 * @param {string} [requestData.memberId] - The member ID
 * @param {string} [requestData.providerId] - The provider ID
 * @param {string} [requestData.paymentId] - The payment/claim ID
 * @param {number} [requestData.amount] - The request amount
 * @param {string} [requestData.reason] - The reason for the request
 * @returns {{ isValid: boolean, errors: Object.<string, string> }} Validation result with field-level errors
 */
export function validate(requestData) {
  const errors = {};

  // Request type is required and must be a valid option
  if (!requestData.requestType) {
    errors.requestType = 'Request type is required';
  } else if (!REQUEST_TYPE_OPTIONS.includes(requestData.requestType)) {
    errors.requestType = 'Request type must be Refund or Recoupment';
  }

  // Member ID is required
  if (!requestData.memberId || String(requestData.memberId).trim() === '') {
    errors.memberId = 'Member is required';
  }

  // Provider ID is required
  if (!requestData.providerId || String(requestData.providerId).trim() === '') {
    errors.providerId = 'Provider is required';
  }

  // Amount is required and must be greater than 0
  if (requestData.amount === undefined || requestData.amount === null || requestData.amount === '') {
    errors.amount = 'Amount is required';
  } else {
    const numericAmount = Number(requestData.amount);
    if (isNaN(numericAmount)) {
      errors.amount = 'Amount must be a valid number';
    } else if (numericAmount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
  }

  // Claim ID format validation (optional field, but if provided must match pattern)
  if (requestData.paymentId && String(requestData.paymentId).trim() !== '') {
    const trimmed = String(requestData.paymentId).trim();
    // Allow alphanumeric characters, hyphens, and underscores
    const claimIdPattern = /^[A-Za-z0-9\-_]+$/;
    if (!claimIdPattern.test(trimmed)) {
      errors.paymentId = 'Claim/Payment ID must contain only letters, numbers, hyphens, or underscores';
    }
  }

  // Reason validation (optional but if provided should not be excessively long)
  if (requestData.reason && String(requestData.reason).length > 500) {
    errors.reason = 'Reason must not exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}