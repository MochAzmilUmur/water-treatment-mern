class RecordSensorDataUseCase {
  constructor(sensorRepository, dosingRepository, socketService) {
    this.sensorRepository = sensorRepository;
    this.dosingRepository = dosingRepository;
    this.socketService = socketService;
  }

  async execute(payload) {
    const { device_id, sensors, pac_dose_ml, kaporit_dose_ml } = payload;
    const { ph, tds } = sensors;

    const is_safe = ph >= 6.5 && ph <= 8.5;
    const is_stable = is_safe && tds <= 475;

    const telemetryData = {
      device_id,
      sensors,
      status: { is_safe, is_stable }
    };

    const savedData = await this.sensorRepository.save(telemetryData);
    this.socketService.broadcastTelemetry(savedData);

    // Ponytail: Cek dosing dan catat as-is tanpa membebani logic telemetry.
    const condition_before = { ph, tds };
    
    if (pac_dose_ml > 0) {
      await this.dosingRepository.save({
        device_id,
        chemical_type: 'PAC',
        dose_ml: pac_dose_ml,
        condition_before
      });
    }

    if (kaporit_dose_ml > 0) {
      await this.dosingRepository.save({
        device_id,
        chemical_type: 'Chlorine',
        dose_ml: kaporit_dose_ml,
        condition_before
      });
    }

    return savedData;
  }
}

module.exports = RecordSensorDataUseCase;
