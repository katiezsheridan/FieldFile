import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">FieldFile</h3>
            <p className="text-sm text-gray-600">
              Simplifying wildlife activity management and tax exemption filing for landowners.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-sm text-gray-600 hover:text-primary-600">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-gray-600 hover:text-primary-600">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-sm text-gray-600 hover:text-primary-600">
                  Book Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/guides" className="text-sm text-gray-600 hover:text-primary-600">
                  User Guides
                </Link>
              </li>
              <li>
                <Link to="/suppliers" className="text-sm text-gray-600 hover:text-primary-600">
                  Local Suppliers
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-gray-600 hover:text-primary-600">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-primary-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-primary-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/referrals" className="text-sm text-gray-600 hover:text-primary-600">
                  Referral Program
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} FieldFile. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
