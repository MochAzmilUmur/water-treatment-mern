class SensorController {
  constructor(recordSensorDataUseCase, getDashboardDataUseCase) {
    this.recordSensorDataUseCase = recordSensorDataUseCase;
    this.getDashboardDataUseCase = getDashboardDataUseCase;
  }

  async recordData(req, res) {
    try {
      const result = await this.recordSensorDataUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getDashboard(req, res) {
    try {
      const result = await this.getDashboardDataUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = SensorController;
