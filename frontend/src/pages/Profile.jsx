import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import FormInput from '../components/common/FormInput';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyPickup = { address: '', city: '', state: '', pincode: '', coordinates: ['', ''] };

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [pickup, setPickup] = useState(emptyPickup);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    api
      .get('/auth/me')
      .then(({ data }) => {
        updateUser(data.user);
        setName(data.user.name || '');
        if (data.user.role === 'shipper' && data.user.shipperProfile?.pickupAddress) {
          const p = data.user.shipperProfile.pickupAddress;
          setPickup({
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            pincode: p.pincode || '',
            coordinates: p.location?.coordinates?.[0] ? p.location.coordinates : ['', ''],
          });
        }
      })
      .catch(() => {}); // fall back silently to whatever's already in context
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickup((p) => ({ ...p, coordinates: [pos.coords.longitude, pos.coords.latitude] }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const body = { name };
      if (user.role === 'shipper') {
        body.shipperProfile = {
          pickupAddress: {
            address: pickup.address,
            city: pickup.city,
            state: pickup.state,
            pincode: pickup.pincode,
            location: {
              type: 'Point',
              coordinates: pickup.coordinates[0] !== '' ? pickup.coordinates.map(Number) : [0, 0],
            },
          },
        };
      }
      const { data } = await api.patch('/auth/me', body);
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Profile" subtitle="Your account details.">
      <form onSubmit={handleSave} className="max-w-lg space-y-6">
        <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
          <FormInput label="FULL NAME" name="name" value={name} onChange={(e) => setName(e.target.value)} />
          <p className="mt-3 text-xs text-[#5B7A70]">
            Email: {user?.email} · Phone: {user?.phone} — contact support to change these.
          </p>
        </div>

        {user?.role === 'shipper' && (
          <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-mono-ls text-[11px] tracking-wide text-primary">DEFAULT PICKUP ADDRESS</h3>
              <button type="button" onClick={useMyLocation} className="font-mono-ls text-[10px] text-primary/70 hover:text-primary hover:underline">
                {locating ? 'LOCATING…' : 'USE MY LOCATION'}
              </button>
            </div>
            <p className="mt-1 mb-4 text-xs text-[#5B7A70]">
              Used to pre-fill pickup details whenever you post a shipment against a confirmed order.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormInput
                  label="ADDRESS"
                  name="address"
                  value={pickup.address}
                  onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
                  placeholder="Warehouse / street address"
                  required={false}
                />
              </div>
              <FormInput label="CITY" name="city" value={pickup.city} onChange={(e) => setPickup({ ...pickup, city: e.target.value })} required={false} />
              <FormInput label="STATE" name="state" value={pickup.state} onChange={(e) => setPickup({ ...pickup, state: e.target.value })} required={false} />
              <FormInput label="PINCODE" name="pincode" value={pickup.pincode} onChange={(e) => setPickup({ ...pickup, pincode: e.target.value })} required={false} />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-sm text-success">Saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </DashboardLayout>
  );
};

export default Profile;