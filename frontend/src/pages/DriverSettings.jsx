import React, { useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';

export default function DriverSettings() {
  const [settings, setSettings] = useState({
    newLoadAlerts: true,
    tripUpdates: true,
    walletAlerts: true,
    smsNotif: true,
    twoFactor: false,
    darkMode: false,
  });

  const [preferences, setPreferences] = useState({
    language: 'English',
    navigationApp: 'Google Maps',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handleSelectChange = (e) => setPreferences(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const ToggleSwitch = ({ label, isChecked, onChange }) => (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-[15px] font-semibold text-primary">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
          isChecked ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <DashboardLayout title="Settings" subtitle="Manage your driver app preferences.">
      <div className="max-w-4xl pb-10 relative">
        {showToast && (
          <div className="fixed bottom-10 right-10 z-50 bg-primary text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
            <p className="text-sm font-bold tracking-wide">Settings saved successfully!</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-secondary/10 rounded-xl border border-primary/10 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">Notification Preferences</h2>
            <div className="flex flex-col divide-y divide-primary/10">
              <ToggleSwitch label="New Load Alerts" isChecked={settings.newLoadAlerts} onChange={() => handleToggle('newLoadAlerts')} />
              <ToggleSwitch label="Trip Status Updates" isChecked={settings.tripUpdates} onChange={() => handleToggle('tripUpdates')} />
              <ToggleSwitch label="Payment & Wallet Alerts" isChecked={settings.walletAlerts} onChange={() => handleToggle('walletAlerts')} />
              <ToggleSwitch label="SMS Notifications" isChecked={settings.smsNotif} onChange={() => handleToggle('smsNotif')} />
            </div>
          </div>

          <div className="bg-secondary/10 rounded-xl border border-primary/10 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-6">App Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-[13px] font-semibold text-primary mb-2">Display Language</label>
                <select name="language" value={preferences.language} onChange={handleSelectChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Kannada">Kannada</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-primary mb-2">Default Navigation App</label>
                <select name="navigationApp" value={preferences.navigationApp} onChange={handleSelectChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary">
                  <option value="Google Maps">Google Maps</option>
                  <option value="In-App Navigation">In-App Navigation</option>
                </select>
              </div>
            </div>
            <div className="pt-2 border-t border-primary/10">
              <ToggleSwitch label="Dark Mode" isChecked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-primary hover:bg-primary/95 text-secondary text-sm font-bold rounded-lg transition-all shadow-sm">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}