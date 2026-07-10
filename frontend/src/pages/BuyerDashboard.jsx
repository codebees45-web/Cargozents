import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import ReviewModal from '../components/common/ReviewModal';
import api from '../services/api';
import { reviewOrderShipper } from '../services/reviewService';

const BuyerDashboard = () => {
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null); // order being rated, or null

  const markReviewed = (orderId) => {
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, hasReview: true } : o)));
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders/mine'),
        ]);
        if (!cancelled) {
          setProducts(productsRes.data.products || []);
          setOrders(ordersRes.data.orders || []);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setOrders([]);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const activeOrder = orders?.find((o) => !['delivered', 'cancelled'].includes(o.status));

  return (
    <DashboardLayout title="Browse" subtitle="Order from shippers near you.">
      {activeOrder && (
        <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
          <p className="font-mono-ls text-[11px] text-primary">ACTIVE ORDER</p>
          <p className="mt-1 text-sm text-primary">
            ₹{activeOrder.productTotal} · {activeOrder.status?.replace(/_/g, ' ')}
          </p>
        </div>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold text-primary">Products near you</h2>
        <div className="mt-4">
          {products === null ? (
            <TruckLoader fullScreen={false} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products listed yet"
              body="As shippers add their catalogs, their products will appear here for you to order and have delivered."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div key={p._id} className="rounded-xl border border-primary/10 bg-secondary/20 p-4">
                  <p className="font-display text-sm font-semibold text-primary">{p.name}</p>
                  <p className="mt-1 font-mono-ls text-xs text-[#5B7A70]">
                    ₹{p.price} / {p.unit}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-primary">Order history</h2>
        <div className="mt-4">
          {orders === null ? (
            <TruckLoader fullScreen={false} />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" body="Your past and current orders will show up here once you place one." />
          ) : (
            <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
              {orders.map((o) => (
                <li key={o._id} className="flex items-center justify-between px-4 py-3">
                  <span className="font-mono-ls text-xs text-[#5B7A70]">₹{o.productTotal}</span>
                  <span className="font-mono-ls text-xs text-primary">{o.status?.toUpperCase()}</span>
                  {o.status === 'delivered' && (
                    o.hasReview ? (
                      <span className="font-mono-ls text-[11px] text-success">RATED</span>
                    ) : (
                      <button
                        onClick={() => setReviewTarget(o)}
                        className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40"
                      >
                        Rate shipper
                      </button>
                    )
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {reviewTarget && (
        <ReviewModal
          title="Rate this shipper"
          subtitle={`For your ₹${reviewTarget.productTotal} order`}
          onSubmit={async (rating, comment) => {
            await reviewOrderShipper(reviewTarget._id, rating, comment);
            markReviewed(reviewTarget._id);
          }}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default BuyerDashboard;