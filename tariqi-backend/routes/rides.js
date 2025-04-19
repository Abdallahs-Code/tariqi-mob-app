const express = require('express');
const { driverCreateRide, clientGetRides, clientRequestRide, driverGetPendingRequests, driverRespondToRequest, clientGetRequestStatus, clientEndRide, driverEndRide } = require('../controllers/rides');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/driver/create/ride', protect, driverCreateRide);

router.get('/client/get/rides', protect, clientGetRides);

router.post('/client/request/ride/:rideId', protect, clientRequestRide);

router.get('/driver/get/pending/requests/:rideId', protect, driverGetPendingRequests);

router.post('/driver/respond/to/requests/:requestId', protect, driverRespondToRequest);

router.get('/client/get/request/status/:requestId', protect, clientGetRequestStatus);

router.post('/client/end/ride/:rideId', protect, clientEndRide);

router.post('/driver/end/ride/:rideId', protect, driverEndRide);

module.exports = router;