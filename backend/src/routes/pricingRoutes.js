const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const pricingController = require("../controllers/pricingController");

router.post(
  "/calculate",
  auth,
  pricingController.calculatePrice
);

module.exports = router;