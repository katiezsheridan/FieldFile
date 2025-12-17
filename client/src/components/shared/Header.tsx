import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">FieldFile</h1>
              <span className="ml-2 text-sm text-gray-500">Wildlife Management</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/properties"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Properties
                </Link>
                <Link
                  to="/activities"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Activities
                </Link>
                <Link
                  to="/filings"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Filings
                </Link>
                <Link
                  to="/documents"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Documents
                </Link>

                <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
