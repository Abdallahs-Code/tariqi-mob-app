const express = require('express');
const { createRide, getRides, requestRide, getPendingRequests, respondToJoinRequest, leaveRide, cancelRide } = require('../controllers/rides');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/create', protect, createRide);

router.get('/', protect, getRides);

router.post('/request/:rideId', protect, requestRide);

router.get('/pending/:rideId', protect, getPendingRequests);

router.post('/respond/:requestId', protect, respondToJoinRequest);

router.post('/leave/:rideId', protect, leaveRide);

router.post('/cancel/:rideId', protect, cancelRide);

module.exports = router;