const TelemetryLog = require('../models/telemetryLog');

class SensorRepository {
  async save(data) {
    const telemetry = new TelemetryLog(data);
    return await telemetry.save();
  }

  async getLatest(limit = 50) {
    return await TelemetryLog.find().sort({ timestamp: -1 }).limit(limit);
  }
}

module.exports = new SensorRepository();
