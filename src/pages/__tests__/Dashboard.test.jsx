import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { STORAGE_KEYS } from '../../constants';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard', () => {
  let store;

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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderDashboard() {
    return render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  }

  describe('page structure', () => {
    it('renders the Dashboard heading', () => {
      renderDashboard();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders the overview description text', () => {
      renderDashboard();
      expect(
        screen.getByText('Overview of refund and recoupment request activity.')
      ).toBeInTheDocument();
    });

    it('renders the Quick Actions section heading', () => {
      renderDashboard();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
  });

  describe('summary cards', () => {
    it('renders Total Requests summary card with correct value from seed data', () => {
      renderDashboard();
      expect(screen.getByText('Total Requests')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders Total Refund Amount summary card with correct value from seed data', () => {
      renderDashboard();
      expect(screen.getByText('Total Refund Amount')).toBeInTheDocument();
      expect(screen.getByText('$3,230.25')).toBeInTheDocument();
    });

    it('renders Total Recoupment Amount summary card with correct value from seed data', () => {
      renderDashboard();
      expect(screen.getByText('Total Recoupment Amount')).toBeInTheDocument();
      expect(screen.getByText('$5,301.25')).toBeInTheDocument();
    });

    it('renders zero metrics when no requests exist', () => {
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify([]);
      store[STORAGE_KEYS.MEMBER] = JSON.stringify([{ id: 'MEM001', firstName: 'John', lastName: 'Smith' }]);
      store[STORAGE_KEYS.PROVIDER] = JSON.stringify([{ id: 'PRV001', name: 'Test Provider' }]);
      store[STORAGE_KEYS.PAYMENT] = JSON.stringify([]);

      renderDashboard();

      expect(screen.getByText('Total Requests')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('renders correct metrics for custom request data', () => {
      store[STORAGE_KEYS.MEMBER] = JSON.stringify([{ id: 'MEM001', firstName: 'John', lastName: 'Smith' }]);
      store[STORAGE_KEYS.PROVIDER] = JSON.stringify([{ id: 'PRV001', name: 'Test Provider' }]);
      store[STORAGE_KEYS.PAYMENT] = JSON.stringify([]);
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify([
        {
          id: 'REQ-TEST-1',
          requestType: 'REFUND',
          status: 'NEW',
          memberId: 'MEM001',
          providerId: 'PRV001',
          amount: 100.50,
          createdDate: '2024-06-01',
          updatedDate: '2024-06-01',
        },
        {
          id: 'REQ-TEST-2',
          requestType: 'RECOUPMENT',
          status: 'IN_PROGRESS',
          memberId: 'MEM001',
          providerId: 'PRV001',
          amount: 200.75,
          createdDate: '2024-06-02',
          updatedDate: '2024-06-02',
        },
      ]);

      renderDashboard();

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('$100.50')).toBeInTheDocument();
      expect(screen.getByText('$200.75')).toBeInTheDocument();
    });
  });

  describe('seed data', () => {
    it('seeds data on first visit when localStorage is empty', () => {
      renderDashboard();

      expect(localStorage.setItem).toHaveBeenCalled();
      const setItemCalls = localStorage.setItem.mock.calls;
      const memberCall = setItemCalls.find((c) => c[0] === STORAGE_KEYS.MEMBER);
      const providerCall = setItemCalls.find((c) => c[0] === STORAGE_KEYS.PROVIDER);
      const requestCall = setItemCalls.find((c) => c[0] === STORAGE_KEYS.REQUEST_MASTER);

      expect(memberCall).toBeDefined();
      expect(providerCall).toBeDefined();
      expect(requestCall).toBeDefined();
    });

    it('does not overwrite existing data on subsequent visits', () => {
      const existingRequests = [
        {
          id: 'REQ-EXISTING',
          requestType: 'REFUND',
          status: 'NEW',
          memberId: 'MEM001',
          providerId: 'PRV001',
          amount: 999.99,
          createdDate: '2024-06-01',
          updatedDate: '2024-06-01',
        },
      ];
      store[STORAGE_KEYS.REQUEST_MASTER] = JSON.stringify(existingRequests);
      store[STORAGE_KEYS.MEMBER] = JSON.stringify([{ id: 'MEM001', firstName: 'John', lastName: 'Smith' }]);
      store[STORAGE_KEYS.PROVIDER] = JSON.stringify([{ id: 'PRV001', name: 'Test Provider' }]);
      store[STORAGE_KEYS.PAYMENT] = JSON.stringify([]);

      renderDashboard();

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('$999.99')).toBeInTheDocument();
    });
  });

  describe('navigation buttons', () => {
    it('renders the Create Request button', () => {
      renderDashboard();
      expect(screen.getByRole('button', { name: 'Create Request' })).toBeInTheDocument();
    });

    it('renders the Search Requests button', () => {
      renderDashboard();
      expect(screen.getByRole('button', { name: 'Search Requests' })).toBeInTheDocument();
    });

    it('renders the Reports button', () => {
      renderDashboard();
      expect(screen.getByRole('button', { name: 'Reports' })).toBeInTheDocument();
    });

    it('renders the Exit button', () => {
      renderDashboard();
      expect(screen.getByRole('button', { name: 'Exit' })).toBeInTheDocument();
    });

    it('navigates to /create when Create Request button is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Create Request' }));

      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    it('navigates to /search when Search Requests button is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Search Requests' }));

      expect(mockNavigate).toHaveBeenCalledWith('/search');
    });

    it('navigates to /reports when Reports button is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Reports' }));

      expect(mockNavigate).toHaveBeenCalledWith('/reports');
    });

    it('clears localStorage and reloads when Exit button is clicked', async () => {
      const user = userEvent.setup();
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
        configurable: true,
      });

      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Exit' }));

      expect(localStorage.removeItem).toHaveBeenCalled();
      expect(reloadMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('PRD wireframe elements', () => {
    it('renders all three summary cards', () => {
      renderDashboard();

      expect(screen.getByText('Total Requests')).toBeInTheDocument();
      expect(screen.getByText('Total Refund Amount')).toBeInTheDocument();
      expect(screen.getByText('Total Recoupment Amount')).toBeInTheDocument();
    });

    it('renders all four action buttons', () => {
      renderDashboard();

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4);

      expect(screen.getByRole('button', { name: 'Create Request' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search Requests' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reports' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Exit' })).toBeInTheDocument();
    });
  });
});