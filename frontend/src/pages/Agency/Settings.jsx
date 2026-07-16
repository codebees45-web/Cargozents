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
  const [showToast, setShowToast] = useState(false);

  // Load previously saved settings on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch (err) {
      console.error("Failed to load saved settings:", err);
    }
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const handleSelect = (e) => {
    setSettings((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Simulate Save Action
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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
    <div className="max-w-4xl pb-10 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 right-10 z-50 bg-[#1C4E3A] text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-5">
          <svg className="w-5 h-5 text-[#4ade80]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <p className="text-sm font-bold tracking-wide">Settings saved successfully!</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#133C2C] font-display">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account preferences.
        </p>
      </div>

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

            <Toggle
              title="SMS Notifications"
              value={settings.smsNotifications}
              onChange={() => handleToggle("smsNotifications")}
            />

            <Toggle
              title="Push Notifications"
              value={settings.pushNotifications}
              onChange={() => handleToggle("pushNotifications")}
            />

            <Toggle
              title="Marketing Emails"
              value={settings.marketingEmails}
              onChange={() => handleToggle("marketingEmails")}
            />

          </div>

        </div>

        {/* Security */}

        <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

          <h2 className="text-lg font-semibold text-primary">
            Security
          </h2>

          <div className="mt-6">

            <Toggle
              title="Enable Two-Factor Authentication"
              value={settings.twoFactorAuth}
              onChange={() => handleToggle("twoFactorAuth")}
            />

          </div>

        </div>

        {/* Preferences */}

        <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

          <h2 className="text-lg font-semibold text-primary">
            Preferences
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mt-6">

            <div>

              <label className="block mb-2 text-sm font-medium">
                Language
              </label>

              <select
                name="language"
                value={settings.language}
                onChange={handleSelect}
                className="w-full rounded-lg border border-primary/10 px-4 py-3"
              >
                <option>English</option>
                <option>Tamil</option>
                <option>Hindi</option>
              </select>

            </div>

            <div>

              <label className="block mb-2 text-sm font-medium">
                Currency
              </label>

              <select
                name="currency"
                value={settings.currency}
                onChange={handleSelect}
                className="w-full rounded-lg border border-primary/10 px-4 py-3"
              >
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>

            </div>

          </div>

          <div className="mt-6">

            <Toggle
              title="Dark Mode"
              value={settings.darkMode}
              onChange={() => handleToggle("darkMode")}
            />

          </div>

        </div>

        <div className="flex items-center justify-end gap-4">

          {saved && (
            <span className="text-sm font-medium text-green-600">
              Settings saved
            </span>
          )}

          <button
            onClick={saveSettings}
            disabled={saving}
            className="rounded-lg bg-primary px-8 py-3 text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>

        </div>

      </div>
    </DashboardLayout>
  );
}

function Toggle({ title, value, onChange }) {
  return (
    <div className="flex items-center justify-between">

      <span className="font-medium text-primary">
        {title}
      </span>

      <button
        type="button"
        onClick={onChange}
        className={`w-14 h-8 rounded-full transition ${
          value ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <div
          className={`h-6 w-6 rounded-full bg-white transition transform ${
            value ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>

    </div>
  );
}