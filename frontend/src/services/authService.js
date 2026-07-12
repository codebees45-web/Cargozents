import axios from 'axios';
import api from './api';

// 🚀 FIX: Changed this line to point explicitly to your Supabase db-service on port 5002!
export const registerUser = (payload) => axios.post('http://localhost:5002/api/auth/signup', payload);

export const verifyOtp = (payload) => api.post('/auth/verify-otp', payload);
export const resendOtp = (payload) => api.post('/auth/resend-otp', payload);
export const loginUser = (payload) => axios.post('http://localhost:5002/api/auth/login', payload);
export const forgotPassword = (payload) => api.post('/auth/forgot-password', payload);
export const resetPassword = (payload) => api.post('/auth/reset-password', payload);
export const completeProfile = (payload) => api.patch('/auth/complete-profile', payload);

// Your profile functions (pointing to your standard API setup)
export const updateProfile = (userId, payload) => {
  return api.patch(`/auth/update-profile/${userId}`, payload);
};

export const getProfile = (userId) => {
  return api.get(`/auth/${userId}`);
};