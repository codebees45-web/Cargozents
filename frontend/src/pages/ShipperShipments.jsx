import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import EmptyState from '../components/common/EmptyState';
import ReviewModal from '../components/common/ReviewModal';
import api from '../services/api';
import { reviewShipmentDriver } from '../services/reviewService';

const STATUS_STYLES = {
  requested: 'text-[#5B7A70]',
  assigned: 'text-warning',
  accepted: 'text-warning',
  picked_up: 'text-primary',
  in_transit: 'text-primary',
  delivered: 'text-success',
  rejected: 'text-danger',
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'requested', label: 'Requested' },
  { value: 'active', label: 'Active' },
  { value: 'delivered', label: 'Delivered' },
];

const isActiveStatus = (status) => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(status);

const ShipperShipments = () => {
  const [shipments, setShipments] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [reviewTarget, setReviewTarget] = useState(null); // shipment being rated, or null

  const markReviewed = (shipmentId) => {
    setShipments((prev) => prev.map((s) => (s._id === shipmentId ? { ...s, hasReview: true } : s)));
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get('/shipments/mine')
      .then(({ data }) => {
        if (!cancelled) setShipments(data.shipments || []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your shipments right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!shipments) return [];
    if (filter === 'all') return shipments;
    if (filter === 'active') return shipments.filter((s) => isActiveStatus(s.status));
    return shipments.filter((s) => s.status === filter);
  }, [shipments, filter]);

  return (
    <DashboardLayout title="Shipments" subtitle="Everything you've posted, from request to delivery.">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-1.5 font-mono-ls text-[11px] tracking-wide transition ${
                filter === f.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/15 text-[#5B7A70] hover:border-primary/40'
              }`}
            >
              {f.label.toUpperCase()}
            </button>
          ))}
        </div>
        <a href="/shipper/shipments/new" className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-primary transition hover:shadow-glow">
          + Post a shipment
        </a>
      </div>

      <div className="mt-6">
        {shipments === null ? (
          <p className="text-sm text-[#5B7A70]">Loading…</p>
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            body="Shipments matching this filter will show up here once you post one."
            actionLabel="Post a shipment"
            onAction={() => (window.location.href = '/shipper/shipments/new')}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-primary/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-secondary/20 font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">
                  <th className="px-4 py-3 font-medium">ROUTE</th>
                  <th className="px-4 py-3 font-medium">VEHICLE</th>
                  <th className="px-4 py-3 font-medium">DRIVER</th>
                  <th className="px-4 py-3 font-medium">PRICE</th>
                  <th className="px-4 py-3 font-medium">SCHEDULED</th>
                  <th className="px-4 py-3 font-medium">STATUS</th>
                  <th className="px-4 py-3 font-medium">RATING</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-secondary/10">
                    <td className="px-4 py-3 text-primary">
                      {s.pickup?.city} → {s.drop?.city}
                    </td>
                    <td className="px-4 py-3 text-[#5B7A70]">{s.vehicleRequired?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-[#5B7A70]">{s.assignedDriver?.name || '—'}</td>
                    <td className="px-4 py-3 text-[#5B7A70]">₹{s.finalPrice || s.estimatedPrice}</td>
                    <td className="px-4 py-3 text-[#5B7A70]">{s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString() : '—'}</td>
                    <td className={`px-4 py-3 font-mono-ls text-xs ${STATUS_STYLES[s.status] || 'text-[#5B7A70]'}`}>
                      {s.status?.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      {s.status !== 'delivered' ? (
                        <span className="text-xs text-[#5B7A70]">—</span>
                      ) : s.hasReview ? (
                        <span className="font-mono-ls text-[11px] text-success">RATED</span>
                      ) : (
                        <button
                          onClick={() => setReviewTarget(s)}
                          className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40"
                        >
                          Rate driver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          title={`Rate ${reviewTarget.assignedDriver?.name || 'your driver'}`}
          subtitle={`For the ${reviewTarget.pickup?.city} → ${reviewTarget.drop?.city} delivery`}
          onSubmit={async (rating, comment) => {
            await reviewShipmentDriver(reviewTarget._id, rating, comment);
            markReviewed(reviewTarget._id);
          }}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ShipperShipments;