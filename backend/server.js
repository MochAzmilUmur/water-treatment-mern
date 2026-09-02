require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

const connectDB = require('./src/config/database');
const routes = require('./src/routes');

const socketService = require('./src/services/socketService');
const mqttService = require('./src/services/mqttService');
const sensorRepository = require('./src/repositories/sensorRepository');
const dosingRepository = require('./src/repositories/dosingRepository');
const RecordSensorDataUseCase = require('./src/usecases/recordSensorData');

// Connect to DB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

const server = http.createServer(app);

// Inisialisasi Socket.IO
socketService.init(server);

// Inisialisasi MQTT dengan menyuntikkan UseCase yang telah diperbarui
const recordSensorUseCase = new RecordSensorDataUseCase(sensorRepository, dosingRepository, socketService);
mqttService.init(recordSensorUseCase);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVER] Backend API berjalan di port ${PORT}`);
});
