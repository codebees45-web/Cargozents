import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import TrackingMap from '../components/common/TrackingMap';
import { fakeTracking } from '../data/fakeMapData';
import { getMyShipments, getAssignedShipments, getAgencyShipments, getShipmentTracking } from '../services/shipmentService';

const POLL_INTERVAL_MS = 15000;

// Updated to dark-theme friendly colors
const STATUS_STYLES = {
  requested: 'border-[#173022] bg-[#050c08] text-gray-300',
  assigned: 'border-amber-500/30 bg-amber-900/20 text-amber-400',
  accepted: 'border-blue-500/30 bg-blue-900/20 text-blue-400',
  rejected: 'border-red-500/30 bg-red-900/20 text-red-400',
  picked_up: 'border-indigo-500/30 bg-indigo-900/20 text-indigo-400',
  in_transit: 'border-[#00E676]/30 bg-[#00E676]/10 text-[#00E676]',
  delivered: 'border-emerald-500/30 bg-emerald-900/20 text-emerald-400',
  cancelled: 'border-red-500/30 bg-red-900/20 text-red-400',
};

const ACTIVE_STATUSES = ['assigned', 'accepted', 'picked_up', 'in_transit'];

const formatStatus = (status) => (status || '').replace(/_/g, ' ');

const TruckTracking = () => {
  const { user } = useAuth();

  const [shipments, setShipments] = useState(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [loadingTracking, setLoadingTracking] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchShipments =
      user?.role === 'driver' ? getAssignedShipments :
      user?.role === 'agency' ? getAgencyShipments :
      getMyShipments;

    fetchShipments()
      .then(({ data }) => {
        if (cancelled) return;
        const list = data.shipments || [];
        setShipments(list);
        const firstActive = list.find((s) => ACTIVE_STATUSES.includes(s.status)) || list[0];
        if (firstActive) setSelectedId(firstActive._id);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load shipments right now.');
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const fetchTracking = useCallback((id) => {
    if (!id) return;
    getShipmentTracking(id)
      .then(({ data }) => {
        setTracking(data.tracking);
        setTrackingError('');
      })
      .catch(() => {
        setTrackingError('Could not load live tracking for this shipment.');
      })
      .finally(() => setLoadingTracking(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setTracking(null);
      return undefined;
    }

    setLoadingTracking(true);
    fetchTracking(selectedId);

    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchTracking(selectedId), POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
  }, [selectedId, fetchTracking]);

  return (
    <div className="p-6 w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Live Truck Tracking</h1>
        {tracking && (
          <span className="text-xs text-[#00E676]">Auto-refreshes every {POLL_INTERVAL_MS / 1000}s</span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* LEFT SIDEBAR: Shipment List */}
        <div className="w-full md:w-1/3 bg-[#0a1811] p-6 rounded-xl shadow-sm border border-[#173022]">
          <h2 className="font-semibold text-white mb-4">
            {user?.role === 'driver' ? 'Your Trips' : 'Your Shipments'}
          </h2>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {shipments === null && !error && (
            <p className="text-sm text-gray-400 animate-pulse">Loading shipments…</p>
          )}

          {shipments?.length === 0 && (
            <p className="text-sm text-gray-400">No shipments to track yet.</p>
          )}

          <div className="space-y-3">
            {shipments?.map((s) => {
              const isSelected = s._id === selectedId;
              const statusStyle = STATUS_STYLES[s.status] || STATUS_STYLES.requested;
              return (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => setSelectedId(s._id)}
                  className={`w-full text-left border rounded-lg p-4 transition-all duration-200 ${statusStyle} hover:brightness-110 ${
                    isSelected ? 'ring-2 ring-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)]' : ''
                  }`}
                >
                  <h4 className="font-bold text-sm text-slate-100">
                    {s.assignedVehicle?.registrationNumber || `Shipment #${s._id.slice(-6).toUpperCase()}`}
                  </h4>
                  <p className="text-xs mt-1 capitalize opacity-80">Status: {formatStatus(s.status)}</p>
                  <p className="text-xs mt-2 opacity-80 font-medium">
                    {s.pickup?.city} → {s.drop?.city}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT AREA: Map and Details */}
        <div className="w-full md:w-2/3">
          {trackingError && (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-400">
              {trackingError}
            </div>
          )}

          {loadingTracking && !tracking && (
            <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-[#173022] bg-[#050c08]">
              <p className="text-gray-500 animate-pulse">Loading map…</p>
            </div>
          )}

          {/* FIXED: The white placeholder area is now dark and dashed */}
          {!selectedId && !loadingTracking && (
            <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-[#173022] bg-[#0a1811]/50">
              <p className="text-gray-400 font-medium">Select a shipment to view its live location.</p>
            </div>
          )}

          {selectedId && (
            <>
              {!tracking && (
                <div className="mb-3 rounded-lg border border-yellow-600/30 bg-yellow-900/20 p-3 text-sm text-yellow-400">
                  Demo tracking data is displayed until live shipment location is available.
                </div>
              )}

              <div className="rounded-xl overflow-hidden border border-[#173022] shadow-lg">
                <TrackingMap tracking={tracking || fakeTracking} />
              </div>

              {/* Stat Cards - Converted to Dark Mode */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-[#173022] bg-[#0a1811] p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Status</p>
                  <p className="text-sm font-semibold capitalize text-slate-200 mt-1">
                    {tracking ? formatStatus(tracking.status) : formatStatus(fakeTracking.status)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#173022] bg-[#0a1811] p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Driver</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1">
                    {tracking?.driver?.name || fakeTracking.driver.name || 'Not yet assigned'}
                  </p>
                </div>
                <div className="rounded-xl border border-[#173022] bg-[#0a1811] p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Vehicle</p>
                  <p className="text-sm font-semibold text-[#00E676] mt-1 font-mono">
                    {tracking?.vehicle ? `${tracking.vehicle.registrationNumber} (${tracking.vehicle.type})` : `${fakeTracking.vehicle.registrationNumber} (${fakeTracking.vehicle.type})`}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TruckTracking;