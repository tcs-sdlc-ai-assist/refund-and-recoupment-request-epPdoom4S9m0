import { describe, it, expect } from 'vitest';
import { validate } from '../requestValidator';

describe('requestValidator', () => {
  describe('validate', () => {
    it('returns isValid true when all required fields are provided with valid data', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 1500.00,
        paymentId: 'PAY001',
        reason: 'Duplicate payment identified',
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('returns isValid true for RECOUPMENT request type', () => {
      const requestData = {
        requestType: 'RECOUPMENT',
        memberId: 'MEM002',
        providerId: 'PRV002',
        amount: 500.00,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('returns isValid true when optional fields are omitted', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 100,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('returns error when memberId is missing', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: '',
        providerId: 'PRV001',
        amount: 1500.00,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.memberId).toBe('Member is required');
    });

    it('returns error when memberId is undefined', () => {
      const requestData = {
        requestType: 'REFUND',
        providerId: 'PRV001',
        amount: 1500.00,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.memberId).toBe('Member is required');
    });

    it('returns error when memberId is only whitespace', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: '   ',
        providerId: 'PRV001',
        amount: 1500.00,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.memberId).toBe('Member is required');
    });

    it('returns error when requestType is missing', () => {
      const requestData = {
        requestType: '',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 1500.00,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.requestType).toBe('Request type is required');
    });

    it('returns error when requestType is undefined', () => {
      const requestData = {
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 1500.00,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.requestType).toBe('Request type is required');
    });

    it('returns error when requestType is an invalid value', () => {
      const requestData = {
        requestType: 'INVALID_TYPE',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 1500.00,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.requestType).toBe('Request type must be Refund or Recoupment');
    });

    it('returns error when amount is 0', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 0,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('Amount must be greater than 0');
    });

    it('returns error when amount is negative', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: -100,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('Amount must be greater than 0');
    });

    it('returns error when amount is missing (undefined)', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('Amount is required');
    });

    it('returns error when amount is null', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: null,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('Amount is required');
    });

    it('returns error when amount is an empty string', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: '',
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('Amount is required');
    });

    it('returns error when amount is a non-numeric string', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 'abc',
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('Amount must be a valid number');
    });

    it('returns errors for all fields when all required fields are missing', () => {
      const requestData = {};

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.requestType).toBe('Request type is required');
      expect(result.errors.memberId).toBe('Member is required');
      expect(result.errors.providerId).toBe('Provider is required');
      expect(result.errors.amount).toBe('Amount is required');
      expect(Object.keys(result.errors)).toHaveLength(4);
    });

    it('returns error when providerId is missing', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: '',
        amount: 1500.00,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.providerId).toBe('Provider is required');
    });

    it('returns error when providerId is only whitespace', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: '   ',
        amount: 1500.00,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.providerId).toBe('Provider is required');
    });

    it('returns error when paymentId contains invalid characters', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 1500.00,
        paymentId: 'PAY 001!',
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.paymentId).toBe('Claim/Payment ID must contain only letters, numbers, hyphens, or underscores');
    });

    it('accepts valid paymentId with hyphens and underscores', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 1500.00,
        paymentId: 'PAY-001_A',
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('does not validate paymentId when it is empty', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 1500.00,
        paymentId: '',
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(true);
      expect(result.errors.paymentId).toBeUndefined();
    });

    it('returns error when reason exceeds 500 characters', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 1500.00,
        reason: 'A'.repeat(501),
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.reason).toBe('Reason must not exceed 500 characters');
    });

    it('accepts reason at exactly 500 characters', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: 1500.00,
        reason: 'A'.repeat(500),
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(true);
      expect(result.errors.reason).toBeUndefined();
    });

    it('returns multiple errors when multiple fields are invalid', () => {
      const requestData = {
        requestType: '',
        memberId: '',
        providerId: 'PRV001',
        amount: -50,
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.requestType).toBe('Request type is required');
      expect(result.errors.memberId).toBe('Member is required');
      expect(result.errors.amount).toBe('Amount must be greater than 0');
      expect(result.errors.providerId).toBeUndefined();
    });

    it('accepts a valid numeric string amount that converts to a positive number', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: '250.50',
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('returns error for a numeric string amount that is zero', () => {
      const requestData = {
        requestType: 'REFUND',
        memberId: 'MEM001',
        providerId: 'PRV001',
        amount: '0',
      };

      const result = validate(requestData);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('Amount must be greater than 0');
    });
  });
});