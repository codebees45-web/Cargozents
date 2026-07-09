import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AgencyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout action cleanly
  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate("/login");
    }
  };

  // Sidebar link styles matching the precise styling from image_d23a53.png
  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold tracking-wider rounded-md transition-all duration-150";
    return isActive
      ? `${baseClasses} bg-[#1C4E3A] text-white` // Deep forest green capsule
      : `${baseClasses} text-[#6C7A74] hover:bg-gray-50 hover:text-gray-900`; // Slate gray text
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-800 font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 p-6">
        <div>
          {/* Logo Section */}
          <div className="flex items-center gap-2 mb-10 px-2">
            {/* Custom SVG mimicking the green backhaul circular arrows logo */}
            <svg className="w-5 h-5 text-[#249B74]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M4.5 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3" />
            </svg>
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              Cargo<span className="text-[#249B74]">zents</span>
            </h2>
          </div>

          {/* Sidebar Navigation items with custom indicators */}
          <nav className="flex flex-col gap-1.5">
            <NavLink to="/agency/overview" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />}
                  OVERVIEW
                </>
              )}
            </NavLink>
            
            <NavLink to="/agency/orders-received" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />}
                  ORDERS RECEIVED
                </>
              )}
            </NavLink>
            
            <NavLink to="/agency/available-trucks" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />}
                  AVAILABLE TRUCKS
                </>
              )}
            </NavLink>
            
            <NavLink to="/agency/truck-tracking" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />}
                  TRUCK TRACKING
                </>
              )}
            </NavLink>
            
            <NavLink to="/agency/profile" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />}
                  PROFILE
                </>
              )}
            </NavLink>
          </nav>
        </div>

        {/* Footer info or minimal note down sidebar if necessary */}
        <div className="px-2 text-[10px] text-gray-400 font-medium tracking-wider">
          AGENCY PORTAL v1.0
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP STATUS HEADER BAR */}
        <header className="flex justify-between items-start px-10 pt-8 pb-6 border-b border-gray-100 bg-white shrink-0">
          <div>
            <h1 className="text-xl font-bold text-[#133C2C] tracking-tight">
              Welcome back, {user?.name || "Yaswanth"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              Managing agency logistics and active vehicle tracking.
            </p>
          </div>

          {/* User Meta & Action Group */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {user?.name || "Yaswanth Raj"} <span className="mx-1 text-gray-300">•</span> <span className="text-[#249B74]">Agency</span>
            </span>
            <button 
              onClick={handleLogout}
              className="border border-gray-200 text-gray-600 rounded-md px-3 py-1 text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Log out
            </button>
          </div>
        </header>

        {/* WORKSPACE SUB-PAGE INJECTION POINT */}
        <main className="flex-1 overflow-y-auto p-10 bg-white">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AgencyDashboard;