import { STORAGE_KEYS, STATUS, REQUEST_TYPE } from '../constants';
import { getItem, setItem } from './localStorageService';

/**
 * Sample member records
 * @type {Array<Object>}
 */
const SEED_MEMBERS = [
  { id: 'MEM001', firstName: 'John', lastName: 'Smith', dateOfBirth: '1985-03-15', memberId: 'MEM001', plan: 'Gold', email: 'john.smith@example.com', phone: '555-0101' },
  { id: 'MEM002', firstName: 'Jane', lastName: 'Doe', dateOfBirth: '1990-07-22', memberId: 'MEM002', plan: 'Silver', email: 'jane.doe@example.com', phone: '555-0102' },
  { id: 'MEM003', firstName: 'Robert', lastName: 'Johnson', dateOfBirth: '1978-11-30', memberId: 'MEM003', plan: 'Platinum', email: 'robert.johnson@example.com', phone: '555-0103' },
  { id: 'MEM004', firstName: 'Emily', lastName: 'Williams', dateOfBirth: '1995-01-10', memberId: 'MEM004', plan: 'Gold', email: 'emily.williams@example.com', phone: '555-0104' },
  { id: 'MEM005', firstName: 'Michael', lastName: 'Brown', dateOfBirth: '1982-06-18', memberId: 'MEM005', plan: 'Silver', email: 'michael.brown@example.com', phone: '555-0105' },
  { id: 'MEM006', firstName: 'Sarah', lastName: 'Davis', dateOfBirth: '1988-09-25', memberId: 'MEM006', plan: 'Gold', email: 'sarah.davis@example.com', phone: '555-0106' },
  { id: 'MEM007', firstName: 'David', lastName: 'Miller', dateOfBirth: '1975-04-12', memberId: 'MEM007', plan: 'Platinum', email: 'david.miller@example.com', phone: '555-0107' },
  { id: 'MEM008', firstName: 'Jessica', lastName: 'Wilson', dateOfBirth: '1993-12-05', memberId: 'MEM008', plan: 'Silver', email: 'jessica.wilson@example.com', phone: '555-0108' },
  { id: 'MEM009', firstName: 'Daniel', lastName: 'Moore', dateOfBirth: '1980-08-20', memberId: 'MEM009', plan: 'Gold', email: 'daniel.moore@example.com', phone: '555-0109' },
  { id: 'MEM010', firstName: 'Ashley', lastName: 'Taylor', dateOfBirth: '1991-02-14', memberId: 'MEM010', plan: 'Platinum', email: 'ashley.taylor@example.com', phone: '555-0110' },
];

/**
 * Sample provider records
 * @type {Array<Object>}
 */
const SEED_PROVIDERS = [
  { id: 'PRV001', name: 'City General Hospital', npi: '1234567890', taxId: '12-3456789', specialty: 'General Medicine', address: '100 Main St, Springfield, IL 62701', phone: '555-1001' },
  { id: 'PRV002', name: 'Lakeside Medical Center', npi: '2345678901', taxId: '23-4567890', specialty: 'Cardiology', address: '200 Lake Ave, Chicago, IL 60601', phone: '555-1002' },
  { id: 'PRV003', name: 'Summit Health Clinic', npi: '3456789012', taxId: '34-5678901', specialty: 'Orthopedics', address: '300 Summit Rd, Denver, CO 80201', phone: '555-1003' },
  { id: 'PRV004', name: 'Valley Pediatrics', npi: '4567890123', taxId: '45-6789012', specialty: 'Pediatrics', address: '400 Valley Blvd, Phoenix, AZ 85001', phone: '555-1004' },
  { id: 'PRV005', name: 'Riverside Urgent Care', npi: '5678901234', taxId: '56-7890123', specialty: 'Urgent Care', address: '500 River St, Austin, TX 73301', phone: '555-1005' },
  { id: 'PRV006', name: 'Northside Family Practice', npi: '6789012345', taxId: '67-8901234', specialty: 'Family Medicine', address: '600 North Ave, Seattle, WA 98101', phone: '555-1006' },
  { id: 'PRV007', name: 'Eastside Dermatology', npi: '7890123456', taxId: '78-9012345', specialty: 'Dermatology', address: '700 East Blvd, Miami, FL 33101', phone: '555-1007' },
  { id: 'PRV008', name: 'Westview Radiology', npi: '8901234567', taxId: '89-0123456', specialty: 'Radiology', address: '800 West Dr, Portland, OR 97201', phone: '555-1008' },
  { id: 'PRV009', name: 'Central Neurology Associates', npi: '9012345678', taxId: '90-1234567', specialty: 'Neurology', address: '900 Central Pkwy, Atlanta, GA 30301', phone: '555-1009' },
  { id: 'PRV010', name: 'Southgate Oncology Group', npi: '0123456789', taxId: '01-2345678', specialty: 'Oncology', address: '1000 South Gate Rd, Boston, MA 02101', phone: '555-1010' },
];

