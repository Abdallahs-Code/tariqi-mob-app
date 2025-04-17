const express = require('express');
const { createRide, getRides, requestRide, respondToJoinRequest } = require('../controllers/rides');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/create', protect, createRide);

router.get('/', protect, getRides);

router.post('/request/:rideId', protect, requestRide);

router.post('/respond/:requestId', protect, respondToJoinRequest);

module.exports = router;