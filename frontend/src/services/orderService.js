import api from './api';

export const getReceivedOrders = () => api.get('/orders/received');

export const confirmOrder = (id) => api.patch(`/orders/${id}/confirm`);

export const getOrderById = (id) => api.get(`/orders/${id}`);