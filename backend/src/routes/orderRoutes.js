const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createOrder, getMyOrders, getReceivedOrders, confirmOrder, getOrderById } = require('../controllers/orderController');

const router = express.Router();

router.use(protect);

router.post('/', authorize('buyer'), createOrder);
router.get('/mine', authorize('buyer'), getMyOrders);
router.get('/received', authorize('shipper', 'agency'), getReceivedOrders);
router.patch('/:id/confirm', authorize('shipper'), confirmOrder);
router.get('/:id', getOrderById);

module.exports = router;