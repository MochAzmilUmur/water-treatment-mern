const mongoose = require('mongoose');

const dosingEventSchema = new mongoose.Schema({
  device_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chemical_type: { type: String, enum: ['PAC', 'Chlorine'], required: true },
  dose_ml: Number,
  duration_sec: Number,
  condition_before: {
    ph: Number,
    tds: Number
  }
});

module.exports = mongoose.model('DosingEvent', dosingEventSchema);
