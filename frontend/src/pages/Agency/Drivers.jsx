import React, { useState, useRef } from 'react';

export default function AgencyDrivers() {
  const [drivers, setDrivers] = useState([
    { 
      id: 1, 
      name: 'Ramesh Kumar', 
      age: 38, 
      phone: '+91 98765 43210', 
      status: 'Available',
      photo: null // Will fallback to initials if null
    },
    { 
      id: 2, 
      name: 'Vikram Singh', 
      age: 42, 
      phone: '+91 98123 45678', 
      status: 'On Trip',
      photo: null
    }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    licenseNumber: '',
    photo: null // Stores Base64 string of the uploaded photo
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle local file selection and convert to Base64 for instant client-side render
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: reader.result // Base64 data URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleOnboard = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.phone) return;

    const newDriver = {
      id: Date.now(),
      name: formData.name,
      age: parseInt(formData.age, 10),
      phone: formData.phone,
      photo: formData.photo,
      status: 'Available'
    };

    setDrivers((prev) => [newDriver, ...prev]);
    
    // Reset form state
    setFormData({ name: '', age: '', phone: '', licenseNumber: '', photo: null });
    setShowModal(false);
  };

  const handleRemoveDriver = (id) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Drivers Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your agency's active, pending, and offline drivers.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-[#249B74] hover:bg-[#1C4E3A] px-4 py-2.5 text-xs font-semibold text-white transition duration-150 self-start md:self-auto shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Onboard New Driver
        </button>
      </div>

      {/* Main Content Area */}
      {drivers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[350px]">
          <div className="max-w-md flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">No drivers registered yet</h2>
            <p className="text-gray-400 text-xs mb-6 max-w-xs">
              Onboard professional drivers to assign them to your active vehicles and delivery orders.
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 bg-[#249B74] hover:bg-[#1C4E3A] text-white font-semibold rounded-lg transition duration-150 text-xs shadow-sm flex items-center gap-2"
            >
              Add a Driver
            </button>
          </div>
        </div>
      ) : (
        /* Driver Grid Box Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="relative rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Top Row: Avatar & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {driver.photo ? (
                    <img 
                      src={driver.photo} 
                      alt={driver.name} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                      {driver.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{driver.name}</h3>
                    <span className="text-[11px] text-gray-400 font-medium">Driver ID: #{driver.id.toString().slice(-4)}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                  driver.status === 'Available' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {driver.status}
                </span>
              </div>

              {/* Box Info Elements: Age & Number */}
              <div className="space-y-2 border-t border-gray-50 pt-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium text-gray-400">Age:</span>
                  <span className="font-semibold text-gray-800">{driver.age} years old</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium text-gray-400">Phone Number:</span>
                  <span className="font-semibold text-gray-800">{driver.phone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-50 flex gap-2">
                <button 
                  onClick={() => handleRemoveDriver(driver.id)}
                  className="w-full text-center py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition duration-150 border border-red-100"
                >
                  Remove Driver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. POPUP MODAL: ONBOARD DRIVER FORM WITH PHOTO UPLOADER */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm transition-all animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">Onboard New Driver</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleOnboard} className="p-6 space-y-4">
              
              {/* Photo Upload Zone */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div 
                  onClick={triggerFileSelect}
                  className="group relative w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#249B74] rounded-full flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-150"
                  title="Click to upload photo"
                >
                  {formData.photo ? (
                    <img 
                      src={formData.photo} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center flex flex-col items-center text-gray-400 group-hover:text-[#249B74] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                    </div>
                  )}
                  {/* Hover Overly */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                    {formData.photo ? 'Change' : 'Upload'}
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden" 
                />
                <span className="text-[10px] text-gray-400 mt-2 font-medium">Add Profile Picture</span>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Driver Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Age</label>
                  <input 
                    type="number" 
                    name="age"
                    required
                    min="18"
                    max="70"
                    placeholder="e.g. 35"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">License Number</label>
                  <input 
                    type="text" 
                    name="licenseNumber"
                    placeholder="DL-14201100..."
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-[#249B74] hover:bg-[#1C4E3A] text-white rounded-lg transition shadow-sm"
                >
                  Onboard Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}