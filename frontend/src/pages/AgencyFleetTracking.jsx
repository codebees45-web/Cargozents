import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getFleetVehicles, setVehicleLocation } from '../services/agencyService';
import { formatLocationFreshness } from '../utils/locationFreshness';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const INDIA_CENTER = [20.5937, 78.9629];
const isRealPoint = (c) => Array.isArray(c) && c.length === 2 && !(c[0] === 0 && c[1] === 0);
const toLatLng = (c) => (isRealPoint(c) ? [c[1], c[0]] : null);

const ClickToPlace = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const AgencyFleetTracking = () => {
  const [vehicles, setVehicles] = useState(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [pickedLatLng, setPickedLatLng] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = () => {
    getFleetVehicles()
      .then(({ data }) => setVehicles(data.vehicles || []))
      .catch(() => setError('Could not load your fleet right now.'));
  };

  useEffect(load, []);

  const selected = vehicles?.find((v) => v._id === selectedId);

  const openPicker = (vehicle) => {
    setSelectedId(vehicle._id);
    setPickedLatLng(toLatLng(vehicle.currentLocation?.coordinates) || null);
    setSaveError('');
  };

  const save = async () => {
    if (!selected || !pickedLatLng) return;
    setSaving(true);
    setSaveError('');
    try {
      const coordinates = [pickedLatLng[1], pickedLatLng[0]];
      await setVehicleLocation(selected._id, coordinates);
      setSelectedId(null);
      load();
    } catch {
      setSaveError('Could not save that location. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Fleet Locations</h1>
          <p className="text-xs text-[#8AA399] mt-1">For drivers without a smartphone, set their position by hand.</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-400 font-semibold">⚠️ {error}</p>}
      {vehicles === null && !error && <p className="text-sm text-gray-400 animate-pulse">Loading fleet…</p>}
      {vehicles?.length === 0 && <p className="text-sm text-gray-400">No vehicles registered in your fleet yet.</p>}

      <div className="grid gap-3">
        {vehicles?.map((v) => {
          const freshness = formatLocationFreshness(v);
          return (
            <div key={v._id} className="flex items-center justify-between rounded-xl border border-primary/10 bg-secondary/10 p-4 transition-all hover:border-primary/20">
              <div>
                <p className="font-bold text-slate-200">{v.registrationNumber} · <span className="capitalize text-[#00E676] text-xs font-mono">{v.type}</span></p>
                <p className="text-xs text-gray-400 mt-0.5">{v.driver?.name} · {v.driver?.phone}</p>
                <p className={`mt-1.5 text-[11px] font-medium ${freshness.tone}`}>{freshness.text}</p>
              </div>
              <button
                type="button"
                onClick={() => openPicker(v)}
                className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 text-xs font-bold text-[#00E676] hover:bg-primary/20 transition-all shadow-sm"
              >
                Set location
              </button>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-primary/10 bg-[#0C1412] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between border-b border-primary/10 pb-3">
              <h2 className="font-bold text-slate-100 text-lg">
                Set location for <span className="text-[#00E676]">{selected.registrationNumber}</span>
              </h2>
              <button type="button" onClick={() => setSelectedId(null)} className="text-sm text-gray-400 hover:text-slate-200 transition-colors">
                ✕ Close
              </button>
            </div>
            <p className="mb-4 text-xs text-[#8AA399]">Click on the map where the vehicle currently is, then click save.</p>

            <div className="overflow-hidden rounded-lg border border-[#173022] shadow-inner">
              <MapContainer center={pickedLatLng || INDIA_CENTER} zoom={pickedLatLng ? 12 : 5} className="h-[380px] w-full bg-[#050c08]">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickToPlace onPick={setPickedLatLng} />
                {pickedLatLng && <Marker position={pickedLatLng} />}
              </MapContainer>
            </div>

            {saveError && <p className="mt-3 text-xs text-red-400 font-semibold">⚠️ {saveError}</p>}

            <div className="mt-5 flex justify-end gap-3 border-t border-[#173022] pt-4">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg border border-[#173022] bg-[#0a1811] px-4 py-2 text-xs font-semibold text-gray-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!pickedLatLng || saving}
                className="rounded-lg bg-[#00E676] px-5 py-2 text-xs font-bold text-black shadow-glow transition-all disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save position'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyFleetTracking;