import api from "./api";

const orderService = {
  /**
   * Create Order
   */
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  /**
   * Logged-in Buyer's Orders
   */
  getMyOrders: async () => {
    const response = await api.get("/orders/my-orders");
    return response.data;
  },

  /**
   * Single Order
   */
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Cancel Order
   */
  cancelOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  /**
   * Update Status
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, {
      status,
    });

    return response.data;
  },

  /**
   * Assign Driver
   */
  assignDriver: async (id, driverId) => {
    const response = await api.patch(
      `/orders/${id}/assign-driver`,
      {
        driverId,
      }
    );

    return response.data;
  },

  /**
   * Generate Delivery OTP
   */
  generateOTP: async (id) => {
    const response = await api.post(
      `/orders/${id}/generate-otp`
    );

    return response.data;
  },
};

export default orderService;

/**
 * NOTE: these are named exports (not part of the orderService object above)
 * because BuyerOrderTracking.jsx and ShipperOrders.jsx import them by name.
 * The backend routes/controllers for these do NOT exist yet
 * (checked orderRoutes.js / orderController.js) — these calls will 404
 * until matching backend endpoints are added.
 */

export const getOrderTracking = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/tracking`);
  return response.data; // expected shape: { order, tracking }
};

export const getReceivedOrders = async () => {
  return api.get("/orders/received"); // returns full axios response — caller destructures { data }
};

export const confirmOrder = async (orderId) => {
  return api.patch(`/orders/${orderId}/confirm`); // returns full axios response — caller destructures { data }
};