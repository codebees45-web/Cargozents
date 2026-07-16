import React, { useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';

export default function ShipperSettings() {
  const [settings, setSettings] = useState({
    instantBookingAlerts: true,
    biddingUpdates: true,
    invoiceGenerationAlerts: true,
    emailReports: true,
    twoFactor: false,
  });

  const [companyPrefs, setCompanyPrefs] = useState({
    defaultCurrency: 'INR (₹)',
    timezone: 'IST (UTC+05:30)',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handleSelectChange = (e) => setCompanyPrefs(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
    <DashboardLayout title="Shipper Settings" subtitle="Configure notifications and company preferences.">
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
              <ToggleSwitch label="Instant Booking Notifications" isChecked={settings.instantBookingAlerts} onChange={() => handleToggle('instantBookingAlerts')} />
              <ToggleSwitch label="Driver Bidding Updates" isChecked={settings.biddingUpdates} onChange={() => handleToggle('biddingUpdates')} />
              <ToggleSwitch label="Invoice & Billing Alerts" isChecked={settings.invoiceGenerationAlerts} onChange={() => handleToggle('invoiceGenerationAlerts')} />
              <ToggleSwitch label="Receive Weekly Email Reports" isChecked={settings.emailReports} onChange={() => handleToggle('emailReports')} />
            </div>
          </div>

          <div className="bg-secondary/10 rounded-xl border border-primary/10 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-6">Company & Regional Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-primary mb-2">Preferred Currency</label>
                <select name="defaultCurrency" value={companyPrefs.defaultCurrency} onChange={handleSelectChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary">
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="USD ($)">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-primary mb-2">Timezone</label>
                <select name="timezone" value={companyPrefs.timezone} onChange={handleSelectChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary">
                  <option value="IST (UTC+05:30)">IST (UTC+05:30)</option>
                  <option value="EST (UTC-05:00)">EST (UTC-05:00)</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-primary/10 mt-6">
              <ToggleSwitch label="Require 2-Factor Authentication for Withdrawals" isChecked={settings.twoFactor} onChange={() => handleToggle('twoFactor')} />
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