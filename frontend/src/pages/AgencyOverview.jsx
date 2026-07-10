import React, { useState, useEffect } from 'react';

const AgencyOverview = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. FETCH REAL ORDERS FROM DATABASE ---
  useEffect(() => {
    fetchOverviewOrders();
  }, []);

  const fetchOverviewOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Retrieve the token from storage
      let token = localStorage.getItem('token'); 
      
      if (!token) {
        throw new Error('No authentication token found. Please try logging in again.');
      }

      // FIX: Clean up accidental surrounding quotes embedded by the storage wrapper
      token = token.replace(/^"|"$/g, '');
      
      console.log("DEBUG -> Cleaned Token sent to backend:", token);
      
      // Send the request to your backend endpoint
      const response = await fetch('http://localhost:5000/api/orders/received', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.status === 401) {
        throw new Error('401 Unauthorized: Session invalid or expired. Please re-login.');
      }
      
      if (response.status === 403) {
        throw new Error('403 Forbidden: Your backend route does not authorize the "agency" role yet.');
      }

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setRecentOrders(data);
      
    } catch (err) {
      console.error("Error fetching overview orders:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to dynamically style the status badges
  const getStatusStyle = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200'; // Waiting for confirmation
      case 'confirmed':
      case 'on going':
      case 'ongoing':
        return 'bg-blue-100 text-blue-700 border-blue-200'; // Truck onboard / In transit
      case 'completed':
        return 'bg-[#249B74]/10 text-[#1C4E3A] border-[#249B74]/20'; // Trip finished
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* PAGE HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-[#133C2C] tracking-tight">Agency Overview</h2>
      </div>

      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
          <p className="text-sm font-semibold text-gray-500 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-[#249B74]">
            {isLoading || error ? '...' : recentOrders.length}
          </p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
          <p className="text-sm font-semibold text-gray-500 mb-1">Active Trucks</p>
          <p className="text-3xl font-bold text-[#249B74]">18</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
          <p className="text-sm font-semibold text-gray-500 mb-1">Revenue (Monthly)</p>
          <p className="text-3xl font-bold text-[#249B74]">₹45,200</p>
        </div>
      </div>

      {/* RECENT ORDERS STATUS TABLE */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#133C2C]">Order Status Tracking</h3>
            <p className="text-xs text-gray-400 mt-0.5">Live updates on recent client orders and dispatch statuses.</p>
          </div>
          {error && (
            <button 
              onClick={fetchOverviewOrders}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition-all"
            >
              Retry Connection
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#249B74]/20 border-t-[#249B74] rounded-full animate-spin"></div>
                      <p className="text-xs text-gray-400 font-medium">Loading recent activity...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-xs font-semibold text-red-500 bg-red-50/30">
                    ⚠️ {error}
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-400 font-medium">
                    No active shipments registered in database.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const orderId = order._id || order.id || 'N/A';
                  const clientName = order.client?.name || order.client || 'Unknown Client';
                  const routeInfo = order.route || `${order.pickup || 'Origin'} to ${order.dropoff || 'Destination'}`;
                  const currentStatus = order.status || 'Pending';

                  return (
                    <tr key={orderId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {orderId.length > 8 ? `${orderId.substring(0, 8).toUpperCase()}...` : orderId.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{clientName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{routeInfo}</td>
                      <td className="px-6 py-4">
                        <span 
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(currentStatus)}`}
                        >
                          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
      </div>
      
    </div>
  );
};

export default AgencyOverview;