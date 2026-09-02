const mqtt = require('mqtt');

class MqttService {
  constructor() {
    this.client = null;
    this.recordSensorDataUseCase = null;
  }

  // Inject UseCase agar MQTT bertindak seperti Controller
  init(recordSensorDataUseCase) {
    this.recordSensorDataUseCase = recordSensorDataUseCase;
    
    const brokerUrl = process.env.MQTT_BROKER || 'mqtt://mosquitto:1883';
    this.client = mqtt.connect(brokerUrl);

    this.client.on('connect', () => {
      console.log(`[MQTT] Connected to Broker at ${brokerUrl}`);
      this.client.subscribe('wtp/sensor/data', (err) => {
        if (!err) {
          console.log('[MQTT] Subscribed to topic: wtp/sensor/data');
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      if (topic === 'wtp/sensor/data') {
        try {
          const payload = JSON.parse(message.toString());
          // Langsung lempar ke Use Case (seperti req.body di Express)
          await this.recordSensorDataUseCase.execute(payload);
        } catch (error) {
          console.error('[MQTT] Error processing message:', error.message);
        }
      }
    });

    this.client.on('error', (err) => {
      console.error('[MQTT] Connection error:', err);
    });
  }
}

module.exports = new MqttService();
