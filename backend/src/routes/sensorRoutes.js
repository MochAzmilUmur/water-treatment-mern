const express = require('express');
const router = express.Router();

const sensorRepository = require('../repositories/sensorRepository');
const dosingRepository = require('../repositories/dosingRepository');
const socketService = require('../services/socketService');

const RecordSensorDataUseCase = require('../usecases/recordSensorData');
const GetDashboardDataUseCase = require('../usecases/getDashboardData');
const SensorController = require('../controllers/sensorController');

// Injection
const recordUseCase = new RecordSensorDataUseCase(sensorRepository, dosingRepository, socketService);
const dashboardUseCase = new GetDashboardDataUseCase(sensorRepository, dosingRepository);
const controller = new SensorController(recordUseCase, dashboardUseCase);

// Routes (Ponytail: routing sederhana yang meneruskan req, res ke pengikat Controller)
router.get('/dashboard', (req, res) => controller.getDashboard(req, res));
router.post('/', (req, res) => controller.recordData(req, res));

module.exports = router;
