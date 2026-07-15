const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const mapsController = require("../controllers/mapsController");

router.post(
  "/distance",
  auth,
  mapsController.getDistance
);

module.exports = router;