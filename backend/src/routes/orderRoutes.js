const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

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
  auth,
  validateOrder,
  orderController.createOrder
);

// Get Logged-in User Orders
router.get(
  "/my-orders",
  auth,
  orderController.getMyOrders
);

// Get Single Order
router.get(
  "/:id",
  auth,
  orderController.getOrderById
);

// Cancel Order
router.patch(
  "/:id/cancel",
  auth,
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
  auth,
  orderController.assignDriver
);

// Update Status
router.patch(
  "/:id/status",
  auth,
  orderController.updateOrderStatus
);

// Generate Delivery OTP
router.post(
  "/:id/generate-otp",
  auth,
  orderController.generateOTP
);

module.exports = router;