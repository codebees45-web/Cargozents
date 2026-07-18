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
      case 'placed':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'confirmed':
      case 'confirmed_by_shipper':
      case 'on going':
      case 'ongoing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'delivered':
      case 'completed':
        return 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-100">Agency Overview</h2>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[#173022] bg-[#0a1811] p-6 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-[#8AA399]">Total Orders</p>
          <p className="text-3xl font-bold text-slate-100">{isLoading || error ? '…' : recentOrders.length}</p>
        </div>

        <div className="rounded-xl border border-[#173022] bg-[#0a1811] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#8AA399] mb-1">Active Trucks</p>
          <p className="text-3xl font-bold text-[#00E676]">
            {fleetSummary ? `${fleetSummary.activeTrucks} / ${fleetSummary.fleetSize}` : fleetError ? '—' : '...'}
          </p>
        </div>

        <div className="rounded-xl border border-[#173022] bg-[#0a1811] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#8AA399] mb-1">Fleet Revenue (delivered)</p>
          <p className="text-3xl font-bold text-[#00E676]">
            {fleetSummary ? currency(fleetSummary.totalRevenue) : fleetError ? '—' : '...'}
          </p>
        </div>
      </div>

      {/* Fleet Performance Table */}
      <div className="rounded-xl border border-[#173022] bg-[#0a1811] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#173022] flex justify-between items-center bg-[#0a1811]">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Fleet Performance</h3>
            <p className="text-xs text-[#8AA399] mt-0.5">
              Trips and earnings per truck, plus utilization relative to your busiest vehicle.
            </p>
          </div>
          {fleetSummary && (
            <span className="text-xs font-semibold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-full px-3 py-1.5">
              {fleetSummary.avgUtilization}% avg utilization
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0a1811] border-b border-[#173022] text-[11px] font-bold tracking-wider text-[#8AA399] uppercase">
              <tr>
                <th className="px-6 py-4">Truck</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Trips</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#173022]">
              {fleetError ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-xs font-semibold text-red-400 bg-red-500/10">
                    ⚠️ {fleetError}
                  </td>
                </tr>
              ) : fleetSummary === null ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#00E676]/20 border-t-[#00E676] rounded-full animate-spin"></div>
                      <p className="text-xs text-[#8AA399] font-medium">Loading fleet performance...</p>
                    </div>
                  </td>
                </tr>
              ) : trucks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-[#8AA399] font-medium">
                    No trucks registered to your fleet yet.
                  </td>
                </tr>
              ) : (
                trucks.map((t) => (
                  <tr key={t._id} className="hover:bg-[#173022]/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-200">
                      {t.registrationNumber}
                      {!t.isVerified && (
                        <span className="ml-2 text-[10px] font-bold text-amber-500 uppercase">Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{t.type?.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{t.trips}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{currency(t.revenue)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-[#173022]">
                          <div
                            className="h-full rounded-full bg-[#00E676]"
                            style={{ width: `${t.utilization}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#8AA399]">{t.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Tracking Table */}
      <div className="rounded-xl border border-[#173022] bg-[#0a1811] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#173022] flex justify-between items-center bg-[#0a1811]">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-100">Order Status Tracking</h3>
            <p className="mt-0.5 text-xs text-[#8AA399]">Live updates on recent client orders and dispatch statuses.</p>
          </div>
          {error && (
            <button
              onClick={fetchOverviewOrders}
              className="rounded-md bg-[#173022] px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-[#173022]/70"
            >
              Retry Connection
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#0a1811] border-b border-[#173022] font-mono-ls text-[11px] uppercase tracking-wider text-[#8AA399]">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#173022]">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00E676]/20 border-t-[#00E676]" />
                      <p className="text-xs font-medium text-[#8AA399]">Loading recent activity…</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="bg-red-500/5 px-6 py-10 text-center text-xs font-semibold text-red-400">
                    ⚠️ {error}
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm font-medium text-[#8AA399]">
                    No orders received yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const orderId = order._id || order.id || 'N/A';
                  const clientName = order.client?.name || order.client || 'Unknown Client';
                  const routeInfo = order.route || `${order.pickup || 'Origin'} to ${order.dropoff || 'Destination'}`;
                  const currentStatus = order.status || 'Pending';

                  return (
                    <tr key={orderId} className="hover:bg-[#173022]/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-200">
                        {orderId.length > 8 ? `${orderId.substring(0, 8).toUpperCase()}...` : orderId.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{clientName}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{routeInfo}</td>
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