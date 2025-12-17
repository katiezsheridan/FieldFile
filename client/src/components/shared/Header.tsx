import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-earth-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700">FieldFile</h1>
              <span className="ml-2 text-sm text-earth-600">Wildlife Management</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/properties"
                  className="text-earth-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Properties
                </Link>
                <Link
                  to="/activities"
                  className="text-earth-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Activities
                </Link>
                <Link
                  to="/filings"
                  className="text-earth-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Filings
                </Link>
                <Link
                  to="/documents"
                  className="text-earth-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Documents
                </Link>

                <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-earth-200">
                  <span className="text-sm text-earth-700 font-medium">{user?.name}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-earth-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-medium"
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
