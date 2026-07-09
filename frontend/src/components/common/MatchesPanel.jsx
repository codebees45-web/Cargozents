import { useEffect, useState } from 'react';
import api from '../../services/api';

/**
 * Shown inline under a pending shipment row. Fetches ranked candidate
 * driver/vehicle matches from the matching engine and lets the admin
 * assign one with a single click.
 */
const MatchesPanel = ({ shipmentId, onAssigned }) => {
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState('');
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/shipments/${shipmentId}/matches`)
      .then(({ data }) => !cancelled && setMatches(data.matches || []))
      .catch((err) => !cancelled && setError(err.response?.data?.message || 'Could not load matches for this shipment.'));
    return () => {
      cancelled = true;
    };
  }, [shipmentId]);

  const assign = async (vehicleId) => {
    setAssigningId(vehicleId);
    setError('');
    try {
      const { data } = await api.patch(`/shipments/${shipmentId}/assign`, { vehicleId });
      onAssigned(data.shipment);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not assign this vehicle.');
      setAssigningId(null);
    }
  };

  if (error) return <p className="mt-3 text-xs text-danger">{error}</p>;

  if (matches === null) {
    return <p className="mt-3 text-xs text-[#5B7A70]">Finding nearby trucks…</p>;
  }

  if (matches.length === 0) {
    return (
      <p className="mt-3 text-xs text-[#5B7A70]">
        No verified, available vehicles match this shipment's type and capacity within range right now.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {matches.map((m) => (
        <div
          key={m.vehicleId}
          className="flex items-center justify-between rounded-lg border border-primary/10 bg-background px-4 py-3"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-ls text-xs text-primary">{m.registrationNumber}</span>
              {m.isBackhaulMatch && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 font-mono-ls text-[10px] text-success">
                  BACKHAUL
                </span>
              )}
              <span className="font-mono-ls text-[10px] text-[#5B7A70]">SCORE {m.priorityScore}</span>
            </div>
            <p className="mt-1 text-xs text-[#5B7A70]">
              {m.driver.name} · {m.driver.phone} · {m.distanceToPickupKm} km away · ETA {m.etaMinutes} min
              {m.driver.rating ? ` · ★ ${m.driver.rating}` : ''}
            </p>
            <p className="mt-1 font-mono-ls text-[10px] text-[#5B7A70]">
              proximity {m.scoreBreakdown.proximity} · backhaul {m.scoreBreakdown.backhaul} · route overlap{' '}
              {m.scoreBreakdown.routeOverlap} · rating {m.scoreBreakdown.rating} · capacity fit {m.scoreBreakdown.capacityFit}
            </p>
          </div>
          <button
            disabled={assigningId === m.vehicleId}
            onClick={() => assign(m.vehicleId)}
            className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
          >
            {assigningId === m.vehicleId ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default MatchesPanel;
