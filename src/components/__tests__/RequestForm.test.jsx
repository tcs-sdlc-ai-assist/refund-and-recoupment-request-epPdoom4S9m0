import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequestForm } from '../RequestForm';
import { STORAGE_KEYS, STATUS, REQUEST_TYPE } from '../../constants';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RequestForm', () => {
  let store;

  const SEED_MEMBERS = [
    { id: 'MEM001', firstName: 'John', lastName: 'Smith' },
    { id: 'MEM002', firstName: 'Jane', lastName: 'Doe' },
  ];

  const SEED_PROVIDERS = [
    { id: 'PRV001', name: 'City General Hospital' },
    { id: 'PRV002', name: 'Lakeside Medical Center' },
  ];

  beforeEach(() => {
    store = {};
    mockNavigate.mockClear();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => {
        return key in store ? store[key] : null;
      }),
      setItem: vi.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    });

    store[STORAGE_KEYS.MEMBER] = JSON.stringify(SEED_MEMBERS);
    store[STORAGE_KEYS.PROVIDER] = JSON.stringify(SEED_PROVIDERS);
    store[STORAGE_KEYS.PAYMENT] = JSON.stringify([]);
    store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderCreateForm() {
    return render(
      <MemoryRouter initialEntries={['/create']}>
        <Routes>
          <Route path="/create" element={<RequestForm />} />
          <Route path="/edit/:id" element={<RequestForm />} />
        </Routes>
      </MemoryRouter>
    );
  }

  function renderEditForm(id) {
    return render(
      <MemoryRouter initialEntries={[`/edit/${id}`]}>
        <Routes>
          <Route path="/create" element={<RequestForm />} />
          <Route path="/edit/:id" element={<RequestForm />} />
        </Routes>
      </MemoryRouter>
    );
  }

  describe('form rendering', () => {
    it('renders the Create Request heading in create mode', () => {
      renderCreateForm();
      expect(screen.getByText('Create Request')).toBeInTheDocument();
    });

    it('renders the Request Type select field', () => {
      renderCreateForm();
      expect(screen.getByLabelText(/Request Type/)).toBeInTheDocument();
    });

    it('renders the Member select field', () => {
      renderCreateForm();
      expect(screen.getByLabelText(/Member/)).toBeInTheDocument();
    });

    it('renders the Provider select field', () => {
      renderCreateForm();
      expect(screen.getByLabelText(/Provider/)).toBeInTheDocument();
    });

    it('renders the Amount input field', () => {
      renderCreateForm();
      expect(screen.getByLabelText(/Amount/)).toBeInTheDocument();
    });

    it('renders the Claim / Payment ID input field', () => {
      renderCreateForm();
      expect(screen.getByLabelText(/Claim \/ Payment ID/)).toBeInTheDocument();
    });

    it('renders the Reason textarea', () => {
      renderCreateForm();
      expect(screen.getByLabelText(/Reason/)).toBeInTheDocument();
    });

    it('renders the Notes textarea', () => {
      renderCreateForm();
      expect(screen.getByLabelText(/Notes/)).toBeInTheDocument();
    });

    it('renders the Status field as read-only in create mode showing New', () => {
      renderCreateForm();
      expect(screen.getByLabelText(/Status/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('New')).toBeInTheDocument();
    });

    it('renders the Save button in create mode', () => {
      renderCreateForm();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('renders the Clear button', () => {
      renderCreateForm();
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });

    it('renders the Cancel button', () => {
      renderCreateForm();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders member options from repository', () => {
      renderCreateForm();
      const memberSelect = screen.getByLabelText(/Member/);
      expect(memberSelect).toBeInTheDocument();
      expect(screen.getByText('MEM001 — John Smith')).toBeInTheDocument();
      expect(screen.getByText('MEM002 — Jane Doe')).toBeInTheDocument();
    });

    it('renders provider options from repository', () => {
      renderCreateForm();
      expect(screen.getByText('PRV001 — City General Hospital')).toBeInTheDocument();
      expect(screen.getByText('PRV002 — Lakeside Medical Center')).toBeInTheDocument();
    });
  });

  describe('validation errors on invalid submit', () => {
    it('displays error when request type is not selected', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('Request type is required')).toBeInTheDocument();
    });

    it('displays error when member is not selected', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('Member is required')).toBeInTheDocument();
    });

    it('displays error when provider is not selected', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('Provider is required')).toBeInTheDocument();
    });

    it('displays error when amount is not provided', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('Amount is required')).toBeInTheDocument();
    });

    it('displays all validation errors at once when form is empty', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('Request type is required')).toBeInTheDocument();
      expect(screen.getByText('Member is required')).toBeInTheDocument();
      expect(screen.getByText('Provider is required')).toBeInTheDocument();
      expect(screen.getByText('Amount is required')).toBeInTheDocument();
    });

    it('clears field error when user corrects the field', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.getByText('Request type is required')).toBeInTheDocument();

      await user.selectOptions(screen.getByLabelText(/Request Type/), 'REFUND');
      expect(screen.queryByText('Request type is required')).not.toBeInTheDocument();
    });
  });

  describe('successful save', () => {
    it('saves a new request to localStorage on valid submit', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.selectOptions(screen.getByLabelText(/Request Type/), 'REFUND');
      await user.selectOptions(screen.getByLabelText(/Member/), 'MEM001');
      await user.selectOptions(screen.getByLabelText(/Provider/), 'PRV001');
      await user.clear(screen.getByLabelText(/Amount/));
      await user.type(screen.getByLabelText(/Amount/), '1500.00');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(screen.getByText(/created successfully/)).toBeInTheDocument();
      });

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      expect(stored).toHaveLength(1);
      expect(stored[0].requestType).toBe('REFUND');
      expect(stored[0].memberId).toBe('MEM001');
      expect(stored[0].providerId).toBe('PRV001');
      expect(stored[0].amount).toBe(1500.00);
      expect(stored[0].status).toBe('NEW');
      expect(stored[0].id).toMatch(/^REQ-/);
      expect(stored[0].createdDate).toBeDefined();
      expect(stored[0].updatedDate).toBeDefined();
    });

    it('navigates to edit mode after successful save', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderCreateForm();

      await user.selectOptions(screen.getByLabelText(/Request Type/), 'RECOUPMENT');
      await user.selectOptions(screen.getByLabelText(/Member/), 'MEM002');
      await user.selectOptions(screen.getByLabelText(/Provider/), 'PRV002');
      await user.clear(screen.getByLabelText(/Amount/));
      await user.type(screen.getByLabelText(/Amount/), '500');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(screen.getByText(/created successfully/)).toBeInTheDocument();
      });

      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
        const navigateCall = mockNavigate.mock.calls[0][0];
        expect(navigateCall).toMatch(/^\/edit\/REQ-/);
      });

      vi.useRealTimers();
    });

    it('saves request with optional fields', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.selectOptions(screen.getByLabelText(/Request Type/), 'REFUND');
      await user.selectOptions(screen.getByLabelText(/Member/), 'MEM001');
      await user.selectOptions(screen.getByLabelText(/Provider/), 'PRV001');
      await user.clear(screen.getByLabelText(/Amount/));
      await user.type(screen.getByLabelText(/Amount/), '250');
      await user.type(screen.getByLabelText(/Claim \/ Payment ID/), 'PAY001');
      await user.type(screen.getByLabelText(/Reason/), 'Duplicate payment');
      await user.type(screen.getByLabelText(/Notes/), 'Some notes');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(screen.getByText(/created successfully/)).toBeInTheDocument();
      });

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      expect(stored).toHaveLength(1);
      expect(stored[0].paymentId).toBe('PAY001');
      expect(stored[0].reason).toBe('Duplicate payment');
      expect(stored[0].notes).toBe('Some notes');
    });
  });

  describe('edit mode', () => {
    const existingRequest = {
      id: 'REQ-EDIT-001',
      requestType: 'REFUND',
      status: 'NEW',
      memberId: 'MEM001',
      providerId: 'PRV001',
      paymentId: 'PAY001',
      amount: 1500.00,
      reason: 'Duplicate payment',
      notes: 'Review pending',
      createdDate: '2024-06-01T10:00:00.000Z',
      updatedDate: '2024-06-01T10:00:00.000Z',
    };

    beforeEach(() => {
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify([existingRequest]);
    });

    it('renders the Edit Request heading in edit mode', () => {
      renderEditForm('REQ-EDIT-001');
      expect(screen.getByText('Edit Request')).toBeInTheDocument();
    });

    it('populates form fields with existing request data', () => {
      renderEditForm('REQ-EDIT-001');

      expect(screen.getByDisplayValue('REQ-EDIT-001')).toBeInTheDocument();
      expect(screen.getByLabelText(/Request Type/)).toHaveValue('REFUND');
      expect(screen.getByLabelText(/Member/)).toHaveValue('MEM001');
      expect(screen.getByLabelText(/Provider/)).toHaveValue('PRV001');
      expect(screen.getByLabelText(/Amount/)).toHaveValue(1500);
      expect(screen.getByLabelText(/Claim \/ Payment ID/)).toHaveValue('PAY001');
      expect(screen.getByLabelText(/Reason/)).toHaveValue('Duplicate payment');
      expect(screen.getByLabelText(/Notes/)).toHaveValue('Review pending');
    });

    it('renders the Update button in edit mode', () => {
      renderEditForm('REQ-EDIT-001');
      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('renders the Process button in edit mode', () => {
      renderEditForm('REQ-EDIT-001');
      expect(screen.getByRole('button', { name: 'Process' })).toBeInTheDocument();
    });

    it('does not render the Save button in edit mode', () => {
      renderEditForm('REQ-EDIT-001');
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('updates the request on valid Update click', async () => {
      const user = userEvent.setup();
      renderEditForm('REQ-EDIT-001');

      await user.clear(screen.getByLabelText(/Amount/));
      await user.type(screen.getByLabelText(/Amount/), '2000');

      await user.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => {
        expect(screen.getByText(/updated successfully/)).toBeInTheDocument();
      });

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      const updated = stored.find((r) => r.id === 'REQ-EDIT-001');
      expect(updated.amount).toBe(2000);
      expect(updated.updatedDate).not.toBe('2024-06-01T10:00:00.000Z');
    });

    it('shows error when editing a non-existent request', () => {
      renderEditForm('REQ-NONEXISTENT');
      expect(screen.getByText(/not found/)).toBeInTheDocument();
    });

    it('displays status badge in edit mode', () => {
      renderEditForm('REQ-EDIT-001');
      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  describe('Process button changes status', () => {
    const newRequest = {
      id: 'REQ-PROC-001',
      requestType: 'REFUND',
      status: 'NEW',
      memberId: 'MEM001',
      providerId: 'PRV001',
      paymentId: 'PAY001',
      amount: 1000.00,
      reason: 'Test reason',
      notes: '',
      createdDate: '2024-06-01T10:00:00.000Z',
      updatedDate: '2024-06-01T10:00:00.000Z',
    };

    beforeEach(() => {
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify([newRequest]);
    });

    it('marks request as Processed when Process button is clicked', async () => {
      const user = userEvent.setup();
      renderEditForm('REQ-PROC-001');

      await user.click(screen.getByRole('button', { name: 'Process' }));

      await waitFor(() => {
        expect(screen.getByText(/marked as Processed/)).toBeInTheDocument();
      });

      const stored = JSON.parse(store[STORAGE_KEYS.REQUEST_MASTER]);
      const processed = stored.find((r) => r.id === 'REQ-PROC-001');
      expect(processed.status).toBe('PROCESSED');
    });

    it('shows Processed status badge after processing', async () => {
      const user = userEvent.setup();
      renderEditForm('REQ-PROC-001');

      await user.click(screen.getByRole('button', { name: 'Process' }));

      await waitFor(() => {
        expect(screen.getByText('Processed')).toBeInTheDocument();
      });
    });
  });

  describe('Processed requests are read-only', () => {
    const processedRequest = {
      id: 'REQ-RO-001',
      requestType: 'REFUND',
      status: 'PROCESSED',
      memberId: 'MEM001',
      providerId: 'PRV001',
      paymentId: 'PAY001',
      amount: 1500.00,
      reason: 'Completed request',
      notes: 'Done',
      createdDate: '2024-06-01T10:00:00.000Z',
      updatedDate: '2024-06-05T09:00:00.000Z',
    };

    beforeEach(() => {
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify([processedRequest]);
    });

    it('disables the Request Type field for processed requests', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.getByLabelText(/Request Type/)).toBeDisabled();
    });

    it('disables the Member field for processed requests', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.getByLabelText(/Member/)).toBeDisabled();
    });

    it('disables the Provider field for processed requests', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.getByLabelText(/Provider/)).toBeDisabled();
    });

    it('disables the Amount field for processed requests', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.getByLabelText(/Amount/)).toBeDisabled();
    });

    it('disables the Claim / Payment ID field for processed requests', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.getByLabelText(/Claim \/ Payment ID/)).toBeDisabled();
    });

    it('disables the Reason field for processed requests', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.getByLabelText(/Reason/)).toBeDisabled();
    });

    it('disables the Notes field for processed requests', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.getByLabelText(/Notes/)).toBeDisabled();
    });

    it('disables the Status field for processed requests', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.getByLabelText(/Status/)).toBeDisabled();
    });

    it('does not render the Update button for processed requests', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();
    });

    it('does not render the Process button for processed requests', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.queryByRole('button', { name: 'Process' })).not.toBeInTheDocument();
    });

    it('shows a warning message that the request cannot be edited', () => {
      renderEditForm('REQ-RO-001');
      expect(screen.getByText(/has been Processed and cannot be edited/)).toBeInTheDocument();
    });
  });

  describe('Closed requests are read-only', () => {
    const closedRequest = {
      id: 'REQ-CL-001',
      requestType: 'RECOUPMENT',
      status: 'CLOSED',
      memberId: 'MEM002',
      providerId: 'PRV002',
      paymentId: 'PAY002',
      amount: 2000.00,
      reason: 'Closed request',
      notes: 'Completed',
      createdDate: '2024-03-01T07:00:00.000Z',
      updatedDate: '2024-05-28T16:00:00.000Z',
    };

    beforeEach(() => {
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify([closedRequest]);
    });

    it('disables all form fields for closed requests', () => {
      renderEditForm('REQ-CL-001');
      expect(screen.getByLabelText(/Request Type/)).toBeDisabled();
      expect(screen.getByLabelText(/Member/)).toBeDisabled();
      expect(screen.getByLabelText(/Provider/)).toBeDisabled();
      expect(screen.getByLabelText(/Amount/)).toBeDisabled();
      expect(screen.getByLabelText(/Claim \/ Payment ID/)).toBeDisabled();
      expect(screen.getByLabelText(/Reason/)).toBeDisabled();
      expect(screen.getByLabelText(/Notes/)).toBeDisabled();
    });

    it('shows a warning message that the request has been Closed', () => {
      renderEditForm('REQ-CL-001');
      expect(screen.getByText(/has been Closed and cannot be edited/)).toBeInTheDocument();
    });
  });

  describe('Clear button behavior', () => {
    it('resets form fields to empty in create mode', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.selectOptions(screen.getByLabelText(/Request Type/), 'REFUND');
      await user.selectOptions(screen.getByLabelText(/Member/), 'MEM001');
      await user.type(screen.getByLabelText(/Amount/), '500');

      await user.click(screen.getByRole('button', { name: 'Clear' }));

      expect(screen.getByLabelText(/Request Type/)).toHaveValue('');
      expect(screen.getByLabelText(/Member/)).toHaveValue('');
      expect(screen.getByLabelText(/Amount/)).toHaveValue(null);
    });

    it('resets form fields to original values in edit mode', async () => {
      const existingRequest = {
        id: 'REQ-CLR-001',
        requestType: 'REFUND',
        status: 'NEW',
        memberId: 'MEM001',
        providerId: 'PRV001',
        paymentId: '',
        amount: 750.00,
        reason: 'Original reason',
        notes: '',
        createdDate: '2024-06-01T10:00:00.000Z',
        updatedDate: '2024-06-01T10:00:00.000Z',
      };
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify([existingRequest]);

      const user = userEvent.setup();
      renderEditForm('REQ-CLR-001');

      await user.clear(screen.getByLabelText(/Amount/));
      await user.type(screen.getByLabelText(/Amount/), '9999');

      await user.click(screen.getByRole('button', { name: 'Clear' }));

      expect(screen.getByLabelText(/Amount/)).toHaveValue(750);
      expect(screen.getByLabelText(/Reason/)).toHaveValue('Original reason');
    });
  });

  describe('Cancel button behavior', () => {
    it('navigates back when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});