import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
    darkMode: false,
    language: "English",
    currency: "INR",
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelect = (e) => {
    setSettings((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveSettings = () => {
    // buyerService.updateSettings(settings)
    console.log(settings);
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

        <div className="flex justify-end">

          <button
            onClick={saveSettings}
            className="rounded-lg bg-primary px-8 py-3 text-white hover:opacity-90 transition"
          >
            Save Settings
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