import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatField = ({ label, value }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
    <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
  </div>
);

const ShipperDashboard = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState(null);
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [shipmentsRes, ordersRes] = await Promise.all([
          api.get('/shipments/mine'),
          api.get('/orders/received'),
        ]);
        if (!cancelled) {
          setShipments(shipmentsRes.data.shipments || []);
          setOrders(ordersRes.data.orders || []);
        }
      } catch (err) {
        if (!cancelled) setError('Could not load your dashboard data. These endpoints are next in line to build.');
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const pendingRequests = shipments?.filter((s) => s.status === 'requested').length ?? 0;
  const inTransit = shipments?.filter((s) => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(s.status)).length ?? 0;
  const awaitingShipment = orders?.filter((o) => o.status === 'awaiting_shipment').length ?? 0;

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`}
      subtitle={
        user?.shipperMode === 'catalog'
          ? 'Selling from your product catalog.'
          : user?.shipperMode === 'raw_shipment'
          ? 'Posting shipments directly.'
          : 'Selling products and posting shipments.'
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatField label="PENDING REQUESTS" value={shipments === null ? '—' : pendingRequests} />
        <StatField label="IN TRANSIT" value={shipments === null ? '—' : inTransit} />
        <StatField label="AWAITING SHIPMENT" value={orders === null ? '—' : awaitingShipment} />
        <StatField label="TOTAL ORDERS" value={orders === null ? '—' : orders.length} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Recent shipments</h2>
            <a href="/shipper/shipments/new" className="text-xs text-primary hover:underline">
              + Post a shipment
            </a>
          </div>
          <div className="mt-4">
            {shipments === null ? (
              <TruckLoader fullScreen={false} />
            ) : shipments.length === 0 ? (
              <EmptyState
                title="No shipments yet"
                body="Post a shipment when you need a truck — for a raw load or once an order is ready to go out."
                actionLabel="Post a shipment"
                onAction={() => (window.location.href = '/shipper/shipments/new')}
              />
            ) : (
              <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
                {shipments.map((s) => (
                  <li key={s._id} className="flex items-center justify-between px-4 py-3">
                    <span className="font-mono-ls text-xs text-[#5B7A70]">
                      {s.pickup?.city} → {s.drop?.city}
                    </span>
                    <span className="font-mono-ls text-xs text-primary">{s.status?.toUpperCase()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Orders received</h2>
            <a href="/shipper/orders" className="text-xs text-primary hover:underline">
              View all
            </a>
          </div>
          <div className="mt-4">
            {orders === null ? (
              <TruckLoader fullScreen={false} />
            ) : orders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                body="Once your products go live, buyer orders will show up here for you to confirm and ship."
                actionLabel="Manage products"
                onAction={() => (window.location.href = '/shipper/products')}
              />
            ) : (
              <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
                {orders.map((o) => (
                  <li key={o._id} className="flex items-center justify-between px-4 py-3">
                    <span className="font-mono-ls text-xs text-[#5B7A70]">₹{o.productTotal}</span>
                    <span className="font-mono-ls text-xs text-primary">{o.status?.toUpperCase()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {error && <p className="mt-8 text-xs text-warning">{error}</p>}
    </DashboardLayout>
  );
};

export default ShipperDashboard;
