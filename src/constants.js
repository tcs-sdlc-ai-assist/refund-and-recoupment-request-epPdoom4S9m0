/**
 * Application-wide constants for the Refund & Recoupment Tracker
 */

/**
 * Request status values
 * @enum {string}
 */
export const STATUS = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  PROCESSED: 'PROCESSED',
  CLOSED: 'CLOSED',
};

/**
 * Array of all status values for iteration
 * @type {string[]}
 */
export const STATUS_OPTIONS = [
  STATUS.NEW,
  STATUS.IN_PROGRESS,
  STATUS.PROCESSED,
  STATUS.CLOSED,
];

/**
 * Human-readable labels for status values
 * @type {Object.<string, string>}
 */
export const STATUS_LABELS = {
  [STATUS.NEW]: 'New',
  [STATUS.IN_PROGRESS]: 'In Progress',
  [STATUS.PROCESSED]: 'Processed',
  [STATUS.CLOSED]: 'Closed',
};

/**
 * Request type values
 * @enum {string}
 */
export const REQUEST_TYPE = {
  REFUND: 'REFUND',
  RECOUPMENT: 'RECOUPMENT',
};

/**
 * Array of all request type values for iteration
 * @type {string[]}
 */
export const REQUEST_TYPE_OPTIONS = [
  REQUEST_TYPE.REFUND,
  REQUEST_TYPE.RECOUPMENT,
];

/**
 * Human-readable labels for request types
 * @type {Object.<string, string>}
 */
export const REQUEST_TYPE_LABELS = {
  [REQUEST_TYPE.REFUND]: 'Refund',
  [REQUEST_TYPE.RECOUPMENT]: 'Recoupment',
};

/**
 * localStorage keys for persisting table data
 * @enum {string}
 */
export const STORAGE_KEYS = {
  REQUEST_MASTER: 'rrt_request_master',
  MEMBER: 'rrt_member',
  PROVIDER: 'rrt_provider',
  PAYMENT: 'rrt_payment',
};

/**
 * Report type options
 * @enum {string}
 */
export const REPORT_TYPE = {
  SUMMARY: 'SUMMARY',
  DETAILED: 'DETAILED',
  BY_STATUS: 'BY_STATUS',
  BY_TYPE: 'BY_TYPE',
};

/**
 * Array of all report type values for iteration
 * @type {string[]}
 */
export const REPORT_TYPE_OPTIONS = [
  REPORT_TYPE.SUMMARY,
  REPORT_TYPE.DETAILED,
  REPORT_TYPE.BY_STATUS,
  REPORT_TYPE.BY_TYPE,
];

/**
 * Human-readable labels for report types
 * @type {Object.<string, string>}
 */
export const REPORT_TYPE_LABELS = {
  [REPORT_TYPE.SUMMARY]: 'Summary Report',
  [REPORT_TYPE.DETAILED]: 'Detailed Report',
  [REPORT_TYPE.BY_STATUS]: 'Report by Status',
  [REPORT_TYPE.BY_TYPE]: 'Report by Type',
};

/**
 * Default date formats used across the application
 * @type {Object.<string, string>}
 */
export const DATE_FORMATS = {
  DISPLAY: 'MM/DD/YYYY',
  INPUT: 'YYYY-MM-DD',
  DISPLAY_WITH_TIME: 'MM/DD/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
};