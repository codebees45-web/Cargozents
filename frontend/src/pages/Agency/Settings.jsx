import React, { useState } from 'react';

export default function AgencySettings() {
  // State for toggles
  const [settings, setSettings] = useState({
    emailNotif: true,
    smsNotif: true,
    pushNotif: true,
    marketingNotif: false,
    twoFactor: false,
    darkMode: false,
  });

  // State for dropdowns
  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'INR',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Generic handler for toggles
  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handler for dropdowns
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Simulate Save Action
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowModal(true);
    }, 1000);
  };

  // Reusable Custom Toggle Switch Component
  const ToggleSwitch = ({ label, isChecked, onChange }) => (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-[15px] font-semibold text-[#133C2C]">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
          isChecked ? 'bg-[#1C4E3A]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl pb-10 relative">
      
      {/* 🟢 Clean Interior Page Title Block */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#133C2C]">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account configuration and notification preferences.</p>
      </div>
      
      {/* CENTERED POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-5">
              <svg className="h-8 w-8 text-[#1C4E3A]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#133C2C] mb-2">Settings Saved!</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Your profile preferences have been updated successfully.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full rounded-lg bg-[#1C4E3A] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#133C2C] shadow-md"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        
        {/* 1. Notification Preferences Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-[#133C2C] mb-4">Notification Preferences</h2>
          <div className="flex flex-col divide-y divide-gray-50">
            <ToggleSwitch 
              label="Email Notifications" 
              isChecked={settings.emailNotif} 
              onChange={() => handleToggle('emailNotif')} 
            />
            <ToggleSwitch 
              label="SMS Notifications" 
              isChecked={settings.smsNotif} 
              onChange={() => handleToggle('smsNotif')} 
            />
            <ToggleSwitch 
              label="Push Notifications" 
              isChecked={settings.pushNotif} 
              onChange={() => handleToggle('pushNotif')} 
            />
            <ToggleSwitch 
              label="Marketing Emails" 
              isChecked={settings.marketingNotif} 
              onChange={() => handleToggle('marketingNotif')} 
            />
          </div>
        </div>

        {/* 2. Security Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-[#133C2C] mb-4">Security</h2>
          <div className="flex flex-col">
            <ToggleSwitch 
              label="Enable Two-Factor Authentication" 
              isChecked={settings.twoFactor} 
              onChange={() => handleToggle('twoFactor')} 
            />
          </div>
        </div>

        {/* 3. Preferences Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-[#133C2C] mb-6">Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-[13px] font-semibold text-[#133C2C] mb-2">Language</label>
              <div className="relative">
                <select 
                  name="language"
                  value={preferences.language}
                  onChange={handleSelectChange}
                  className="w-full appearance-none px-4 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition bg-white"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#133C2C] mb-2">Currency</label>
              <div className="relative">
                <select 
                  name="currency"
                  value={preferences.currency}
                  onChange={handleSelectChange}
                  className="w-full appearance-none px-4 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition bg-white"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-50">
            <ToggleSwitch 
              label="Dark Mode" 
              isChecked={settings.darkMode} 
              onChange={() => handleToggle('darkMode')} 
            />
          </div>
        </div>

        {/* Save Button Area */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-3 bg-[#1C4E3A] hover:bg-[#133C2C] text-white text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${
              isSaving ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}