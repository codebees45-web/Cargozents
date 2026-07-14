const dbWrapper = require('../clients/dbWrapperClient');

/**
 * GET /api/shipment-analytics
 * Proxies to the PostgreSQL DB Wrapper's paginated/filtered shipment list.
 * Query params (page, limit, sortBy, order, search, status, shipper_name,
 * pickup_city, drop_city) are passed straight through.
 */
const getShipmentList = async (req, res, next) => {
  try {
    const response = await dbWrapper.get('/api/shipments', { params: req.query });
    res.status(200).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
};

/**
 * GET /api/shipment-analytics/summary
 * Proxies to the PostgreSQL DB Wrapper's aggregation endpoint.
 */
const getShipmentSummary = async (req, res, next) => {
  try {
    const response = await dbWrapper.get('/api/shipments/stats/summary');
    res.status(200).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
};

module.exports = { getShipmentList, getShipmentSummary };