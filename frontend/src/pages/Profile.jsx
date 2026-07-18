import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "",
    companyName: user?.companyName || "",
    profilePic: null, 
  });

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert("Profile information updated successfully!");
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, profilePic: imageUrl }));
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8 px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT PANEL: PROFILE CARD & PIC UPLOAD */}
          <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 text-center shadow-sm">
            <div className="relative mx-auto h-28 w-28 rounded-full border-2 border-[#00E676]/30 bg-primary/10 flex items-center justify-center overflow-hidden group">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-[#00E676] select-none">
                  {profile.fullName ? profile.fullName.charAt(0) : "?"}
                </span>
              )}
              
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer text-[10px] font-bold text-white uppercase tracking-wider">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mb-1 text-[#00E676]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className="mt-4 text-lg font-bold text-primary">
              {profile.fullName}
            </h2>
            <p className="text-xs font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 px-3 py-1 rounded-full inline-block mt-1 select-none uppercase tracking-wider">
              {profile.role}
            </p>
            
            <p className="mt-4 text-sm text-[#8AA399] italic">
              Logged in as {profile.email}
            </p>
          </div>

          {/* RIGHT PANEL: PROFILE INFORMATION FORM */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Account Information Card */}
            <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
              <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
                Account Information
              </h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-primary/10 bg-secondary/20 px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-primary/10 bg-secondary/20 px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={profile.companyName}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-primary/10 bg-secondary/20 px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                      Registered Email (Cannot be changed)
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full rounded-lg border border-primary/10 bg-secondary/20 px-4 py-3 text-sm text-[#8AA399]/60 cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-[#00E676] px-6 py-2.5 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>



          </div>

        </div>
      </div>
    </>
  );
}