import { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  twoFactorAuth: false,
  darkMode: false,
  language: "English",
  currency: "INR",
};

const STORAGE_KEY = "buyer_settings";

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // No backend endpoint exists yet for buyer settings, so we persist
      // locally for now. Swap this for buyerService.updateSettings(settings)
      // once a real API route is added.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSaved(true);
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your account preferences."
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Notification Settings */}

        <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

          <h2 className="text-lg font-semibold text-primary">
            Notification Preferences
          </h2>

          <div className="mt-6 space-y-5">

            <Toggle
              title="Email Notifications"
              value={settings.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
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