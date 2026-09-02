const DosingEvent = require('../models/dosingEvent');

class DosingRepository {
  async save(data) {
    const event = new DosingEvent(data);
    return await event.save();
  }

  async getTodayStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Ponytail: agresi simpel di Mongoose langsung dijumlah
    const stats = await DosingEvent.aggregate([
      { $match: { timestamp: { $gte: startOfDay } } },
      { $group: { _id: "$chemical_type", total_ml: { $sum: "$dose_ml" } } }
    ]);

    const result = { pac_ml: 0, kaporit_ml: 0 };
    stats.forEach(stat => {
      if (stat._id === 'PAC') result.pac_ml = stat.total_ml;
      if (stat._id === 'Chlorine') result.kaporit_ml = stat.total_ml;
    });
    return result;
  }
}

module.exports = new DosingRepository();
