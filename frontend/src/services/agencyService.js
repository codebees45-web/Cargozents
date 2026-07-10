import api from './api';

export const getDashboardStats = () => api.get('/agency/dashboard');

export const getFleetDrivers = () => api.get('/agency/drivers');

export const addFleetDriver = (phone) => api.post('/agency/drivers', { phone });

export const removeFleetDriver = (driverId) => api.delete(`/agency/drivers/${driverId}`);

// Every vehicle belonging to a driver in this agency's fleet, with
// location state — used to populate the fleet tracking list/map.
export const getFleetVehicles = () => api.get('/agency/vehicles');

// Manual GPS fallback: agency staff sets a vehicle's position by hand for
// a driver who has no smartphone (and so can never share live location
// themselves via the browser Geolocation flow).
export const setVehicleLocation = (vehicleId, coordinates) =>
  api.patch(`/agency/vehicles/${vehicleId}/location`, { coordinates });