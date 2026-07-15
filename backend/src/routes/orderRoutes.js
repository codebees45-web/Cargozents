const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");

const orderController = require("../controllers/orderController");
const validateOrder = require("../middleware/validateOrder");

/*
|--------------------------------------------------------------------------
| Buyer Routes
|--------------------------------------------------------------------------
*/

// Create Order
router.post(
  "/",
  protect,
  validateOrder,
  orderController.createOrder
);

// Get Logged-in User Orders
router.get(
  "/my-orders",
  protect,
  orderController.getMyOrders
);

// Get Single Order
router.get(
  "/:id",
  protect,
  orderController.getOrderById
);

// Cancel Order
router.patch(
  "/:id/cancel",
  protect,
  orderController.cancelOrder
);

/*
|--------------------------------------------------------------------------
| Driver/Admin Routes
|--------------------------------------------------------------------------
*/

// Assign Driver
router.patch(
  "/:id/assign-driver",
  protect,
  orderController.assignDriver
);

// Update Status
router.patch(
  "/:id/status",
  protect,
  orderController.updateOrderStatus
);

// Generate Delivery OTP
router.post(
  "/:id/generate-otp",
  protect,
  orderController.generateOTP
);

module.exports = router;