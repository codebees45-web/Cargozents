const Truck = require('../models/Truck'); // Assuming you have a Truck model

exports.getAvailableTrucks = async (req, res) => {
  try {
    // Find trucks belonging to this specific logged-in agency that are available
    const availableTrucks = await Truck.find({ 
      agency: req.user._id, 
      status: 'available' 
    });
    
    res.status(200).json(availableTrucks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching trucks' });
  }
};