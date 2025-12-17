import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Property, DashboardStats, PropertyProgress } from '../../types';

// Mock data for demonstration
const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Oak Ridge Ranch',
    address: '123 Ranch Road',
    state: 'Texas',
    county: 'Travis',
    acreage: 45,
    ownerId: '1',
    coordinates: { lat: 30.2672, lng: -97.7431 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Willow Creek Property',
    address: '456 County Line',
    state: 'Texas',
    county: 'Williamson',
    acreage: 28,
    ownerId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockStats: DashboardStats = {
  totalProperties: 2,
  activeActivities: 12,
  completedThisYear: 8,
  upcomingDeadlines: 3,
};

const mockProgress: PropertyProgress[] = [
  {
    propertyId: '1',
    propertyName: 'Oak Ridge Ranch',
    totalActivities: 7,
    completedActivities: 5,
    progressPercentage: 71,
    nextDeadline: new Date(2025, 2, 15),
  },
  {
    propertyId: '2',
    propertyName: 'Willow Creek Property',
    totalActivities: 5,
    completedActivities: 3,
    progressPercentage: 60,
    nextDeadline: new Date(2025, 3, 1),
  },
];

export default function Dashboard() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(mockProperties[0].id);
  const selectedProperty = mockProperties.find(p => p.id === selectedPropertyId);
  const selectedProgress = mockProgress.find(p => p.propertyId === selectedPropertyId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Property Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {mockProperties.map((property) => (
              <button
                key={property.id}
                onClick={() => setSelectedPropertyId(property.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${selectedPropertyId === property.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {property.name}
              </button>
            ))}
            <Link
              to="/properties/new"
              className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              + Add Property
            </Link>
          </nav>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Total Properties</div>
          <div className="text-3xl font-bold text-gray-900">{mockStats.totalProperties}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Active Activities</div>
          <div className="text-3xl font-bold text-gray-900">{mockStats.activeActivities}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Completed This Year</div>
          <div className="text-3xl font-bold text-green-600">{mockStats.completedThisYear}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Upcoming Deadlines</div>
          <div className="text-3xl font-bold text-orange-600">{mockStats.upcomingDeadlines}</div>
        </div>
      </div>

      {/* Property Details */}
      {selectedProperty && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedProperty.name} - {new Date().getFullYear()} Progress
              </h2>

              {selectedProgress && (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Activity Completion</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {selectedProgress.completedActivities} of {selectedProgress.totalActivities} completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all"
                        style={{ width: `${selectedProgress.progressPercentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-right text-xs text-gray-500">
                      {selectedProgress.progressPercentage}% complete
                    </div>
                  </div>

                  {selectedProgress.nextDeadline && (
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-sm font-medium text-orange-800">Next Deadline</div>
                      <div className="text-lg font-semibold text-orange-900">
                        {selectedProgress.nextDeadline.toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-orange-700 mt-1">
                        {Math.ceil((selectedProgress.nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <Link
                      to={`/properties/${selectedPropertyId}/activities`}
                      className="flex-1 py-2 px-4 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      View Activities
                    </Link>
                    <Link
                      to="/filing-wizard"
                      className="flex-1 py-2 px-4 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Start Filing
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Property Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Address</dt>
                  <dd className="text-sm font-medium text-gray-900">{selectedProperty.address}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">County</dt>
                  <dd className="text-sm font-medium text-gray-900">{selectedProperty.county} County</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">State</dt>
                  <dd className="text-sm font-medium text-gray-900">{selectedProperty.state}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Acreage</dt>
                  <dd className="text-sm font-medium text-gray-900">{selectedProperty.acreage} acres</dd>
                </div>
              </dl>

              <div className="mt-6 space-y-2">
                <Link
                  to={`/properties/${selectedPropertyId}/map`}
                  className="block w-full py-2 px-4 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View on Map
                </Link>
                <Link
                  to={`/properties/${selectedPropertyId}/edit`}
                  className="block w-full py-2 px-4 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit Property
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/documents/upload"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="text-lg font-medium text-gray-900">Upload Photos</div>
            <div className="text-sm text-gray-600 mt-1">Add documentation for activities</div>
          </Link>
          <Link
            to="/calendar"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="text-lg font-medium text-gray-900">Book Service</div>
            <div className="text-sm text-gray-600 mt-1">Schedule FieldFile assistance</div>
          </Link>
          <Link
            to="/suppliers"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="text-lg font-medium text-gray-900">Find Suppliers</div>
            <div className="text-sm text-gray-600 mt-1">Local wildlife activity suppliers</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
