import { useEffect, useState } from 'react';
import api from '../services/api';

const AgencyOverview = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverviewOrders();
  }, []);

  const fetchOverviewOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Uses the shared `api` axios instance, which already attaches the
      // JWT correctly and handles 401s app-wide — no manual token/quote
      // handling needed here.
      const { data } = await api.get('/orders/received');
      setRecentOrders(data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not load orders right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
      case 'placed':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'confirmed':
      case 'confirmed_by_shipper':
      case 'on going':
      case 'ongoing':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'delivered':
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-danger/10 text-danger border-danger/20';
      default:
        return 'bg-secondary text-muted border-primary/10';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary">Agency Overview</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-muted">Total Orders</p>
          <p className="text-3xl font-bold text-primary">{isLoading || error ? '…' : recentOrders.length}</p>
        </div>
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-muted">Active Trucks</p>
          <p className="text-3xl font-bold text-primary">—</p>
          <p className="mt-1 text-[10px] text-muted">See Manage Fleet for live counts</p>
        </div>
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-muted">Revenue (Monthly)</p>
          <p className="text-3xl font-bold text-primary">—</p>
          <p className="mt-1 text-[10px] text-muted">Not yet tracked on the backend</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-primary/10 bg-secondary/10 shadow-sm">
        <div className="flex items-center justify-between border-b border-primary/10 px-6 py-5">
          <div>
            <h3 className="font-display text-lg font-bold text-primary">Order Status Tracking</h3>
            <p className="mt-0.5 text-xs text-muted">Live updates on recent client orders and dispatch statuses.</p>
          </div>
          {error && (
            <button
              onClick={fetchOverviewOrders}
              className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-secondary/70"
            >
              Retry Connection
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-primary/10 bg-secondary/20 font-mono-ls text-[11px] uppercase tracking-wider text-muted">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                      <p className="text-xs font-medium text-muted">Loading recent activity…</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="bg-danger/5 px-6 py-10 text-center text-xs font-semibold text-danger">
                    ⚠️ {error}
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm font-medium text-muted">
                    No orders received yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{order.buyer?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted">₹{order.productTotal}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 font-mono-ls text-[11px] font-bold ${getStatusStyle(order.status)}`}>
                        {(order.status || 'pending').replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgencyOverview;