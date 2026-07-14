import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import ReviewModal from '../components/common/ReviewModal';
import api from '../services/api';
import { reviewOrderShipper } from '../services/reviewService';
import { useCart } from '../context/CartContext';

const POLL_INTERVAL_MS = 15000;
const ACTIVE_STATUSES = ['placed', 'confirmed_by_shipper', 'awaiting_shipment', 'shipment_requested', 'out_for_delivery'];

const STATUS_STYLES = {
  placed: 'bg-secondary text-primary/70',
  confirmed_by_shipper: 'bg-primary/10 text-primary',
  awaiting_shipment: 'bg-primary/10 text-primary',
  shipment_requested: 'bg-warning/10 text-warning',
  out_for_delivery: 'bg-warning/10 text-warning',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const BuyerDashboard = () => {
  const [orders, setOrders] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null); // order being rated, or null
  const [reorderNote, setReorderNote] = useState('');
  const { cart, restoreOrder } = useCart();
  const navigate = useNavigate();
  const pollRef = useRef(null);

  const markReviewed = (orderId) => {
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, hasReview: true } : o)));
  };

  const fetchOrders = () => {
    api
      .get('/orders/mine')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => setOrders((prev) => prev ?? []));
  };

  useEffect(() => {
    fetchOrders();
    // Poll while any order is still moving through its lifecycle, same as
    // Swiggy's live order-status refresh — stop once nothing is active to
    // avoid needless requests.
    pollRef.current = setInterval(() => {
      setOrders((prev) => {
        if (prev?.some((o) => ACTIVE_STATUSES.includes(o.status))) fetchOrders();
        return prev;
      });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleReorder = (order) => {
    if (cart.items.length > 0 && cart.shipperId !== (order.shipper?._id || order.shipper)) {
      const confirmed = window.confirm('This will replace the items currently in your cart. Continue?');
      if (!confirmed) return;
    }
    const result = restoreOrder(order);
    if (result === 'unavailable') {
      setReorderNote('None of the items from that order are available right now.');
      return;
    }
    navigate('/buyer/checkout');
  };

  const activeOrder = orders?.find((o) => !['delivered', 'cancelled'].includes(o.status));

  return (
    <DashboardLayout title="My orders" subtitle="Your past and current orders.">
      {activeOrder && (
        <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
          <p className="font-mono-ls text-[11px] text-primary">ACTIVE ORDER</p>
          <p className="mt-1 text-sm text-primary">
            ₹{activeOrder.productTotal} · {activeOrder.status?.replace(/_/g, ' ')}
          </p>
        </div>
      )}

      {reorderNote && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5 text-sm text-warning">
          {reorderNote}
        </div>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold text-primary">Order history</h2>
        <div className="mt-4">
          {orders === null ? (
            <TruckLoader fullScreen={false} />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" body="Your past and current orders will show up here once you place one." />
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => {
                const firstItem = o.items?.[0];
                const thumb = firstItem?.product?.images?.[0];
                const extraCount = (o.items?.length || 1) - 1;
                return (
                  <li key={o._id} className="rounded-xl border border-primary/10 bg-secondary/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary/40">
                        {thumb ? (
                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/20">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-semibold text-primary">
                              {firstItem?.product?.name || 'Order'}
                              {extraCount > 0 && <span className="text-muted"> +{extraCount} more</span>}
                            </p>
                            <p className="mt-0.5 font-mono-ls text-[10px] text-muted">
                              #{o._id.slice(-6).toUpperCase()} · {formatDate(o.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 font-mono-ls text-[9px] tracking-wide ${
                              STATUS_STYLES[o.status] || 'bg-secondary text-primary/70'
                            }`}
                          >
                            {o.status?.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="font-display text-sm font-bold text-primary">₹{o.productTotal}</p>
                          <div className="flex gap-2">
                            {!['delivered', 'cancelled', 'placed', 'confirmed_by_shipper'].includes(o.status) && (
                              <Link
                                to={`/buyer/orders/${o._id}/track`}
                                className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40"
                              >
                                Track
                              </Link>
                            )}
                            {o.status === 'delivered' &&
                              (o.hasReview ? (
                                <span className="self-center font-mono-ls text-[11px] text-success">RATED</span>
                              ) : (
                                <button
                                  onClick={() => setReviewTarget(o)}
                                  className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40"
                                >
                                  Rate shipper
                                </button>
                              ))}
                            {['delivered', 'cancelled'].includes(o.status) && (
                              <button
                                onClick={() => handleReorder(o)}
                                className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-primary transition hover:shadow-glow"
                              >
                                Reorder
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
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