const axios = require("axios");

exports.getDistance = async (req, res) => {
  try {
    const {
      pickupLat,
      pickupLng,
      deliveryLat,
      deliveryLng,
    } = req.body;

    if (
      pickupLat == null ||
      pickupLng == null ||
      deliveryLat == null ||
      deliveryLng == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Pickup and delivery coordinates are required.",
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "GOOGLE_MAPS_API_KEY is missing in .env",
      });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${deliveryLat},${deliveryLng}&key=${apiKey}`;

    const response = await axios.get(url);

    const element = response.data.rows[0].elements[0];

    if (element.status !== "OK") {
      return res.status(400).json({
        success: false,
        message: "Unable to calculate distance.",
      });
    }

    return res.json({
      success: true,
      distance: element.distance.value / 1000,
      distanceText: element.distance.text,
      duration: element.duration.value,
      durationText: element.duration.text,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};