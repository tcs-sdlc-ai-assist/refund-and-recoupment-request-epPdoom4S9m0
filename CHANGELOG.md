# Changelog

All notable changes to the Refund & Recoupment Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-15

### Added

- **Dashboard** — Overview page displaying key metrics (Total Requests, Total Refund Amount, Total Recoupment Amount) with quick-action navigation buttons for Create Request, Search Requests, Reports, and Exit.
- **Create Request** — Form to submit new refund or recoupment requests with real-time field-level validation for required fields (Request Type, Member, Provider, Amount) and optional fields (Claim/Payment ID, Reason, Notes).
- **Edit Request** — Update existing requests, change status, or mark as processed; requests with Processed or Closed status become read-only with a warning message displayed.
- **Process Request** — Ability to mark a request as Processed via a dedicated Process button, which locks the request from further edits.
- **Search & Filter** — Search requests by ID, Member, Provider, Status, Request Type, and Date Range with AND logic across all filter criteria. Includes Search, Reset, and Refresh actions.
- **Request List** — Results table displaying request ID, type, member name, provider name, amount, status badge, and View/Edit action button for each matching request.
- **Reports** — Aggregated metrics table and monthly summary breakdown with report type filtering (All Requests, Total Refunds, Total Recoupments, Monthly Summary).
- **CSV Export** — Export report data as a downloadable CSV file with timestamped filenames in the format `refund_recoupment_report_YYYYMMDD_HHMMSS.csv`.
- **Status Badges** — Color-coded status pill components for New, In Progress, Processed, and Closed statuses.
- **Summary Cards** — Reusable metric display cards used on Dashboard and Reports pages.
- **Seed Data** — Automatic seeding of sample members (10), providers (10), payments (5), and requests (5) on first application load when localStorage is empty.
- **Data Persistence** — All application data stored in browser localStorage with JSON serialization using namespaced keys (`rrt_request_master`, `rrt_member`, `rrt_provider`, `rrt_payment`).
- **Request Validation** — Field-level validation with error messages for required fields, amount validation (must be greater than 0), Claim/Payment ID format validation (alphanumeric, hyphens, underscores only), and reason length validation (max 500 characters).
- **Metrics Aggregation** — Calculation of total refund amount, total recoupment amount, total request count, and monthly summary grouped by YYYY-MM with descending sort order.
- **Navigation** — Top navigation bar with active state styling using React Router NavLink for Dashboard, Create Request, Search, and Reports routes.
- **Exit Action** — Dashboard Exit button that clears all application data from localStorage and reloads the page to reset with fresh seed data.
- **Responsive Layout** — Tailwind CSS responsive design with custom color palette (primary, accent, danger, warning, neutral) and mobile-friendly grid layouts.
- **Unit Tests** — Comprehensive test suites for RequestForm component, Dashboard page, request repository, request validator, search service, metrics aggregator, and CSV exporter using Vitest and React Testing Library.

### Technical Stack

- React 18 with JSX
- Vite 5 build tool
- React Router DOM 6 for client-side routing
- Tailwind CSS 3 with custom color configuration
- PropTypes for component prop validation
- Vitest with React Testing Library and jsdom for testing
- Browser localStorage for data persistence (no backend required)