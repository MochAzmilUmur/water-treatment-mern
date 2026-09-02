class GetDashboardDataUseCase {
  constructor(sensorRepository, dosingRepository) {
    this.sensorRepository = sensorRepository;
    this.dosingRepository = dosingRepository;
  }

  async execute() {
    // Jalankan operasi DB secara paralel (lazy tapi efisien)
    const [latest_telemetry, today_dosing] = await Promise.all([
      this.sensorRepository.getLatest(50),
      this.dosingRepository.getTodayStats()
    ]);

    return {
      latest_telemetry,
      today_dosing
    };
  }
}

module.exports = GetDashboardDataUseCase;
