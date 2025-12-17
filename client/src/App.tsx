import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/shared/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/properties/Dashboard';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// App Routes Component
function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Placeholder routes - to be implemented */}
        <Route path="/activities" element={<ProtectedRoute><div className="p-8">Activities Page - Coming Soon</div></ProtectedRoute>} />
        <Route path="/filings" element={<ProtectedRoute><div className="p-8">Filings Page - Coming Soon</div></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><div className="p-8">Documents Page - Coming Soon</div></ProtectedRoute>} />
        <Route path="/filing-wizard" element={<ProtectedRoute><div className="p-8">Filing Wizard - Coming Soon</div></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<div className="text-center p-8"><h1 className="text-2xl">404 - Page Not Found</h1></div>} />
      </Routes>
    </Layout>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
