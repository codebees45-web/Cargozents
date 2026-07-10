import api from './api';

export const getMyOrders = () => api.get('/orders/mine');

export const getReceivedOrders = () => api.get('/orders/received');

export const confirmOrder = (id) => api.patch(`/orders/${id}/confirm`);

export const getOrderById = (id) => api.get(`/orders/${id}`);

// Order tracking is really shipment tracking underneath — an order gets a
// `shipment` id once the Shipper requests a truck for it. The backend's
// GET /shipments/:id/track already authorizes buyers whose order points at
// that shipment (see shipmentController.getShipmentTracking), so the buyer
// UI just needs the order first to read `order.shipment`.
export const getOrderTracking = async (orderId) => {
  const { data: orderRes } = await getOrderById(orderId);
  const order = orderRes.order;
  if (!order?.shipment) {
    return { order, tracking: null };
  }
  const { data: trackRes } = await api.get(`/shipments/${order.shipment}/track`);
  return { order, tracking: trackRes.tracking };
};