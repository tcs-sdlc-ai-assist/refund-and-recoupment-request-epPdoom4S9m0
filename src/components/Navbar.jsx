import { NavLink } from 'react-router-dom';

/**
 * Top navigation bar component displaying the application title and navigation links.
 * Uses React Router NavLink for active state styling.
 * @returns {JSX.Element} The rendered Navbar component
 */
export function Navbar() {
  const linkBaseClasses =
    'px-3 py-2 rounded-md text-sm font-medium transition-colors';
  const activeLinkClasses = 'bg-primary-700 text-white';
  const inactiveLinkClasses =
    'text-primary-100 hover:bg-primary-600 hover:text-white';

  /**
   * Returns className string based on NavLink active state.
   * @param {{ isActive: boolean }} params
   * @returns {string} The computed className
   */
  function getLinkClassName({ isActive }) {
    return `${linkBaseClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;
  }

  return (
    <nav className="bg-primary-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="text-white text-lg font-bold tracking-tight">
              Refund &amp; Recoupment System
            </NavLink>
          </div>
          <div className="flex items-center space-x-2">
            <NavLink to="/" end className={getLinkClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/create" className={getLinkClassName}>
              Create Request
            </NavLink>
            <NavLink to="/search" className={getLinkClassName}>
              Search
            </NavLink>
            <NavLink to="/reports" className={getLinkClassName}>
              Reports
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;