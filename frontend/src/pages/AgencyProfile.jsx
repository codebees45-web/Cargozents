import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const AgencyProfile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // 1. Core Profile Details State
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || 'Yaswanth Raj',
    email: user?.email || 'yaswanth@cargozents.com',
    phone: '+91 98765 43210',
    companyName: 'CargoZents Core Logistics Agency',
    agencyId: 'CZ-AGENCY-2026',
    fleetSize: '18 Active Trucks',
    operatingRegion: 'South & Western India Regional Grid',
    panCard: 'ABCDE1234F',
    gstin: '29ABCDE1234F1Z5',
  });

  // 2. Control System Preferences (The Settings Feature)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: true,
    instantBooking: false,
    twoFactorAuth: true,
  });

  // 3. User Avatar/Photo Upload Handling state
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

  // Trigger file attachment browsing programmatically
  const triggerFileBrowser = () => {
    fileInputRef.current.click();
  };

  // Convert uploaded image file directly into a renderable data object
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localImageUrl = URL.createObjectURL(file);
      setAvatar(localImageUrl);
    }
  };

  // Dynamic state syncing hook for form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Dynamic setting switch toggle logic
  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Trigger data saves or form cancellations
  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // Code to update back-end APIs goes right here
  };

  return (
    <div className="space-y-8 pb-12 font-sans text-gray-800">
      
      {/* HEADER CONTROLS BAR */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#133C2C] tracking-tight">Agency Profile</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage credentials, operational parameters, and notification alerts.</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#1C4E3A] text-white text-xs font-bold px-4 py-2.5 rounded-md hover:bg-opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit Profile Details
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="border border-gray-200 text-gray-600 text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#249B74] text-white text-xs font-bold px-5 py-2.5 rounded-md hover:bg-opacity-90 transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT CARD COLUMN: AVATAR DISPLAY & NOTIFICATION PREFERENCES */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* PROFILE PHOTO HUB CARD */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-xs">
            <div className="relative w-28 h-28 mx-auto mb-4 group">
              <img
                src={avatar}
                alt="Agency Profile Avatar"
                className="w-full h-full object-cover rounded-full border-2 border-gray-100 shadow-inner"
              />
              {/* Overlay hover effect to hint image click functionality */}
              <button
                onClick={triggerFileBrowser}
                className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[10px] font-bold"
              >
                <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                UPDATE PHOTO
              </button>
            </div>
            
            {/* Invisible native node attachment for handling uploads directly */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
            
            <h3 className="text-base font-bold text-gray-900">{profile.name}</h3>
            <span className="inline-block mt-1 text-[10px] font-bold tracking-widest text-[#249B74] bg-[#249B74]/10 px-2 py-0.5 rounded-sm uppercase">
              {profile.agencyId}
            </span>
            
            <p className="text-xs text-gray-400 mt-3 font-medium border-t border-gray-50 pt-3">
              {profile.companyName}
            </p>
          </div>

          {/* SETTINGS CONTROL CARD (BUILT DIRECTLY IN) */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
            <h4 className="text-[11px] font-black tracking-wider text-gray-400 uppercase mb-4">
              PORTAL CONFIGURATION & SETTINGS
            </h4>
            
            <div className="space-y-4">
              {/* Toggle 1: Email System Alerts */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-bold text-gray-800">Email Alerts</p>
                  <p className="text-[10px] text-gray-400 font-medium">Receive digital receipts & order dispatches.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('emailNotifications')}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.emailNotifications ? 'bg-[#249B74]' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.emailNotifications ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toggle 2: SMS Mobile Push */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-bold text-gray-800">SMS / WhatsApp Notifications</p>
                  <p className="text-[10px] text-gray-400 font-medium">Real-time driver location milestones updates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('smsAlerts')}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.smsAlerts ? 'bg-[#249B74]' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.smsAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toggle 3: Instant Order Pool Booking */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-bold text-gray-800">Instant Backhaul Booking</p>
                  <p className="text-[10px] text-gray-400 font-medium">Auto-accept shipments match system routing grids.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('instantBooking')}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.instantBooking ? 'bg-[#249B74]' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.instantBooking ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toggle 4: Multi-factor Security Lock */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-bold text-gray-800">Two-Factor Security (2FA)</p>
                  <p className="text-[10px] text-gray-400 font-medium">Secure financial payouts and profile updates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('twoFactorAuth')}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.twoFactorAuth ? 'bg-[#249B74]' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.twoFactorAuth ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CORE INFORMATION DATAGRID DETAILS BLOCK */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-8 shadow-xs">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* BLOCK SECTION ONE: ACCOUNT BASIC SPECS */}
            <div>
              <h4 className="text-[11px] font-black tracking-wider text-gray-400 uppercase border-b border-gray-50 pb-2 mb-4">
                Primary Operator Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">FULL OPERATOR NAME</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full text-xs font-medium px-3 py-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-[#249B74] disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">SECURE CONTACT EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full text-xs font-medium px-3 py-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-[#249B74] disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">REGISTERED PHONE NUMBER</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full text-xs font-medium px-3 py-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-[#249B74] disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">REGISTRATION CODE (ID)</label>
                  <input
                    type="text"
                    name="agencyId"
                    value={profile.agencyId}
                    disabled={true} // Strict Identifier Field (Cannot Be Edited)
                    className="w-full text-xs font-bold px-3 py-2.5 border border-gray-100 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed select-none"
                  />
                </div>
              </div>
            </div>

            {/* BLOCK SECTION TWO: LOGISTICS & FIRM DETAILS */}
            <div className="pt-4">
              <h4 className="text-[11px] font-black tracking-wider text-gray-400 uppercase border-b border-gray-50 pb-2 mb-4">
                Corporate & Fleet Parameters
              </h4>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">COMPANY BUSINESS ENTITY</label>
                  <input
                    type="text"
                    name="companyName"
                    value={profile.companyName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full text-xs font-medium px-3 py-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-[#249B74] disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">CURRENT VEHICLE VOLUME</label>
                    <input
                      type="text"
                      name="fleetSize"
                      value={profile.fleetSize}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full text-xs font-medium px-3 py-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-[#249B74] disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">GEOGRAPHIC RUNNING SCOPE</label>
                    <input
                      type="text"
                      name="operatingRegion"
                      value={profile.operatingRegion}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full text-xs font-medium px-3 py-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-[#249B74] disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCK SECTION THREE: COMPLIANCE STATUS REGISTRY */}
            <div className="pt-4">
              <h4 className="text-[11px] font-black tracking-wider text-gray-400 uppercase border-b border-gray-50 pb-2 mb-4">
                Regulatory & Commercial Verification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">PERMANENT ACCOUNT NUMBER (PAN)</label>
                  <input
                    type="text"
                    name="panCard"
                    value={profile.panCard}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full text-xs font-mono uppercase font-medium px-3 py-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-[#249B74] disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">GST IDENTIFICATION (GSTIN)</label>
                  <input
                    type="text"
                    name="gstin"
                    value={profile.gstin}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full text-xs font-mono uppercase font-medium px-3 py-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-[#249B74] disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AgencyProfile;