import { useEffect, useState } from 'react';
import api from '../services/api'; 
import { getAgencyTrucks } from '../services/agencyService'; 

const AgencyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [isLoadingTrucks, setIsLoadingTrucks] = useState(false);
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    setError(null);
    try {
      const { data } = await api.get('/orders/received');
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not load orders right now.');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleAccept = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setAssignError('');
    fetchAvailableTrucks();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setAvailableTrucks([]);
    setAssignError('');
  };

  const fetchAvailableTrucks = async () => {
    setIsLoadingTrucks(true);
    try {
      const { data } = await getAgencyTrucks();
      setAvailableTrucks((data.trucks || []).filter((t) => t.isActive));
    } catch (err) {
      setAssignError('Could not load your fleet right now.');
    } finally {
      setIsLoadingTrucks(false);
    }
  };

  const handleAssign = (truck) => {
    setAssignError(
      `Assigning "${truck.registrationNumber}" isn't wired to the backend yet — no endpoint exists to save this assignment.`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-100 tracking-tight">Orders Received</h2>
          <p className="mt-1 text-xs text-[#8AA399]">Review and confirm client shipment requests.</p>
        </div>
        {error && (
          <button
            onClick={fetchOrders}
            className="rounded-md bg-secondary/40 border border-primary/20 px-3 py-1.5 text-xs font-bold text-[#00E676] transition-all hover:bg-secondary/70"
          >
            Retry Connection
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-primary/10 bg-secondary/10 shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-primary/10 bg-secondary/20 font-mono-ls text-[11px] uppercase tracking-wider text-muted">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Buyer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {isLoadingOrders ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                    <p className="text-xs font-medium text-muted">Loading incoming orders…</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="bg-danger/5 px-6 py-10 text-center text-xs font-semibold text-danger">
                  ⚠️ {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <h3 className="mb-2 font-display text-lg font-bold text-slate-200">No orders yet</h3>
                  <p className="mx-auto max-w-md text-xs font-medium text-muted">
                    Waiting for shippers to place backhaul requests. When a new order comes in, it will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="transition-colors hover:bg-secondary/20">
                  <td className="px-6 py-4 text-sm font-semibold text-[#00E676] font-mono">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{order.buyer?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-medium">₹{order.productTotal}</td>
                  <td className="px-6 py-4 text-sm text-muted capitalize">{(order.status || '').replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleAccept(order)}
                      className="rounded-md bg-accent px-4 py-2 text-xs font-bold text-primary shadow-sm transition-all hover:shadow-glow"
                    >
                      Assign truck
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-primary/10 bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-primary/10 bg-secondary/20 px-6 py-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-100">Assign Truck</h3>
                <p className="mt-0.5 text-xs text-[#8AA399]">Assigning a truck for this shipment request.</p>
              </div>
              <button onClick={closeModal} className="text-muted transition-colors hover:text-slate-200 text-sm">
                ✕ Close
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <h4 className="mb-4 font-mono-ls text-[11px] font-black uppercase tracking-wider text-muted">
                Available Fleet
              </h4>

              {assignError && (
                <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning leading-relaxed font-medium">
                  ⚠️ {assignError}
                </div>
              )}

              {isLoadingTrucks ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-10">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                  <p className="text-xs font-medium text-muted">Loading your fleet…</p>
                </div>
              ) : availableTrucks.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted">
                  No active trucks in your fleet. Add one from Manage Fleet.
                </div>
              ) : (
                <div className="space-y-3">
                  {availableTrucks.map((truck) => (
                    <div
                      key={truck._id}
                      className="flex items-center justify-between rounded-lg border border-primary/10 p-4 transition-all hover:border-primary/30 hover:bg-secondary/20"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-200">{truck.registrationNumber}</p>
                        <p className="mt-1 text-xs text-muted">
                          {truck.type} • <span className="font-semibold text-[#00E676]">{truck.capacityWeight} Tons</span>
                        </p>
                      </div>
                      <button
                        className="rounded-md bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 shadow-sm"
                        onClick={() => handleAssign(truck)}
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