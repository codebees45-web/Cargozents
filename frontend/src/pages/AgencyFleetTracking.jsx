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

// Captures a click anywhere on the map as the pin the agency wants to set.
const ClickToPlace = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

/**
 * Manual GPS fallback for agency-managed drivers who have no smartphone
 * and therefore can never run the browser-geolocation flow themselves
 * (see frontend/hooks/useLiveLocationSharing.js — that requires the
 * driver's own device). Instead, agency office staff — who'd normally be
 * on the phone with that driver anyway — click the truck's approximate
 * current position on a map and save it. It's written to the backend
 * with locationSource: 'manual' (backend/src/models/Vehicle.js) so every
 * tracking view shows "Updated by agency" rather than pretending it's
 * live GPS.
 */
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
      // Backend/GeoJSON expects [lng, lat]; Leaflet gives us [lat, lng].
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
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Fleet Locations</h1>
        <span className="text-xs text-gray-400">For drivers without a smartphone, set their position by hand.</span>
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}
      {vehicles === null && !error && <p className="text-sm text-gray-400">Loading fleet…</p>}
      {vehicles?.length === 0 && <p className="text-sm text-gray-400">No vehicles registered in your fleet yet.</p>}

      <div className="grid gap-3">
        {vehicles?.map((v) => {
          const freshness = formatLocationFreshness(v);
          return (
            <div key={v._id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <div>
                <p className="font-semibold text-gray-800">{v.registrationNumber} · <span className="capitalize">{v.type}</span></p>
                <p className="text-xs text-gray-500">{v.driver?.name} · {v.driver?.phone}</p>
                <p className={`mt-1 text-xs ${freshness.tone}`}>{freshness.text}</p>
              </div>
              <button
                type="button"
                onClick={() => openPicker(v)}
                className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:border-primary/40"
              >
                Set location
              </button>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                Set location for {selected.registrationNumber}
              </h2>
              <button type="button" onClick={() => setSelectedId(null)} className="text-sm text-gray-400 hover:text-gray-700">
                Close
              </button>
            </div>
            <p className="mb-3 text-xs text-gray-500">Click on the map where the vehicle currently is, then save.</p>

            <MapContainer center={pickedLatLng || INDIA_CENTER} zoom={pickedLatLng ? 12 : 5} className="h-[400px] w-full rounded-lg">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickToPlace onPick={setPickedLatLng} />
              {pickedLatLng && <Marker position={pickedLatLng} />}
            </MapContainer>

            {saveError && <p className="mt-2 text-xs text-danger">{saveError}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!pickedLatLng || saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyFleetTracking;