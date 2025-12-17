import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-green-50 via-earth-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-earth-900 mb-6">
            Wildlife Filing Made Simple
          </h1>
          <p className="text-xl text-earth-700 mb-8 max-w-3xl mx-auto">
            The TurboTax for wildlife exemption filing. Track activities, document compliance,
            and file reports with confidence.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-primary-600 text-white text-lg font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/demo"
              className="px-8 py-4 bg-white text-primary-700 text-lg font-medium rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-earth-900 mb-12">
          Everything You Need to Stay Compliant
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-earth-900 mb-2">Activity Tracking</h3>
            <p className="text-earth-600">
              Track all wildlife activities with photos, GPS coordinates, and detailed documentation.
              Never miss a deadline with automated reminders.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-earth-900 mb-2">Guided Filing</h3>
            <p className="text-earth-600">
              Step-by-step guidance through the filing process. We'll help you gather evidence
              and submit compliant reports to your county.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-earth-900 mb-2">Document Vault</h3>
            <p className="text-earth-600">
              Secure storage for all your documentation. AI-powered validation ensures your
              evidence meets county standards.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-earth-200 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-earth-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-earth-900 mb-2">Property Mapping</h3>
            <p className="text-earth-600">
              Interactive maps with GPS pinpoints for birdhouses, water sources, and activity
              locations. Integrated with Google Maps.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-earth-200 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-earth-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-earth-900 mb-2">Service Booking</h3>
            <p className="text-earth-600">
              Book FieldFile professionals to complete activities or take photos on your behalf.
              We handle the work, you get the credit.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-earth-200 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-earth-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-earth-900 mb-2">Team Collaboration</h3>
            <p className="text-earth-600">
              Add co-owners, property managers, and ranch hands with role-based permissions.
              Everyone stays in sync.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to simplify your wildlife filing?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Join landowners across Texas who trust FieldFile for their wildlife exemption management.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-primary-700 text-lg font-medium rounded-lg hover:bg-green-50 transition-colors shadow-lg"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
