import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getAgencyFleetStats } from '../services/agencyService';

const currency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const AgencyOverview = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fleetSummary, setFleetSummary] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [fleetError, setFleetError] = useState('');

  // --- 1. FETCH REAL ORDERS FROM DATABASE ---
  useEffect(() => {
    fetchOverviewOrders();
    fetchFleetStats();
  }, []);

  const fetchOverviewOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/orders/received');
      setRecentOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching overview orders:', err);
      const message =
        err.response?.status === 401
          ? 'Session invalid or expired. Please re-login.'
          : err.response?.status === 403
          ? "Your account isn't authorized for this route yet."
          : err.response?.data?.message || err.message || 'Could not load recent orders.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFleetStats = async () => {
    try {
      const { data } = await getAgencyFleetStats();
      setFleetSummary(data.summary);
      setTrucks(data.trucks || []);
    } catch (err) {
      console.error('Error fetching fleet stats:', err);
      setFleetError('Could not load fleet performance right now.');
    }
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();

    switch (normalizedStatus) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed':
      case 'on going':
      case 'ongoing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-[#249B74]/10 text-[#1C4E3A] border-[#249B74]/20';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#133C2C] tracking-tight">Agency Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
          <p className="text-sm font-semibold text-gray-500 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-[#249B74]">
            {isLoading || error ? '...' : recentOrders.length}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
          <p className="text-sm font-semibold text-gray-500 mb-1">Active Trucks</p>
          <p className="text-3xl font-bold text-[#249B74]">
            {fleetSummary ? `${fleetSummary.activeTrucks} / ${fleetSummary.fleetSize}` : fleetError ? '—' : '...'}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
          <p className="text-sm font-semibold text-gray-500 mb-1">Fleet Revenue (delivered)</p>
          <p className="text-3xl font-bold text-[#249B74]">
            {fleetSummary ? currency(fleetSummary.totalRevenue) : fleetError ? '—' : '...'}
          </p>
        </div>
      </div>

      {/* Fleet Performance */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#133C2C]">Fleet Performance</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Trips and earnings per truck, plus utilization relative to your busiest vehicle.
            </p>
          </div>
          {fleetSummary && (
            <span className="text-xs font-semibold text-[#249B74] bg-[#249B74]/10 border border-[#249B74]/20 rounded-full px-3 py-1.5">
              {fleetSummary.avgUtilization}% avg utilization
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                <th className="px-6 py-4">Truck</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Trips</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fleetError ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-xs font-semibold text-red-500 bg-red-50/30">
                    ⚠️ {fleetError}
                  </td>
                </tr>
              ) : fleetSummary === null ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#249B74]/20 border-t-[#249B74] rounded-full animate-spin"></div>
                      <p className="text-xs text-gray-400 font-medium">Loading fleet performance...</p>
                    </div>
                  </td>
                </tr>
              ) : trucks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-400 font-medium">
                    No trucks registered to your fleet yet.
                  </td>
                </tr>
              ) : (
                trucks.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {t.registrationNumber}
                      {!t.isVerified && (
                        <span className="ml-2 text-[10px] font-bold text-amber-600 uppercase">Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.type?.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.trips}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{currency(t.revenue)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-[#249B74]"
                            style={{ width: `${t.utilization}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-500">{t.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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