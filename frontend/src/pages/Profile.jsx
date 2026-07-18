import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api"; // Make sure this path is correct for your project

const ROLE_LABELS = {
  buyer: 'Buyer',
  shipper: 'Shipper',
  driver: 'Driver',
  agency: 'Agency',
  admin: 'Admin',
};

export default function Profile() {
  const { user, updateUser } = useAuth();

  // Consolidated state matching the API submission requirements
  const [form, setForm] = useState({ name: user?.name || '' });
  const [photo, setPhoto] = useState(user?.profileImage || '');
  
  // UI Loading States
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Update local state if user context loads later
  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '' });
      setPhoto(user.profileImage || '');
    }
  }, [user]);

  // Handles the custom native file input conversion
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result); // Sets the base64 string for preview and upload
      };
      reader.readAsDataURL(file);
    }
  };

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
      if (updateUser) updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your profile right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 pb-12 pt-6">
      
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 mt-1">Manage your personal details and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT PANEL: PROFILE CARD & PIC UPLOAD */}
        <div className="rounded-xl border border-[#173022] bg-[#0a1811] p-6 text-center shadow-sm">
          
          {/* Custom Image Uploader */}
          <div className="relative mx-auto h-28 w-28 rounded-full border-2 border-[#00E676]/30 bg-[#050c08] flex items-center justify-center overflow-hidden group">
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-[#00E676] select-none uppercase">
                {form.name ? form.name.charAt(0) : "?"}
              </span>
            )}
            
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer text-[10px] font-bold text-white uppercase tracking-wider">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mb-1 text-[#00E676]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Change
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <h2 className="mt-4 font-display text-lg font-bold text-slate-100">{user?.name || '—'}</h2>
          <p className="mt-1 inline-block select-none rounded-full border border-[#00E676]/30 bg-[#00E676]/10 px-3 py-1 font-mono-ls text-[11px] font-bold uppercase tracking-wider text-[#00E676]">
            {ROLE_LABELS[user?.role] || user?.role}
          </p>
          <p className="mt-4 text-sm italic text-gray-400">Logged in as {user?.email}</p>
        </div>

        {/* RIGHT PANEL: EDITABLE FORM */}
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