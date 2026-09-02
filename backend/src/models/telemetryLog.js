const mongoose = require('mongoose');

const telemetryLogSchema = new mongoose.Schema({
  device_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sensors: {
    ph: Number,
    tds: Number,
    temperature: Number,
    turbidity: Number,
    volume_liter: Number
  },
  status: {
    is_safe: Boolean,
    is_stable: Boolean
  }
});

module.exports = mongoose.model('TelemetryLog', telemetryLogSchema);
