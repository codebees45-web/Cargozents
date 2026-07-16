import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api'; 

const Profile = () => {
    const { user } = useAuth(); 
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        licenseNumber: '',
        experienceYears: '',
        vehicleType: '',
        companyName: '',
        address: '',
        agencyName: '',
        fleetSize: ''
    });
    
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Initial load fallback from Auth Session context
    useEffect(() => {
        if (user) {
            const detailsObj = user.driverDetails || user.shipperDetails || user.agencyDetails || user.profile || {};
            
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name || '',
                phone: user.phone || user.phoneNumber || detailsObj.phone || prev.phone || '',
                licenseNumber: user.licenseNumber || detailsObj.licenseNumber || prev.licenseNumber || '',
                experienceYears: user.experienceYears || detailsObj.experienceYears || prev.experienceYears || '',
                vehicleType: user.vehicleType || detailsObj.vehicleType || prev.vehicleType || '',
                companyName: user.companyName || detailsObj.companyName || prev.companyName || '',
                address: user.address || detailsObj.address || prev.address || '',
                agencyName: user.agencyName || detailsObj.agencyName || prev.agencyName || '',
                fleetSize: user.fleetSize || detailsObj.fleetSize || prev.fleetSize || ''
            }));
            
            if (user.profilePhotoUrl) {
                setPhotoPreview(`http://localhost:5000${user.profilePhotoUrl}`);
            }
        }
    }, [user]);

    // Fetch refreshed user profile document from backend database (Port 5000)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                
                if (response.data && response.data.success) {
                    const baseData = response.data.data || response.data.user || response.data;
                    
                    // Maps database objects safely whether saved flat or nested during onboarding
                    const driverObj = baseData.driverDetails || baseData.profile || {};
                    const shipperObj = baseData.shipperDetails || {};
                    const agencyObj = baseData.agencyDetails || {};

                    setFormData({
                        name: baseData.name || '',
                        phone: baseData.phone || baseData.phoneNumber || driverObj.phone || '',
                        licenseNumber: baseData.licenseNumber || driverObj.licenseNumber || '',
                        experienceYears: baseData.experienceYears || driverObj.experienceYears || '',
                        vehicleType: baseData.vehicleType || driverObj.vehicleType || '',
                        companyName: baseData.companyName || shipperObj.companyName || '',
                        address: baseData.address || driverObj.address || shipperObj.address || agencyObj.address || '',
                        agencyName: baseData.agencyName || agencyObj.agencyName || '',
                        fleetSize: baseData.fleetSize || agencyObj.fleetSize || ''
                    });
                    
                    if (baseData.profilePhotoUrl) {
                        setPhotoPreview(`http://localhost:5000${baseData.profilePhotoUrl}`);
                    }
                }
            } catch (error) {
                console.log("Awaiting live backend synchronization, keeping session snapshot.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleTextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Saving changes...');

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                submitData.append(key, formData[key]);
            }
        });
        
        if (photo) {
            submitData.append('profilePhoto', photo);
        }

        try {
            const response = await api.post('/users/profile', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 200 || response.data.success) {
                setMessage('✅ Profile successfully updated!');
                const updatedData = response.data.data || response.data;
                if (updatedData.profilePhotoUrl) {
                    setPhotoPreview(`http://localhost:5000${updatedData.profilePhotoUrl}`);
                }
            } else {
                setMessage('❌ Error: Could not complete updates.');
            }
        } catch (error) {
            console.error("Update request error:", error);
            setMessage('❌ Failed to update profile details on server.');
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-4xl pb-10">
                <div className="text-[#5B7A70] dark:text-emerald-400 font-medium">Syncing database data...</div>
            </div>
        );
    }

    const role = user?.role || 'driver'; 
    const inputClasses = "w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-[#5B7A70] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#5B7A70]/10 dark:focus:ring-emerald-500/10 placeholder-gray-400 dark:placeholder-neutral-500 shadow-sm";
    const labelClasses = "text-[11px] font-bold uppercase tracking-wider text-[#5B7A70] dark:text-emerald-400 mb-1.5";

    return (
        <div className="p-6 max-w-4xl pb-10 relative">
            
            {/* 🟢 CLEAN INTERIOR VIEW HEADING BLOCK */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#2D4A40] dark:text-emerald-400">Profile</h1>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Manage your account information.</p>
            </div>

            <div className="mx-auto rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 md:p-10 shadow-sm">
                
                {message && (
                    <div className={`mb-8 p-4 rounded-xl text-center font-semibold text-sm ${
                        message.includes('✅') 
                            ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400' 
                            : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400'
                    }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    
                    {/* AVATAR IMAGE SECTION */}
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-850 p-6">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile Preview" className="mb-4 h-28 w-28 rounded-full object-cover border-4 border-white shadow-md" />
                        ) : (
                            <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-[#E6ECEB] dark:bg-neutral-800 text-[#5B7A70] dark:text-emerald-400 font-semibold text-sm">
                                No Photo
                            </div>
                        )}
                        <label className="cursor-pointer rounded-lg bg-[#E6ECEB] dark:bg-neutral-800 px-4 py-2 text-xs font-semibold text-[#2D4A40] dark:text-emerald-300">
                            Change Profile Photo
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>

                    {/* FIELDS DYNAMIC GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="flex flex-col">
                            <label className={labelClasses}>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleTextChange} required className={inputClasses} />
                        </div>
                        
                        <div className="flex flex-col">
                            <label className={labelClasses}>Phone Number</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleTextChange} required className={inputClasses} />
                        </div>

                        {role === 'driver' && (
                            <>
                                <div className="flex flex-col">
                                    <label className={labelClasses}>License Number</label>
                                    <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleTextChange} required className={inputClasses} />
                                </div>
                                <div className="flex flex-col">
                                    <label className={labelClasses}>Experience (Years)</label>
                                    <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleTextChange} required className={inputClasses} />
                                </div>
                                <div className="flex flex-col md:col-span-2">
                                    <label className={labelClasses}>Primary Vehicle Type</label>
                                    <select name="vehicleType" value={formData.vehicleType} onChange={handleTextChange} className={inputClasses} required>
                                        <option value="" disabled>Select vehicle type</option>
                                        <option value="Mini Truck">Mini Truck</option>
                                        <option value="Heavy Duty">Heavy Duty Truck</option>
                                        <option value="Trailer">Trailer</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {(role === 'shipper' || role === 'buyer') && (
                            <>
                                <div className="flex flex-col">
                                    <label className={labelClasses}>Company Name</label>
                                    <input type="text" name="companyName" value={formData.companyName} onChange={handleTextChange} className={inputClasses} />
                                </div>
                                <div className="flex flex-col md:col-span-2">
                                    <label className={labelClasses}>Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleTextChange} className={inputClasses} />
                                </div>
                            </>
                        )}

                        {role === 'agency' && (
                            <>
                                <div className="flex flex-col">
                                    <label className={labelClasses}>Agency Name</label>
                                    <input type="text" name="agencyName" value={formData.agencyName} onChange={handleTextChange} required className={inputClasses} />
                                </div>
                                <div className="flex flex-col">
                                    <label className={labelClasses}>Fleet Size</label>
                                    <input type="number" name="fleetSize" value={formData.fleetSize} onChange={handleTextChange} className={inputClasses} />
                                </div>
                                <div className="flex flex-col md:col-span-2">
                                    <label className={labelClasses}>Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleTextChange} className={inputClasses} />
                                </div>
                            </>
                        )}
                    </div>

                    <button type="submit" className="mt-4 w-full rounded-xl bg-[#2D4A40] dark:bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1E332C]">
                        Save Profile Record
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;