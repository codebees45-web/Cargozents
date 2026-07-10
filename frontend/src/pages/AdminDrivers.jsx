import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import StarRating from '../components/common/StarRating';
import api from '../services/api';

const TABS = [
  { value: 'documents', label: 'Documents to review' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'drivers', label: 'Drivers' },
];

const DOC_LABEL = {
  driving_license: 'Driving License',
  selfie: 'Selfie',
  rc: 'RC',
  permit: 'Permit',
  insurance: 'Insurance',
  vehicle_photo: 'Vehicle Photo',
};

const DocumentRow = ({ doc, onReviewed }) => {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const review = async (status) => {
    if (status === 'rejected' && !rejecting) {
      setRejecting(true);
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.patch(`/admin/documents/${doc._id}/review`, {
        status,
        rejectionReason: status === 'rejected' ? reason : undefined,
      });
      onReviewed(data.document);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-primary/10 bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-primary">
            {DOC_LABEL[doc.type] || doc.type}
            {doc.vehicle?.registrationNumber && ` · ${doc.vehicle.registrationNumber}`}
          </p>
          <p className="mt-1 text-xs text-[#5B7A70]">
            {doc.owner?.name} · {doc.owner?.phone} ·{' '}
            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              View file
            </a>
            {doc.expiryDate && ` · Expires ${new Date(doc.expiryDate).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            disabled={busy}
            onClick={() => review('approved')}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => review('rejected')}
            className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs text-danger transition hover:bg-danger/10 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      </div>
      {rejecting && (
        <div className="mt-3 flex gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection…"
            className="flex-1 rounded-lg border border-primary/15 bg-secondary/40 px-3 py-1.5 text-xs text-primary outline-none focus:border-primary/60"
          />
          <button
            disabled={busy || !reason}
            onClick={() => review('rejected')}
            className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            Confirm reject
          </button>
        </div>
      )}
    </div>
  );
};

const AdminDrivers = () => {
  const [tab, setTab] = useState('documents');
  const [documents, setDocuments] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [drivers, setDrivers] = useState(null);
  const [error, setError] = useState('');

  const loadDocuments = () => api.get('/admin/documents?status=pending').then(({ data }) => setDocuments(data.documents || []));
  const loadVehicles = () => api.get('/admin/vehicles').then(({ data }) => setVehicles(data.vehicles || []));
  const loadDrivers = () => api.get('/admin/drivers').then(({ data }) => setDrivers(data.drivers || []));

  useEffect(() => {
    Promise.all([loadDocuments(), loadVehicles(), loadDrivers()]).catch(() => setError('Could not load verification data.'));
  }, []);

  const handleReviewed = (updatedDoc) => {
    setDocuments((prev) => prev.filter((d) => d._id !== updatedDoc._id));
    loadVehicles(); // a document approval may change a vehicle's overall standing
  };

  const setVehicleVerified = async (id, isVerified) => {
    const { data } = await api.patch(`/admin/vehicles/${id}/verify`, { isVerified });
    setVehicles((prev) => prev.map((v) => (v._id === id ? data.vehicle : v)));
  };

  const setDriverVerified = async (id, isApproved) => {
    const { data } = await api.patch(`/admin/drivers/${id}/verify`, { isApproved });
    setDrivers((prev) => prev.map((d) => (d._id === id ? data.driver : d)));
  };

  const setDriverSuspended = async (id, isSuspended) => {
    const { data } = await api.patch(`/admin/drivers/${id}/suspend`, { isSuspended });
    setDrivers((prev) => prev.map((d) => (d._id === id ? data.driver : d)));
  };

  return (
    <DashboardLayout title="Driver verification" subtitle="Review documents and approve drivers and vehicles for the network.">
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-full border px-4 py-1.5 font-mono-ls text-[11px] tracking-wide transition ${
              tab === t.value ? 'border-primary bg-primary text-white' : 'border-primary/15 text-[#5B7A70] hover:border-primary/40'
            }`}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-danger">{error}</p>}

      <div className="mt-6">
        {tab === 'documents' &&
          (documents === null ? (
            <TruckLoader fullScreen={false} />
          ) : documents.length === 0 ? (
            <EmptyState title="Nothing pending" body="New driver/vehicle document submissions will show up here for review." />
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <DocumentRow key={doc._id} doc={doc} onReviewed={handleReviewed} />
              ))}
            </div>
          ))}

        {tab === 'vehicles' &&
          (vehicles === null ? (
            <TruckLoader fullScreen={false} />
          ) : vehicles.length === 0 ? (
            <EmptyState title="No vehicles registered yet" body="Vehicles registered by drivers will appear here." />
          ) : (
            <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
              {vehicles.map((v) => (
                <li key={v._id} className="flex items-center justify-between px-4 py-3">
                  <span className="font-mono-ls text-xs text-primary">
                    {v.registrationNumber} · {v.type.replace('_', ' ')} · {v.driver?.name} · {v.driver?.phone}
                  </span>
                  <button
                    onClick={() => setVehicleVerified(v._id, !v.isVerified)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      v.isVerified ? 'border border-danger/40 text-danger hover:bg-danger/10' : 'bg-accent text-primary hover:shadow-glow'
                    }`}
                  >
                    {v.isVerified ? 'Revoke verification' : 'Verify vehicle'}
                  </button>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'drivers' &&
          (drivers === null ? (
            <TruckLoader fullScreen={false} />
          ) : drivers.length === 0 ? (
            <EmptyState title="No drivers yet" body="Registered drivers will appear here." />
          ) : (
            <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
              {drivers.map((d) => (
                <li key={d._id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-mono-ls text-xs text-primary">
                      {d.name} · {d.phone}
                      {d.isSuspended && <span className="ml-2 text-danger">SUSPENDED</span>}
                    </span>
                    <div className="mt-1">
                      <StarRating value={d.driverProfile?.rating || 0} size="text-xs" showValue />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDriverVerified(d._id, !d.isApproved)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        d.isApproved ? 'border border-primary/20 text-primary' : 'bg-accent text-primary hover:shadow-glow'
                      }`}
                    >
                      {d.isApproved ? 'Approved' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setDriverSuspended(d._id, !d.isSuspended)}
                      className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs text-danger transition hover:bg-danger/10"
                    >
                      {d.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminDrivers;