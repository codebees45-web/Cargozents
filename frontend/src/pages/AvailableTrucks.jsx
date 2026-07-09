import React, { useState } from 'react';

const AvailableTrucks = () => {
  const [trucks] = useState([
    { id: 'TN-01-AB-1234', type: 'Container (20ft)', capacity: '10 Tons', location: 'Chennai Hub', available: true },
    { id: 'MH-12-XY-9876', type: 'Open Half Body', capacity: '15 Tons', location: 'Mumbai Depot', available: false },
    { id: 'KA-05-PQ-5566', type: 'Refrigerated', capacity: '5 Tons', location: 'Bangalore Hub', available: true },
  ]);

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Available Trucks</h1>
        <button className="bg-green-700 text-white px-4 py-2 rounded shadow hover:bg-green-800 transition">
          + Add New Truck
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trucks.map((truck) => (
          <div key={truck.id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">{truck.id}</h3>
              <span className={`w-3 h-3 rounded-full ${truck.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
            <p className="text-sm text-gray-600 mb-1"><strong>Type:</strong> {truck.type}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Capacity:</strong> {truck.capacity}</p>
            <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
              📍 Current Location: <span className="font-medium">{truck.location}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableTrucks;