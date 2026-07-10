import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import MatchesPanel from '../components/common/MatchesPanel';
import api from '../services/api';

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
  { value: 'requested', label: 'Awaiting assignment' },
  { value: 'active', label: 'Active' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'all', label: 'All' },
];

const isActiveStatus = (status) => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(status);

const AdminShipments = () => {
  const [shipments, setShipments] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('requested');
  const [expandedId, setExpandedId] = useState(null);

  const loadShipments = () => {
    setShipments(null);
    api
      .get('/admin/shipments')
      .then(({ data }) => setShipments(data.shipments || []))
      .catch(() => setError('Could not load shipments right now.'));
  };

  useEffect(loadShipments, []);

  const filtered = useMemo(() => {
    if (!shipments) return [];
    if (filter === 'all') return shipments;
    if (filter === 'active') return shipments.filter((s) => isActiveStatus(s.status));
    return shipments.filter((s) => s.status === filter);
  }, [shipments, filter]);

  const handleAssigned = (updatedShipment) => {
    setShipments((prev) => prev.map((s) => (s._id === updatedShipment._id ? { ...s, ...updatedShipment } : s)));
    setExpandedId(null);
  };

  return (
    <DashboardLayout title="Shipment requests" subtitle="Match posted shipments to a nearby verified truck.">
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-4 py-1.5 font-mono-ls text-[11px] tracking-wide transition ${
              filter === f.value ? 'border-primary bg-primary text-white' : 'border-primary/15 text-[#5B7A70] hover:border-primary/40'
            }`}
          >
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {shipments === null ? (
          <TruckLoader fullScreen={false} />
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nothing here" body="Shipments matching this filter will show up here." />
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => (
              <div key={s._id} className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {s.pickup?.city} → {s.drop?.city}
                    </p>
                    <p className="mt-1 text-xs text-[#5B7A70]">
                      {s.goodsType} · {s.weight}kg · {s.vehicleRequired?.replace('_', ' ')} · Shipper: {s.shipper?.name}
                      {s.assignedDriver?.name && ` · Driver: ${s.assignedDriver.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono-ls text-xs ${STATUS_STYLES[s.status] || 'text-[#5B7A70]'}`}>
                      {s.status?.replace('_', ' ').toUpperCase()}
                    </span>
                    {s.status === 'requested' && (
                      <button
                        onClick={() => setExpandedId(expandedId === s._id ? null : s._id)}
                        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-primary transition hover:shadow-glow"
                      >
                        {expandedId === s._id ? 'Hide matches' : 'Find matches'}
                      </button>
                    )}
                  </div>
                </div>

                {expandedId === s._id && <MatchesPanel shipmentId={s._id} onAssigned={handleAssigned} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminShipments;
