import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { fakeTracking } from '../../data/fakeMapData';

// Vite bundles the default Leaflet marker PNGs under a hashed path that the
// library's own CSS doesn't know about, so the default icon shows up broken
// unless we explicitly re-point it at the bundled asset URLs.
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

const pickupIcon = L.divIcon({
  className: '',
  html: '<div style="background:#1B4D3E;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #1B4D3E;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const dropIcon = L.divIcon({
  className: '',
  html: '<div style="background:#EF4444;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #EF4444;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const truckIcon = L.divIcon({
  className: '',
  html: '<div style="background:#00E676;width:22px;height:22px;border-radius:50%;border:3px solid #1B4D3E;display:flex;align-items:center;justify-content:center;font-size:12px;">🚚</div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// [lng, lat] (GeoJSON / how the backend stores it) -> [lat, lng] (Leaflet).
const toLatLng = (coords) => (coords && coords.length === 2 ? [coords[1], coords[0]] : null);

const isRealPoint = (coords) => coords && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);

// Recenters/refits the map whenever the set of points changes (e.g. a new
// vehicle position comes in from polling) without remounting the map.
const FitBounds = ({ points }) => {
  const map = useMap();
  useMemo(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
};

/**
 * Renders pickup/drop markers plus the live vehicle position (if the
 * backend has one) for a single shipment's tracking data, as returned by
 * GET /api/shipments/:id/track.
 */
const TrackingMap = ({ tracking, className = '' }) => {
  const trackingData = tracking || fakeTracking;
  const isDemo = !tracking;

  const pickup = trackingData?.pickup?.location?.coordinates;
  const drop = trackingData?.drop?.location?.coordinates;
  const vehicleCoords = trackingData?.vehicle?.currentLocation?.coordinates;

  const pickupLatLng = isRealPoint(pickup) ? toLatLng(pickup) : null;
  const dropLatLng = isRealPoint(drop) ? toLatLng(drop) : null;
  const vehicleLatLng = isRealPoint(vehicleCoords) ? toLatLng(vehicleCoords) : null;

  const points = [pickupLatLng, dropLatLng, vehicleLatLng].filter(Boolean);
  const fallbackCenter = [20.5937, 78.9629]; // India, used when no coords exist yet

  if (points.length === 0) {
    return (
      <div className={`flex min-h-[400px] items-center justify-center rounded-lg border border-gray-300 bg-gray-100 ${className}`}>
        <div className="text-center px-6">
          <p className="font-medium text-gray-500">No location data yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Coordinates will appear once pickup/drop points are set and the driver's device starts sharing location.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-[400px] w-full rounded-lg overflow-hidden ${className}`}>
      {isDemo && (
        <div className="absolute right-4 top-4 z-10 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-700 shadow-sm">
          Demo tracking data
        </div>
      )}
      <MapContainer center={points[0] || fallbackCenter} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />

        {pickupLatLng && (
          <Marker position={pickupLatLng} icon={pickupIcon}>
            <Popup>
              <strong>Pickup</strong>
              <br />
              {trackingData.pickup.address}, {trackingData.pickup.city}
            </Popup>
          </Marker>
        )}

        {dropLatLng && (
          <Marker position={dropLatLng} icon={dropIcon}>
            <Popup>
              <strong>Drop</strong>
              <br />
              {trackingData.drop.address}, {trackingData.drop.city}
            </Popup>
          </Marker>
        )}

      {pickupLatLng && dropLatLng && (
        <Polyline positions={[pickupLatLng, dropLatLng]} pathOptions={{ color: '#1B4D3E', weight: 3, dashArray: '6 8' }} />
      )}

        {vehicleLatLng && (
          <Marker position={vehicleLatLng} icon={truckIcon}>
            <Popup>
              <strong>{trackingData.vehicle?.registrationNumber || 'Vehicle'}</strong>
              <br />
              {trackingData.vehicle?.type}
              <br />
              Status: {trackingData.status}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default TrackingMap;