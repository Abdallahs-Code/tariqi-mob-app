const express = require('express');
const { clientGetInfo, driverGetInfo } = require('../controllers/general');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/client/get/info', protect, clientGetInfo);

router.get('/driver/get/info', protect, driverGetInfo);

module.exports = router;