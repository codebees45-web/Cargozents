import React, { useState } from 'react';

const AgencyOrders = () => {
  const [orders] = useState([
    { id: 'ORD-1001', client: 'TechCorp Logistics', route: 'Chennai to Bangalore', status: 'Pending' },
    { id: 'ORD-1002', client: 'Ramesh Traders', route: 'Mumbai to Delhi', status: 'Assigned' },
    { id: 'ORD-1003', client: 'Global Exports', route: 'Pune to Hyderabad', status: 'Completed' },
  ]);

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders Received</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-sm font-semibold text-gray-600">Order ID</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Client</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Route</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-sm font-medium text-gray-800">{order.id}</td>
                <td className="p-4 text-sm text-gray-600">{order.client}</td>
                <td className="p-4 text-sm text-gray-600">{order.route}</td>
                <td className="p-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgencyOrders;