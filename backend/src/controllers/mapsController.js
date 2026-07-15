const {
  calculateDistance,
} = require("../services/mapsService");

exports.getDistance = async (req, res) => {
  try {
    const {
      pickupLat,
      pickupLng,
      deliveryLat,
      deliveryLng,
    } = req.body;

    const result = await calculateDistance(
      pickupLat,
      pickupLng,
      deliveryLat,
      deliveryLng
    );

    return res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};