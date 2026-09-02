// PONYTAIL: Membungkus Socket.IO. Tidak ada logika bisnis di sini.
const { Server } = require('socket.io');

class SocketService {
  constructor() {
    this.io = null;
  }

  init(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`[SOCKET] Client connected: ${socket.id}`);
      socket.on('disconnect', () => {
        console.log(`[SOCKET] Client disconnected: ${socket.id}`);
      });
    });
  }

  broadcastTelemetry(data) {
    if (this.io) {
      this.io.emit('telemetry_update', data);
    }
  }
}

module.exports = new SocketService(); // Singleton
