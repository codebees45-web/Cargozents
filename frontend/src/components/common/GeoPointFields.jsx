import FormInput from './FormInput';

/**
 * Captures one geoPoint (address/city/state/pincode/coordinates) for a
 * shipment's pickup or drop. Coordinates are required by the backend for
 * distance-based pricing and matching; until a Places/Maps picker is wired
 * in, "Use my location" (browser geolocation) or manual entry are the two
 * ways to fill them in.
 */
const GeoPointFields = ({ label, value, onChange, onUseMyLocation, locating }) => {
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });
  const setCoord = (index) => (e) => {
    const coords = [...value.coordinates];
    coords[index] = e.target.value === '' ? '' : Number(e.target.value);
    onChange({ ...value, coordinates: coords });
  };

  const hasCoords = value.coordinates[0] !== '' && value.coordinates[1] !== '' && !(value.coordinates[0] === 0 && value.coordinates[1] === 0);

  return (
    <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-mono-ls text-[11px] tracking-wide text-primary">{label}</h3>
        {onUseMyLocation && (
          <button
            type="button"
            onClick={onUseMyLocation}
            className="font-mono-ls text-[10px] text-primary/70 hover:text-primary hover:underline"
          >
            {locating ? 'LOCATING…' : 'USE MY LOCATION'}
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormInput label="ADDRESS" name="address" value={value.address} onChange={set('address')} placeholder="Warehouse / street address" />
        </div>
        <FormInput label="CITY" name="city" value={value.city} onChange={set('city')} placeholder="Chennai" />
        <FormInput label="STATE" name="state" value={value.state} onChange={set('state')} placeholder="Tamil Nadu" />
        <FormInput label="PINCODE" name="pincode" value={value.pincode} onChange={set('pincode')} placeholder="600001" />
        <div className="grid grid-cols-2 gap-2">
          <FormInput label="LATITUDE" type="number" name="lat" value={value.coordinates[1]} onChange={setCoord(1)} placeholder="13.0827" />
          <FormInput label="LONGITUDE" type="number" name="lng" value={value.coordinates[0]} onChange={setCoord(0)} placeholder="80.2707" />
        </div>
      </div>
      {!hasCoords && (
        <p className="mt-3 text-[11px] text-warning">
          Coordinates are needed for pricing and driver matching — use "Use my location" or paste them from Google Maps
          (right-click a point → copy coordinates).
        </p>
      )}
    </div>
  );
};

export default GeoPointFields;
