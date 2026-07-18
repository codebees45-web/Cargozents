import { useEffect, useState } from 'react';
import ProfilePhotoUpload from '../components/common/ProfilePhotoUpload';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ROLE_LABELS = {
  buyer: 'Buyer',
  shipper: 'Shipper',
  driver: 'Driver',
  agency: 'Agency',
  admin: 'Admin',
};

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [photo, setPhoto] = useState('');
  const [form, setForm] = useState({ name: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      updateUser(data.user);
      setPhoto(data.user.profileImage || '');
      setForm({ name: data.user.name || '' });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const { data } = await api.patch('/auth/me', {
        name: form.name,
        profileImage: photo,
      });
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your profile right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 pb-12">
      {/* Replaced DashboardLayout with standard headers to fix double-sidebar */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 mt-1">Manage your personal details and account security.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {/* LEFT: photo + identity card */}
        <div className="rounded-xl border border-[#173022] bg-[#0a1811] p-6 text-center shadow-sm">
          <div className="mx-auto w-fit">
            <ProfilePhotoUpload value={photo} onChange={setPhoto} label="" round hint="Upload photo" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-slate-100">{user?.name || '—'}</h2>
          <p className="mt-1 inline-block select-none rounded-full border border-[#00E676]/30 bg-[#00E676]/10 px-3 py-1 font-mono-ls text-[11px] font-bold uppercase tracking-wider text-[#00E676]">
            {ROLE_LABELS[user?.role] || user?.role}
          </p>
          <p className="mt-4 text-sm italic text-gray-400">Logged in as {user?.email}</p>
        </div>

        {/* RIGHT: editable form */}
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-xl border border-[#173022] bg-[#0a1811] p-6 shadow-sm">
            <h3 className="text-md mb-5 border-b border-[#173022] pb-3 font-bold tracking-tight text-white">
              Account Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-[#173022] bg-[#050c08] px-4 py-3 text-sm text-slate-200 outline-none focus:border-[#00E676]/60 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Phone</label>
                  <input
                    type="text"
                    value={user?.phone || ''}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-[#173022] bg-[#050c08]/50 px-4 py-3 text-sm text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Registered Email (cannot be changed)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full cursor-not-allowed select-none rounded-lg border border-[#173022] bg-[#050c08]/50 px-4 py-3 text-sm text-gray-500"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}
              {saved && <p className="text-xs text-[#00E676]">Profile saved successfully.</p>}

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#00E676] px-6 py-2.5 text-xs font-bold text-black shadow-lg transition-all duration-200 hover:bg-[#00c565] disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}