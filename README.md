# Refund & Recoupment Tracker

A single-page application for tracking, managing, and reporting on refund and recoupment requests in a healthcare payment processing context. Built with React and Vite, using localStorage for client-side data persistence.

## Features

- **Dashboard** — Overview of key metrics (total requests, total refund amount, total recoupment amount) with quick-action navigation buttons
- **Create Request** — Form to submit new refund or recoupment requests with real-time validation
- **Edit Request** — Update existing requests, change status, or mark as processed; processed/closed requests become read-only
- **Search & Filter** — Search requests by ID, member, provider, status, request type, and date range
- **Reports** — Aggregated metrics table and monthly summary breakdown with report type filtering
- **CSV Export** — Export report data as a downloadable CSV file with timestamped filenames
- **Seed Data** — Automatically seeds sample members, providers, payments, and requests on first load
- **Data Persistence** — All data stored in browser localStorage with JSON serialization

## Tech Stack

- **Framework:** [React 18](https://react.dev/) with JSX
- **Build Tool:** [Vite 5](https://vitejs.dev/)
- **Routing:** [React Router DOM 6](https://reactrouter.com/)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/) with custom color palette (primary, accent, danger, warning, neutral)
- **Prop Validation:** [PropTypes](https://www.npmjs.com/package/prop-types)
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [jsdom](https://github.com/jsdom/jsdom)
- **Storage:** Browser localStorage (no backend required)

## Folder Structure

```
refund-recoupment-tracker/
├── index.html                          # HTML entry point
├── package.json                        # Dependencies and scripts
├── vite.config.js                      # Vite configuration
├── vitest.config.js                    # Vitest configuration
├── tailwind.config.js                  # Tailwind CSS configuration with custom colors
├── postcss.config.js                   # PostCSS configuration
├── vercel.json                         # Vercel deployment rewrites for SPA
├── .env.example                        # Environment variable template
├── .gitignore
├── src/
│   ├── main.jsx                        # Application entry point (renders App)
│   ├── App.jsx                         # Root component with BrowserRouter and routes
│   ├── index.css                       # Tailwind directives and base styles
│   ├── constants.js                    # Application-wide constants (STATUS, REQUEST_TYPE, STORAGE_KEYS)
│   ├── setupTests.js                   # Test setup (jest-dom matchers)
│   ├── components/
│   │   ├── Navbar.jsx                  # Top navigation bar with NavLink active states
│   │   ├── SummaryCard.jsx             # Reusable metric display card
│   │   ├── StatusBadge.jsx             # Colored status pill/badge component
│   │   ├── RequestForm.jsx             # Create/edit request form with validation
│   │   ├── RequestList.jsx             # Request results table with View/Edit actions
│   │   ├── SearchPanel.jsx             # Search filter panel with multiple criteria
│   │   ├── ReportTypeDropdown.jsx      # Report type selection dropdown
│   │   ├── MetricsTable.jsx            # Summary metrics display table
│   │   ├── MonthlySummaryTable.jsx     # Monthly breakdown table
│   │   └── __tests__/
│   │       └── RequestForm.test.jsx    # RequestForm component tests
│   ├── pages/
│   │   ├── Dashboard.jsx               # Dashboard page with summary cards and actions
│   │   ├── CreateEditRequest.jsx       # Create/Edit request page wrapper
│   │   ├── SearchRequests.jsx          # Search page composing SearchPanel + RequestList
│   │   ├── Reports.jsx                 # Reports page with metrics and monthly summary
│   │   └── __tests__/
│   │       └── Dashboard.test.jsx      # Dashboard page tests
│   └── services/
│       ├── localStorageService.js      # Generic localStorage abstraction (get/set/remove/clear)
│       ├── memberRepository.js         # Member data access (getAllMembers, getMemberById)
│       ├── providerRepository.js       # Provider data access (getAllProviders, getProviderById)
│       ├── requestRepository.js        # Request CRUD operations (save, update, delete, get)
│       ├── requestValidator.js         # Request form validation with field-level errors
│       ├── searchService.js            # In-memory request search/filter engine
│       ├── metricsAggregator.js        # Metrics calculation (totals, monthly summary)
│       ├── csvExporter.js              # CSV generation and browser download trigger
│       ├── seedData.js                 # Sample data seeding on first load
│       └── __tests__/
│           ├── requestRepository.test.js   # Request repository unit tests
│           ├── requestValidator.test.js     # Validator unit tests
│           ├── searchService.test.js        # Search service unit tests
│           ├── metricsAggregator.test.js    # Metrics aggregator unit tests
│           └── csvExporter.test.js          # CSV exporter unit tests
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd refund-recoupment-tracker

# Install dependencies
npm install
```

### Environment Variables

Copy the example environment file and adjust values as needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_APP_TITLE` | Application title displayed in the browser tab and header | `Refund & Recoupment Tracker` |
| `VITE_API_BASE_URL` | Base URL for API requests (leave empty for relative paths) | _(empty)_ |
| `VITE_DEBUG` | Enable debug mode for verbose console logging | `false` |

### Development

```bash
# Start the development server on http://localhost:3000
npm run dev
```

### Testing

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Build

```bash
# Create a production build in the dist/ directory
npm run build

# Preview the production build locally
npm run preview
```

## Deployment

### Vercel

The project includes a `vercel.json` configuration that handles SPA routing rewrites. Deploy directly from your Git repository or use the Vercel CLI:

```bash
npx vercel
```

### Static Hosting

After running `npm run build`, serve the contents of the `dist/` directory with any static file server. Ensure all routes are rewritten to `index.html` for client-side routing to work.

## localStorage Data Model

All application data is persisted in the browser's localStorage using JSON serialization. Each table uses a namespaced key prefix (`rrt_`) to avoid collisions with other applications.

### Storage Keys

| Key | Description |
|---|---|
| `rrt_request_master` | Array of request objects |
| `rrt_member` | Array of member objects |
| `rrt_provider` | Array of provider objects |
| `rrt_payment` | Array of payment objects |

### Request Object Schema

```json
{
  "id": "REQ-1717000000000-A1B2C3",
  "requestType": "REFUND | RECOUPMENT",
  "status": "NEW | IN_PROGRESS | PROCESSED | CLOSED",
  "memberId": "MEM001",
  "providerId": "PRV001",
  "paymentId": "PAY001",
  "amount": 1500.00,
  "reason": "Duplicate payment identified during audit",
  "notes": "Initial review pending",
  "createdDate": "2024-06-01T10:00:00.000Z",
  "updatedDate": "2024-06-01T10:00:00.000Z"
}
```

### Member Object Schema

```json
{
  "id": "MEM001",
  "firstName": "John",
  "lastName": "Smith",
  "dateOfBirth": "1985-03-15",
  "memberId": "MEM001",
  "plan": "Gold",
  "email": "john.smith@example.com",
  "phone": "555-0101"
}
```

### Provider Object Schema

```json
{
  "id": "PRV001",
  "name": "City General Hospital",
  "npi": "1234567890",
  "taxId": "12-3456789",
  "specialty": "General Medicine",
  "address": "100 Main St, Springfield, IL 62701",
  "phone": "555-1001"
}
```

### Payment Object Schema

```json
{
  "id": "PAY001",
  "claimId": "CLM-2024-001",
  "memberId": "MEM001",
  "providerId": "PRV001",
  "amount": 1500.00,
  "paidDate": "2024-01-15",
  "checkNumber": "CHK-10001",
  "status": "PAID"
}
```

## Usage Guide

### Creating a Request

1. Navigate to **Create Request** from the Dashboard or Navbar
2. Select a **Request Type** (Refund or Recoupment)
3. Choose a **Member** and **Provider** from the dropdowns
4. Enter the **Amount** (must be greater than 0)
5. Optionally fill in **Claim/Payment ID**, **Reason**, and **Notes**
6. Click **Save** to create the request
7. You will be redirected to the edit view of the newly created request

### Editing a Request

1. Navigate to a request via **Search** or by clicking **View/Edit** in the results table
2. Modify any fields as needed
3. Click **Update** to save changes
4. Click **Process** to mark the request as Processed (this makes it read-only)

### Searching Requests

1. Navigate to **Search** from the Dashboard or Navbar
2. Enter filter criteria (all filters are optional and combined with AND logic):
   - Request ID (exact match)
   - Member (dropdown selection)
   - Provider (dropdown selection)
   - Status (New, In Progress, Processed, Closed)
   - Request Type (Refund, Recoupment)
   - Date range (From / To)
3. Click **Search** to view results
4. Click **Refresh** to reload all requests without filters
5. Click **Reset** to clear all filters

### Viewing Reports

1. Navigate to **Reports** from the Dashboard or Navbar
2. Select a **Report Type** from the dropdown:
   - **All Requests** — Shows all metrics and monthly summary
   - **Total Refunds** — Shows refund metrics only
   - **Total Recoupments** — Shows recoupment metrics only
   - **Monthly Summary** — Shows monthly breakdown table only
3. Click **Generate Report** to refresh the data
4. Click **Export CSV** to download the report as a CSV file

### Exiting the Application

Click the **Exit** button on the Dashboard to clear all application data from localStorage and reload the page. This resets the application to its initial state with fresh seed data.

## Application Routes

| Path | Page | Description |
|---|---|---|
| `/` | Dashboard | Main overview with summary cards and quick actions |
| `/create` | Create Request | New request form |
| `/edit/:id` | Edit Request | Edit existing request by ID |
| `/search` | Search Requests | Search and filter requests |
| `/reports` | Reports | Aggregated metrics and monthly summary |

## License

Private