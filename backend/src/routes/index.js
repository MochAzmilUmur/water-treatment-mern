const express = require('express');
const router = express.Router();
const sensorRoutes = require('./sensorRoutes');

router.use('/sensor', sensorRoutes);

module.exports = router;
