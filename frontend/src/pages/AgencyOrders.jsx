import React, { useState, useEffect } from 'react';

const AgencyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [isLoadingTrucks, setIsLoadingTrucks] = useState(false);

  useEffect(() => {
    fetchRealOrders();
  }, []);

  const fetchRealOrders = async () => {
    setIsLoadingOrders(true);
    setError(null);
    try {
      let token = localStorage.getItem('loadshare_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please try logging in again.');
      }

      token = token.replace(/^"|"$/g, '');

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
      setOrders(data.orders || []);
      
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleDecline = async (orderId) => {
    setOrders(orders.filter((order) => (order._id || order.id) !== orderId));
  };

  const handleAccept = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    fetchAvailableTrucks();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setAvailableTrucks([]);
  };

  const fetchAvailableTrucks = async () => {
    setIsLoadingTrucks(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setAvailableTrucks([
        { id: 'TRK-901', registration: 'TN-01-AB-1234', capacity: '20 Tons', type: 'Container' },
        { id: 'TRK-902', registration: 'MH-04-XY-9876', capacity: '15 Tons', type: 'Open Half Body' },
      ]);
    } catch (error) {
      console.error("Error fetching trucks:", error);
    } finally {
      setIsLoadingTrucks(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#133C2C] tracking-tight">Orders Received</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">Review and confirm client shipment requests.</p>
        </div>
        {error && (
          <button 
            onClick={fetchRealOrders}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition-all"
          >
            Retry Connection
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4">Confirmation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoadingOrders ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-4 border-[#249B74]/20 border-t-[#249B74] rounded-full animate-spin"></div>
                    <p className="text-xs font-medium text-gray-400">Loading incoming orders...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-xs font-semibold text-red-500 bg-red-50/30">
                  ⚠️ Error loading orders: {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-16 text-center">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-[#133C2C] mb-2">No orders yet</h3>
                    <p className="text-sm text-gray-400 font-medium mb-6">
                      Waiting for shippers to place backhaul requests. When a new order matches your routes, it will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const orderId = order._id || order.id || 'N/A';
                const clientName = order.client?.name || order.client || 'Unknown Client';
                const routeInfo = order.route || `${order.pickup || 'Origin'} to ${order.dropoff || 'Destination'}`;

                return (
                  <tr key={orderId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {orderId.length > 8 ? `${orderId.substring(0, 8).toUpperCase()}...` : orderId.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{routeInfo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(order)}
                          className="bg-[#249B74] text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-opacity-90 transition-all shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(orderId)}
                          className="bg-white border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-md hover:bg-red-50 hover:border-red-300 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-[#133C2C]">Assign Truck</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Assigning a truck for this shipment request.
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 transition-colors p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <h4 className="text-[11px] font-black tracking-wider text-gray-400 uppercase mb-4">
                Available Fleet
              </h4>

              {isLoadingTrucks ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="w-8 h-8 border-4 border-[#249B74]/20 border-t-[#249B74] rounded-full animate-spin"></div>
                  <p className="text-xs font-medium text-gray-500">Querying database...</p>
                </div>
              ) : availableTrucks.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  No trucks available in the database at the moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {availableTrucks.map((truck) => (
                    <div 
                      key={truck.id} 
                      className="border border-gray-100 rounded-lg p-4 flex items-center justify-between hover:border-[#249B74]/30 hover:bg-green-50/30 transition-all"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-900">{truck.registration}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {truck.type} • <span className="font-medium text-gray-700">{truck.capacity}</span>
                        </p>
                      </div>
                      <button 
                        className="bg-[#1C4E3A] text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-opacity-90 transition-all"
                        onClick={() => {
                          const oId = selectedOrder._id || selectedOrder.id;
                          alert(`Truck ${truck.registration} assigned!`);
                          handleDecline(oId); 
                          closeModal();
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyOrders;