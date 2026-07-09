import React from 'react';

const TruckTracking = () => {
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Live Truck Tracking</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Tracking Sidebar */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Active Shipments</h2>
          
          <div className="border border-green-200 bg-green-50 rounded p-4 mb-3">
            <h4 className="font-bold text-green-800 text-sm">Truck: TN-01-AB-1234</h4>
            <p className="text-xs text-gray-600 mt-1">Status: In Transit</p>
            <p className="text-xs text-gray-600">ETA: 4 Hours</p>
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h4 className="font-bold text-gray-800 text-sm">Truck: MH-12-XY-9876</h4>
            <p className="text-xs text-gray-600 mt-1">Status: Loading</p>
            <p className="text-xs text-gray-600">ETA: N/A</p>
          </div>
        </div>

        {/* Map Area Placeholder */}
        <div className="w-full md:w-2/3 bg-gray-200 rounded-lg shadow border border-gray-300 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-500 font-medium">Map Integration Placeholder</p>
            <p className="text-sm text-gray-400">(Google Maps or Leaflet API goes here)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckTracking;