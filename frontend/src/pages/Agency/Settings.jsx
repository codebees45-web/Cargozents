import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function AgencySettings() {
  const { isDark, toggleTheme } = useTheme();

  const [operations, setOperations] = useState({
    autoAssign: true,
    driverSms: false,
    clientEmail: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
  });

  const [preferences, setPreferences] = useState({
    timezone: "IST",
    currency: "INR",
  });

  const handleOperationToggle = (key) => {
    setOperations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityToggle = (key) => {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (e) => {
    setPreferences((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveSettings = () => {
    alert("Agency configurations saved successfully!");
  };

  const ToggleSwitch = ({ checked, onChange, ariaLabel }) => {
    return (
      <button
        type="button"
        onClick={onChange}
        aria-label={ariaLabel}
        className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
          checked 
            ? "bg-[#00E676] shadow-[0_0_10px_rgba(0,230,118,0.25)]" 
            : "bg-primary/10 border border-primary/10"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-300 ease-in-out ${
            checked 
              ? "translate-x-6 bg-[#0A110E]" 
              : "translate-x-0 bg-[#8AA399]" 
          }`}
        />
      </button>
    );
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-xl font-bold text-primary">Agency Settings</h1>
        <p className="mt-1 text-sm text-[#5B7A70]">
          Manage configurations, automatic assignments, dispatch rules, and preferences.
        </p>
      </div>
      <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Dispatch & Operations
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Auto-Assign Drivers</p>
                <p className="text-xs text-[#8AA399]">Automatically match orders to the nearest free fleet vehicle.</p>
              </div>
              <ToggleSwitch
                checked={operations.autoAssign}
                onChange={() => handleOperationToggle("autoAssign")}
                ariaLabel="Toggle Auto-Assign Drivers"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Driver SMS Notifications</p>
                <p className="text-xs text-[#8AA399]">Send dynamic SMS dispatch links to drivers upon order acceptance.</p>
              </div>
              <ToggleSwitch
                checked={operations.driverSms}
                onChange={() => handleOperationToggle("driverSms")}
                ariaLabel="Toggle Driver SMS"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Client Live Updates</p>
                <p className="text-xs text-[#8AA399]">Ping buyers with automatic email alerts when drivers head transit.</p>
              </div>
              <ToggleSwitch
                checked={operations.clientEmail}
                onChange={() => handleOperationToggle("clientEmail")}
                ariaLabel="Toggle Client Updates"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Security & Gateways
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-primary">Two-Factor Authentication (2FA)</p>
              <p className="text-xs text-[#8AA399]">Require secure secondary sign-ins for all dashboard staff profiles.</p>
            </div>
            <ToggleSwitch
              checked={security.twoFactor}
              onChange={() => handleSecurityToggle("twoFactor")}
              ariaLabel="Toggle Two-Factor Authentication"
            />
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Regional Settings & Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Timezone
              </label>
              <select
                name="timezone"
                value={preferences.timezone}
                onChange={handlePreferenceChange}
                className="w-full rounded-lg border border-primary/10 bg-[#0c1411] px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary cursor-pointer"
              >
                <option value="IST">India Standard Time (IST - UTC +5:30)</option>
                <option value="EST">Eastern Standard Time (EST - UTC -5:00)</option>
                <option value="GMT">Greenwich Mean Time (GMT - UTC +0:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Operating Currency
              </label>
              <select
                name="currency"
                value={preferences.currency}
                onChange={handlePreferenceChange}
                className="w-full rounded-lg border border-primary/10 bg-[#0c1411] px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary cursor-pointer"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-primary/10">
            <div>
              <p className="text-sm font-bold text-primary">Dark Mode</p>
              <p className="text-xs text-[#8AA399]">Switch between bright daylight screen and dark-charcoal mode.</p>
            </div>
            <ToggleSwitch
              checked={isDark}
              onChange={toggleTheme}
              ariaLabel="Toggle Dark Theme"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="rounded-lg bg-[#00E676] px-8 py-3 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-200"
          >
            Save Agency Settings
          </button>
        </div>
      </div>
    </>
  );
}