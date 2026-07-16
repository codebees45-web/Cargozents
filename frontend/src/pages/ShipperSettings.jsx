import React, { useState } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import { useTheme } from "../context/ThemeContext";

export default function ShipperSettings() {
  const { isDark, toggleTheme } = useTheme();

  const [shipping, setShipping] = useState({
    autoInsurance: false,
    priorityMatching: true,
    milestoneAlerts: true,
  });

  const [security, setSecurity] = useState({
    apiAccess: false,
  });

  const [preferences, setPreferences] = useState({
    weightUnit: "KG_CBM",
    currency: "INR",
  });

  const handleShippingToggle = (key) => {
    setShipping((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityToggle = (key) => {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (e) => {
    setPreferences((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveSettings = () => {
    alert("Shipper account configurations saved successfully!");
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
    <DashboardLayout
      title="Shipper Settings"
      subtitle="Configure shipment automation rules, carrier matching tiers, and cargo safety standards."
    >
      <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Shipping & Dispatch Policies
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Auto-Apply Cargo Insurance</p>
                <p className="text-xs text-[#8AA399]">Automatically protect high-value cargo with standard transit coverage.</p>
              </div>
              <ToggleSwitch
                checked={shipping.autoInsurance}
                onChange={() => handleShippingToggle("autoInsurance")}
                ariaLabel="Toggle Auto Cargo Insurance"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Priority Carrier Matching</p>
                <p className="text-xs text-[#8AA399]">Limit fast bids to tier-1 vetted carriers with a 98%+ on-time rating.</p>
              </div>
              <ToggleSwitch
                checked={shipping.priorityMatching}
                onChange={() => handleShippingToggle("priorityMatching")}
                ariaLabel="Toggle Priority Matching"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Milestone Alerts</p>
                <p className="text-xs text-[#8AA399]">Send real-time alerts whenever custom checks, pickups, or deliveries happen.</p>
              </div>
              <ToggleSwitch
                checked={shipping.milestoneAlerts}
                onChange={() => handleShippingToggle("milestoneAlerts")}
                ariaLabel="Toggle Milestone Alerts"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Integration & Security
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-primary">External ERP API Sync</p>
              <p className="text-xs text-[#8AA399]">Restrict third-party software from fetching invoice and tracking data logs.</p>
            </div>
            <ToggleSwitch
              checked={security.apiAccess}
              onChange={() => handleSecurityToggle("apiAccess")}
              ariaLabel="Toggle API Access Restriction"
            />
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Platform Display Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Logistics Weight & Volume Units
              </label>
              <select
                name="weightUnit"
                value={preferences.weightUnit}
                onChange={handlePreferenceChange}
                className="w-full rounded-lg border border-primary/10 bg-[#0c1411] px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary cursor-pointer"
              >
                <option value="KG_CBM">Metric System (KG, Tons, m³)</option>
                <option value="LBS_CFT">Imperial System (lbs, Short Tons, ft³)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Settlement Currency
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
              <p className="text-xs text-[#8AA399]">Switch between standard light screen and cozy dark-room dashboard mode.</p>
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
            Save Shipper Settings
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}