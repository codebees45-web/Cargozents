const {
  calculatePricing,
} = require("../services/pricingService");

exports.calculatePrice = async (req, res) => {
  try {
    const pricing = calculatePricing(req.body);

    return res.json({
      success: true,
      pricing,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};