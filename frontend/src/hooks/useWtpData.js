import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export function useWtpData() {
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [dosingStats, setDosingStats] = useState({ pac_ml: 0, kaporit_ml: 0 });
  const [isConnected, setIsConnected] = useState(false);

  // 1. Ambil data awal dari API
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`${API_URL}/sensor/dashboard`);
        const { latest_telemetry, today_dosing } = response.data.data;
        
        if (isMounted) {
          setTelemetryHistory(latest_telemetry);
          if (latest_telemetry.length > 0) {
            setLatestData(latest_telemetry[0]);
          }
          setDosingStats(today_dosing);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Dengarkan update real-time via Socket.IO
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], // Fallback aman
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('telemetry_update', (newData) => {
      setLatestData(newData);
      
      setTelemetryHistory((prevHistory) => {
        // Tambahkan data baru ke awal array (descending order by timestamp)
        const updatedHistory = [newData, ...prevHistory];
        // Pertahankan maksimal 50 data
        if (updatedHistory.length > 50) {
          updatedHistory.pop();
        }
        return updatedHistory;
      });
    });

    // Cleanup saat unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    telemetryHistory,
    latestData,
    dosingStats,
    isConnected
  };
}
