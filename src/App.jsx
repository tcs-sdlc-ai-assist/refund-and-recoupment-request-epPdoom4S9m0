import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { CreateEditRequest } from './pages/CreateEditRequest';
import { SearchRequests } from './pages/SearchRequests';
import { Reports } from './pages/Reports';

/**
 * Root application component.
 * Sets up React Router with BrowserRouter and defines all application routes.
 * Includes Navbar component on all pages and wraps content in a responsive layout.
 *
 * @returns {JSX.Element} The rendered App component
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateEditRequest />} />
            <Route path="/edit/:id" element={<CreateEditRequest />} />
            <Route path="/search" element={<SearchRequests />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;