/**
 * Sample payment records
 * @type {Array<Object>}
 */
const SEED_PAYMENTS = [
  { id: 'PAY001', claimId: 'CLM-2024-001', memberId: 'MEM001', providerId: 'PRV001', amount: 1500.00, paidDate: '2024-01-15', checkNumber: 'CHK-10001', status: 'PAID' },
  { id: 'PAY002', claimId: 'CLM-2024-002', memberId: 'MEM003', providerId: 'PRV002', amount: 3200.50, paidDate: '2024-02-20', checkNumber: 'CHK-10002', status: 'PAID' },
  { id: 'PAY003', claimId: 'CLM-2024-003', memberId: 'MEM005', providerId: 'PRV004', amount: 750.00, paidDate: '2024-03-10', checkNumber: 'CHK-10003', status: 'PAID' },
  { id: 'PAY004', claimId: 'CLM-2024-004', memberId: 'MEM007', providerId: 'PRV006', amount: 2100.75, paidDate: '2024-04-05', checkNumber: 'CHK-10004', status: 'PAID' },
  { id: 'PAY005', claimId: 'CLM-2024-005', memberId: 'MEM009', providerId: 'PRV008', amount: 980.25, paidDate: '2024-05-18', checkNumber: 'CHK-10005', status: 'PAID' },
];

/**
 * Sample request master records
 * @type {Array<Object>}
 */
const SEED_REQUESTS = [
  {
    id: 'REQ001',
    requestType: REQUEST_TYPE.REFUND,
    status: STATUS.NEW,
    memberId: 'MEM001',
    providerId: 'PRV001',
    paymentId: 'PAY001',
    amount: 1500.00,
    reason: 'Duplicate payment identified during audit',
    createdDate: '2024-06-01',
    updatedDate: '2024-06-01',
    notes: 'Initial review pending',
  },
  {
    id: 'REQ002',
    requestType: REQUEST_TYPE.RECOUPMENT,
    status: STATUS.IN_PROGRESS,
    memberId: 'MEM003',
    providerId: 'PRV002',
    paymentId: 'PAY002',
    amount: 3200.50,
    reason: 'Overpayment due to incorrect fee schedule',
    createdDate: '2024-05-15',
    updatedDate: '2024-06-10',
    notes: 'Provider contacted, awaiting response',
  },
  {
    id: 'REQ003',
    requestType: REQUEST_TYPE.REFUND,
    status: STATUS.PROCESSED,
    memberId: 'MEM005',
    providerId: 'PRV004',
    paymentId: 'PAY003',
    amount: 750.00,
    reason: 'Service not rendered as billed',
    createdDate: '2024-04-20',
    updatedDate: '2024-06-05',
    notes: 'Refund check issued',
  },
  {
    id: 'REQ004',
    requestType: REQUEST_TYPE.RECOUPMENT,
    status: STATUS.CLOSED,
    memberId: 'MEM007',
    providerId: 'PRV006',
    paymentId: 'PAY004',
    amount: 2100.75,
    reason: 'Coordination of benefits adjustment',
    createdDate: '2024-03-01',
    updatedDate: '2024-05-28',
    notes: 'Recoupment completed successfully',
  },
  {
    id: 'REQ005',
    requestType: REQUEST_TYPE.REFUND,
    status: STATUS.NEW,
    memberId: 'MEM009',
    providerId: 'PRV008',
    paymentId: 'PAY005',
    amount: 980.25,
    reason: 'Member eligibility terminated prior to service date',
    createdDate: '2024-06-12',
    updatedDate: '2024-06-12',
    notes: '',
  },
];

/**
 * Seeds localStorage with sample data if no data currently exists.
 * Checks each storage key independently — only seeds a table if it is empty.
 * @returns {void}
 */
export function seedData() {
  const existingMembers = getItem(STORAGE_KEYS.MEMBER, null);
  if (existingMembers === null || (Array.isArray(existingMembers) && existingMembers.length === 0)) {
    setItem(STORAGE_KEYS.MEMBER, SEED_MEMBERS);
  }

  const existingProviders = getItem(STORAGE_KEYS.PROVIDER, null);
  if (existingProviders === null || (Array.isArray(existingProviders) && existingProviders.length === 0)) {
    setItem(STORAGE_KEYS.PROVIDER, SEED_PROVIDERS);
  }

  const existingPayments = getItem(STORAGE_KEYS.PAYMENT, null);
  if (existingPayments === null || (Array.isArray(existingPayments) && existingPayments.length === 0)) {
    setItem(STORAGE_KEYS.PAYMENT, SEED_PAYMENTS);
  }

  const existingRequests = getItem(STORAGE_KEYS.REQUEST_MASTER, null);
  if (existingRequests === null || (Array.isArray(existingRequests) && existingRequests.length === 0)) {
    setItem(STORAGE_KEYS.REQUEST_MASTER, SEED_REQUESTS);
  }
}