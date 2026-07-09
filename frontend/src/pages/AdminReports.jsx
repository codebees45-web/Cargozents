import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DashboardLayout from '../components/common/DashboardLayout';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatField = ({ label, value }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
    <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
  </div>
);

const STATUS_LABELS = {
  requested: 'Requested',
  assigned: 'Assigned',
  accepted: 'Accepted',
  rejected: 'Rejected',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  requested: '#94A3B8',
  assigned: '#60A5FA',
  accepted: '#38BDF8',
  rejected: '#F87171',
  picked_up: '#FBBF24',
  in_transit: '#FB923C',
  delivered: '#34D399',
  cancelled: '#94A3B8',
};

const AdminReports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/admin/analytics/overview')
      .then((res) => !cancelled && setAnalytics(res.data.analytics))
      .catch(() => !cancelled && setError('Could not load analytics.'));
    return () => {
      cancelled = true;
    };
  }, []);

  const statusEntries = analytics ? Object.entries(analytics.statusBreakdown) : [];

  const chartData = {
    labels: statusEntries.map(([status]) => STATUS_LABELS[status] || status),
    datasets: [
      {
        data: statusEntries.map(([, count]) => count),
        backgroundColor: statusEntries.map(([status]) => STATUS_COLORS[status] || '#94A3B8'),
        borderWidth: 0,
      },
    ],
  };

  return (
    <DashboardLayout title="Reports" subtitle="Network performance, computed live from the database.">
      {error && <p className="mb-6 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatField
          label="TODAY'S REVENUE"
          value={analytics === null ? '—' : `₹${analytics.todaysRevenue.toLocaleString('en-IN')}`}
        />
        <StatField
          label="TOTAL REVENUE"
          value={analytics === null ? '—' : `₹${analytics.totalRevenue.toLocaleString('en-IN')}`}
        />
        <StatField label="ACTIVE SHIPMENTS" value={analytics === null ? '—' : analytics.activeShipments} />
        <StatField label="PENDING VERIFICATIONS" value={analytics === null ? '—' : analytics.pendingVerifications} />
        <StatField
          label="BACKHAUL MATCH RATE"
          value={analytics === null ? '—' : `${analytics.backhaulMatchRate}%`}
        />
        <StatField label="TOTAL DELIVERED" value={analytics === null ? '—' : analytics.totalDelivered} />
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-primary">Shipment status breakdown</h2>
          <div className="mt-4 rounded-xl border border-primary/10 bg-secondary/10 p-6">
            {analytics === null ? (
              <p className="text-sm text-[#5B7A70]">Loading…</p>
            ) : statusEntries.length === 0 ? (
              <p className="text-sm text-[#5B7A70]">No shipments yet.</p>
            ) : (
              <div className="mx-auto max-w-xs">
                <Doughnut
                  data={chartData}
                  options={{
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-primary">Backhaul matching</h2>
          <div className="mt-4 rounded-xl border border-primary/10 bg-secondary/10 p-6">
            {analytics === null ? (
              <p className="text-sm text-[#5B7A70]">Loading…</p>
            ) : (
              <>
                <p className="text-sm text-primary">
                  {analytics.backhaulMatchesDelivered} of {analytics.totalDelivered} delivered shipments filled an
                  empty return leg.
                </p>
                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary/40">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: `${analytics.backhaulMatchRate}%` }}
                  />
                </div>
                <p className="mt-2 font-mono-ls text-[11px] text-[#5B7A70]">
                  {analytics.backhaulMatchRate}% BACKHAUL MATCH RATE
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default AdminReports;