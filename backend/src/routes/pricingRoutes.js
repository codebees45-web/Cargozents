const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");

const pricingController = require("../controllers/pricingController");

router.post(
  "/calculate",
  protect,
  pricingController.calculatePrice
);

module.exports = router;