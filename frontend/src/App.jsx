import React from 'react';
import { useWtpData } from './hooks/useWtpData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrasi elemen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const { telemetryHistory, latestData, dosingStats, isConnected } = useWtpData();

  if (!latestData) {
    return (
      <div style={{ 
        padding: '2rem', 
        fontFamily: 'sans-serif', 
        color: '#0D47A1',
        backgroundColor: '#F0F4F8',
        minHeight: '100vh'
      }}>
        Loading WTP Dashboard...
      </div>
    );
  }

  const { sensors, status } = latestData;
  const isSafe = status?.is_safe;
  const isStable = status?.is_stable;

  // Persiapan data untuk Grafik
  // Jangan mutasi state asli, buat array baru lalu reverse agar waktu berjalan dari kiri ke kanan
  const chartDataReversed = [...telemetryHistory].reverse();
  
  const chartData = {
    labels: chartDataReversed.map(data => {
      const date = new Date(data.timestamp);
      // Format jam:menit (misal: 14:30)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [
      {
        label: 'pH Level',
        data: chartDataReversed.map(data => data.sensors.ph),
        borderColor: '#0D47A1',
        backgroundColor: '#BBDEFB',
        yAxisID: 'y', // Sumbu Y kiri untuk pH
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.2,
      },
      {
        label: 'TDS (ppm)',
        data: chartDataReversed.map(data => data.sensors.tds),
        borderColor: '#2E7D32',
        backgroundColor: '#BBDEFB',
        yAxisID: 'y1', // Sumbu Y kanan untuk TDS
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: '#0D47A1',
          font: { family: 'sans-serif', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#0D47A1',
        bodyColor: '#546E7A',
        borderColor: '#BBDEFB',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'pH Level',
          color: '#0D47A1',
        },
        suggestedMin: 0,
        suggestedMax: 14,
        grid: {
          color: '#E3F2FD',
        },
        ticks: {
          color: '#546E7A',
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'TDS (ppm)',
          color: '#2E7D32',
        },
        grid: {
          drawOnChartArea: false,
        },
        suggestedMin: 0,
        ticks: {
          color: '#546E7A',
        }
      },
      x: {
        grid: {
          color: '#E3F2FD',
        },
        ticks: {
          color: '#546E7A',
        }
      }
    }
  };

  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      backgroundColor: '#F0F4F8',
      minHeight: '100vh',
      margin: 0,
      padding: 0
    }}>
      
      <div style={{ width: '100%', padding: '2rem', boxSizing: 'border-box' }}>
      
        {/* Header & Indikator Koneksi WebSocket */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          backgroundColor: '#FFFFFF',
          border: '1px solid #BBDEFB',
          borderBottom: '1px solid #BBDEFB',
          borderRadius: '12px',
          padding: '1.2rem 1.8rem',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            color: '#0D47A1', 
            margin: 0, 
            fontSize: '1.8rem',
            fontWeight: '600',
            letterSpacing: '-0.5px'
          }}>
            WTP Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px', 
              height: '10px', 
              borderRadius: '50%',
              backgroundColor: isConnected ? '#2E7D32' : '#D32F2F',
              border: 'none'
            }} title={isConnected ? 'Connected' : 'Disconnected'} />
            <span style={{ 
              color: isConnected ? '#2E7D32' : '#D32F2F', 
              fontWeight: '600',
              fontSize: '0.9rem',
              letterSpacing: '1px'
            }}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </header>

        {/* Grid Kartu Indikator */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          
          {/* 1. Kartu Status WTP */}
          <div style={{ 
            padding: '1.8rem', 
            backgroundColor: '#FFFFFF',
            border: '1px solid #BBDEFB',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <h2 style={{ 
              color: '#0D47A1', 
              fontSize: '1.2rem', 
              margin: 0,
              fontWeight: '600',
              letterSpacing: '-0.3px'
            }}>
              Status Air
            </h2>
            <div style={{ 
              fontSize: '1rem', 
              color: '#546E7A',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Kondisi</span>
              <strong style={{ 
                color: isSafe ? '#2E7D32' : '#D32F2F',
                fontWeight: '600',
                backgroundColor: isSafe ? '#E8F5E9' : '#FFEBEE',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.9rem'
              }}>
                {isSafe ? 'Aman (Safe)' : 'Bahaya (Unsafe)'}
              </strong>
            </div>
            <div style={{ 
              fontSize: '1rem', 
              color: '#546E7A',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Kestabilan</span>
              <strong style={{ 
                color: isStable ? '#0D47A1' : '#F57C00',
                fontWeight: '600',
                backgroundColor: isStable ? '#E3F2FD' : '#FFF3E0',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.9rem'
              }}>
                {isStable ? 'Stabil' : 'Tidak Stabil'}
              </strong>
            </div>
          </div>

          {/* 2. Kartu Indikator Sensor */}
          <div style={{ 
            padding: '1.8rem', 
            backgroundColor: '#FFFFFF',
            border: '1px solid #BBDEFB',
            borderRadius: '12px'
          }}>
            <h2 style={{ 
              color: '#0D47A1', 
              fontSize: '1.2rem', 
              margin: 0,
              marginBottom: '1.5rem',
              fontWeight: '600',
              letterSpacing: '-0.3px'
            }}>
              Indikator Terakhir
            </h2>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ 
                textAlign: 'center',
                flex: 1,
                padding: '1.2rem 0.5rem',
                backgroundColor: '#F8FBFF',
                borderRadius: '8px',
                border: '1px solid #E3F2FD'
              }}>
                <div style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: '700', 
                  color: '#0D47A1',
                  lineHeight: '1.2',
                  letterSpacing: '-0.5px'
                }}>
                  {sensors.ph?.toFixed(2)}
                </div>
                <div style={{ 
                  color: '#546E7A', 
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  marginTop: '0.3rem'
                }}>
                  pH Level
                </div>
              </div>
              <div style={{ 
                textAlign: 'center',
                flex: 1,
                padding: '1.2rem 0.5rem',
                backgroundColor: '#F8FBFF',
                borderRadius: '8px',
                border: '1px solid #E3F2FD'
              }}>
                <div style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: '700', 
                  color: '#0D47A1',
                  lineHeight: '1.2',
                  letterSpacing: '-0.5px'
                }}>
                  {sensors.tds}
                </div>
                <div style={{ 
                  color: '#546E7A', 
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  marginTop: '0.3rem'
                }}>
                  TDS (ppm)
                </div>
              </div>
            </div>
          </div>

          {/* 3. Kartu Statistik Dosing PAC & Kaporit */}
          <div style={{ 
            padding: '1.8rem', 
            backgroundColor: '#FFFFFF',
            border: '1px solid #BBDEFB',
            borderRadius: '12px'
          }}>
            <h2 style={{ 
              color: '#0D47A1', 
              fontSize: '1.2rem', 
              margin: 0,
              marginBottom: '1.5rem',
              fontWeight: '600',
              letterSpacing: '-0.3px'
            }}>
              Akumulasi Dosis (Hari Ini)
            </h2>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8rem 1rem',
                backgroundColor: '#F8FBFF',
                borderRadius: '8px',
                border: '1px solid #E3F2FD'
              }}>
                <span style={{ color: '#546E7A', fontSize: '0.95rem' }}>PAC</span>
                <strong style={{ color: '#0D47A1', fontSize: '1.1rem' }}>
                  {dosingStats.pac_ml} mL
                </strong>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8rem 1rem',
                backgroundColor: '#F8FBFF',
                borderRadius: '8px',
                border: '1px solid #E3F2FD'
              }}>
                <span style={{ color: '#546E7A', fontSize: '0.95rem' }}>Kaporit (Chlorine)</span>
                <strong style={{ color: '#0D47A1', fontSize: '1.1rem' }}>
                  {dosingStats.kaporit_ml} mL
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Box Grafik Line Chart */}
        <div style={{ 
          padding: '1.8rem', 
          backgroundColor: '#FFFFFF',
          border: '1px solid #BBDEFB',
          borderRadius: '12px'
        }}>
          <h2 style={{ 
            color: '#0D47A1', 
            fontSize: '1.3rem', 
            margin: 0,
            marginBottom: '1.5rem',
            fontWeight: '600',
            letterSpacing: '-0.3px'
          }}>
            Grafik Kualitas Air
          </h2>
          <Line data={chartData} options={chartOptions} />
        </div>

      </div>
    </div>
  );
}

export default App;