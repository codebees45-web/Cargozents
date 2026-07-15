import api from "./api";

/**
 * Create Order
 */
export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

/**
 * Logged-in Buyer's Orders
 */
export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};

/**
 * Single Order
 */
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

/**
 * Order Tracking
 */
export const getOrderTracking = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

/**
 * Cancel Order
 */
export const cancelOrder = async (id) => {
  const response = await api.patch(`/orders/${id}/cancel`);
  return response.data;
};

/**
 * Update Status
 */
export const updateStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, {
    status,
  });

  return response.data;
};

/**
 * Assign Driver
 */
export const assignDriver = async (id, driverId) => {
  const response = await api.patch(`/orders/${id}/assign-driver`, {
    driverId,
  });

  return response.data;
};

/**
 * Generate OTP
 */
export const generateOTP = async (id) => {
  const response = await api.post(`/orders/${id}/generate-otp`);
  return response.data;
};

/**
 * Shipper Orders
 */
export const getReceivedOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};

/**
 * Confirm Order
 */
export const confirmOrder = async (id) => {
  const response = await api.patch(`/orders/${id}/status`, {
    status: "Confirmed",
  });

  return response.data;
};

/**
 * Default export (keeps old code working)
 */
const orderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderTracking,
  cancelOrder,
  updateStatus,
  assignDriver,
  generateOTP,
  getReceivedOrders,
  confirmOrder,
};

export default orderService;