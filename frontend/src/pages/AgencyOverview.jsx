import React from 'react';

const AgencyOverview = () => {
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Agency Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">142</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Active Trucks</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">18</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Revenue (Monthly)</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">₹45,200</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h2>
        <p className="text-gray-500">No new alerts. All trucks are running on schedule.</p>
      </div>
    </div>
  );
};

export default AgencyOverview;