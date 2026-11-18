# Water Treatment Monitoring System

Sistem pemantauan kualitas air dan pencatatan dosing bahan kimia untuk instalasi Water Treatment Plant (WTP). Perangkat sensor mengirim data melalui MQTT, backend menyimpannya ke MongoDB, dan dashboard React menampilkan kondisi terbaru secara real-time melalui Socket.IO.

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Konfigurasi](#konfigurasi)
- [Menjalankan dengan Docker Compose](#menjalankan-dengan-docker-compose)
- [Menjalankan Secara Manual](#menjalankan-secara-manual)
- [Format Data Sensor](#format-data-sensor)
- [Referensi API](#referensi-api)
- [Model Data](#model-data)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## Gambaran Umum

Proyek ini terdiri dari empat komponen:

1. **Perangkat atau publisher MQTT** yang mengirim pembacaan sensor ke topik `wtp/sensor/data`.
2. **Backend Node.js** yang berlangganan topik tersebut, mengevaluasi status air, menyimpan telemetri dan event dosing, lalu menyiarkan data baru ke klien.
3. **MongoDB** sebagai penyimpanan telemetri dan event dosing.
4. **Frontend React** yang menampilkan status air, nilai sensor terakhir, akumulasi dosing harian, dan grafik riwayat.

Evaluasi status air dilakukan di backend:

- `is_safe` bernilai benar jika pH berada pada rentang 6.5 sampai 8.5.
- `is_stable` bernilai benar jika air aman dan nilai TDS tidak melebihi 475 ppm.

## Fitur

- Penerimaan data sensor melalui MQTT.
- Penyimpanan riwayat telemetri beserta status kelayakan air.
- Pencatatan event dosing PAC dan kaporit (Chlorine) beserta kondisi air sebelum dosing.
- Penyiaran data terbaru ke seluruh klien melalui Socket.IO.
- Endpoint REST untuk mengambil data dashboard dan mengirim data sensor.
- Dashboard dengan indikator koneksi, ringkasan sensor terakhir, akumulasi dosing harian, dan grafik 50 data terakhir.

## Arsitektur

```text
Sensor / MQTT Publisher
          |
          |  publish  wtp/sensor/data
          v
   Mosquitto Broker
          |
          |  subscribe
          v
   Backend (Express + MQTT client)
          |            \
          |             \  emit  telemetry_update
          |              v
          |        Frontend (React + Socket.IO client)
          v
       MongoDB

Frontend juga mengambil data awal melalui GET /api/sensor/dashboard.
```

## Teknologi

| Komponen | Teknologi |
| --- | --- |
| Frontend | React 19, Vite, Chart.js, react-chartjs-2, axios, socket.io-client |
| Backend | Node.js, Express 5, Mongoose, mqtt, socket.io |
| Database | MongoDB |
| Message broker | Eclipse Mosquitto |
| Container | Docker, Docker Compose, Nginx |

## Struktur Proyek

```text
water-treatment-mern/
├── backend/
│   ├── server.js                  # Entry point: Express, Socket.IO, MQTT
│   ├── Dockerfile
│   └── src/
│       ├── config/database.js     # Koneksi MongoDB
│       ├── controllers/           # HTTP handler
│       ├── models/                # Skema Mongoose
│       ├── repositories/          # Akses data
│       ├── routes/                # Definisi endpoint
│       ├── services/              # Klien MQTT dan Socket.IO
│       └── usecases/              # Logika bisnis
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Halaman dashboard
│   │   └── hooks/useWtpData.js    # Pengambilan data REST dan Socket.IO
│   ├── Dockerfile
│   └── vite.config.js
├── mosquitto/config/mosquitto.conf
└── docker-compose.yaml
```

Backend mengikuti pemisahan tanggung jawab berbasis use case: controller menangani HTTP, use case menangani aturan bisnis, repository menangani database, dan service menangani transport MQTT serta Socket.IO. Use case yang sama dipakai oleh jalur HTTP dan jalur MQTT.

## Prasyarat

Untuk menjalankan dengan Docker:

- Docker Engine 20.10 atau lebih baru
- Docker Compose v2

Untuk menjalankan secara manual:

- Node.js 20 atau lebih baru
- MongoDB
- Mosquitto atau broker MQTT lain yang kompatibel

## Konfigurasi

Berkas contoh konfigurasi tersedia di `backend/.env.example` dan `frontend/.env.example`. Salin berkas tersebut menjadi `.env` pada folder yang sesuai sebelum menjalankan aplikasi secara manual. Berkas `.env` tidak disertakan ke dalam repositori.

### Backend

Konfigurasi dibaca dari variabel lingkungan. Variabel berikut memiliki nilai bawaan yang ditujukan untuk Docker Compose:

| Variabel | Bawaan | Keterangan |
| --- | --- | --- |
| `PORT` | `5000` | Port HTTP backend |
| `MONGO_URI` | `mongodb://mongodb:27017/wtp_db` | URI koneksi MongoDB |
| `MQTT_BROKER` | `mqtt://mosquitto:1883` | URL broker MQTT |

Jika dijalankan di luar Docker, arahkan kedua URI ke `localhost`:

```bash
MONGO_URI=mongodb://localhost:27017/wtp_db \
MQTT_BROKER=mqtt://localhost:1883 \
npm start
```

### Frontend

Frontend membaca konfigurasi dari berkas `frontend/.env`:

| Variabel | Contoh | Keterangan |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | Basis URL API |
| `VITE_SOCKET_URL` | `http://localhost:5000` | URL server Socket.IO |

Nilai tersebut diambil saat proses build. Jika dashboard diakses dari mesin atau domain lain, sesuaikan nilainya sebelum menjalankan build.

## Menjalankan dengan Docker Compose

```bash
docker compose up --build
```

Layanan yang tersedia setelah kontainer berjalan:

| Layanan | Alamat |
| --- | --- |
| Dashboard | http://localhost |
| API backend | http://localhost:5000/api |
| MQTT broker | `localhost:1883` |
| MongoDB | `localhost:27017` |

Konfigurasi Mosquitto saat ini mengizinkan koneksi anonim pada port 1883. Konfigurasi ini hanya sesuai untuk pengembangan atau jaringan tepercaya. Untuk penggunaan produksi, aktifkan autentikasi dan sesuaikan `mosquitto/config/mosquitto.conf`.

Hentikan layanan dengan:

```bash
docker compose down
```

Data MongoDB disimpan pada volume `wtp_mongo_data` sehingga tetap ada setelah kontainer dihentikan. Untuk menghapus data tersebut, jalankan `docker compose down -v`.

## Menjalankan Secara Manual

### Backend

```bash
cd backend
npm install
npm start
```

Backend berjalan pada `http://localhost:5000` dan langsung mencoba terhubung ke MongoDB serta broker MQTT.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite menyajikan aplikasi pada `http://localhost:5173`. Perintah lain yang tersedia:

| Perintah | Keterangan |
| --- | --- |
| `npm run build` | Membuat build produksi ke folder `dist` |
| `npm run preview` | Menjalankan hasil build secara lokal |
| `npm run lint` | Menjalankan Oxlint |

## Format Data Sensor

Publisher mengirim pesan JSON ke topik `wtp/sensor/data`:

```json
{
  "device_id": "wtp-01",
  "sensors": {
    "ph": 7.2,
    "tds": 320,
    "temperature": 27.5,
    "turbidity": 2.1,
    "volume_liter": 1200
  },
  "pac_dose_ml": 15,
  "kaporit_dose_ml": 5
}
```

Ketentuan pemrosesan:

- `device_id` wajib diisi.
- `sensors.ph` dan `sensors.tds` dipakai untuk menentukan `is_safe` dan `is_stable`.
- `sensors.temperature`, `sensors.turbidity`, dan `sensors.volume_liter` hanya disimpan jika dikirim.
- Event dosing hanya dibuat jika `pac_dose_ml` atau `kaporit_dose_ml` lebih besar dari nol.

Setelah data disimpan, backend menyiarkan objek telemetri tersimpan ke klien melalui event Socket.IO `telemetry_update`.

## Referensi API

Basis URL: `http://localhost:5000/api`

### GET /sensor/dashboard

Mengembalikan 50 data telemetri terbaru dan akumulasi dosing hari ini.

Contoh respons:

```json
{
  "success": true,
  "data": {
    "latest_telemetry": [
      {
        "_id": "64f0c2a1e4b0a1b2c3d4e5f6",
        "device_id": "wtp-01",
        "timestamp": "2026-11-18T06:30:00.000Z",
        "sensors": {
          "ph": 7.2,
          "tds": 320,
          "temperature": 27.5,
          "turbidity": 2.1,
          "volume_liter": 1200
        },
        "status": {
          "is_safe": true,
          "is_stable": true
        }
      }
    ],
    "today_dosing": {
      "pac_ml": 150,
      "kaporit_ml": 45
    }
  }
}
```

### POST /sensor

Menerima data sensor dengan format yang sama seperti payload MQTT. Endpoint ini berguna untuk pengujian tanpa perangkat.

```bash
curl -X POST http://localhost:5000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "wtp-01",
    "sensors": { "ph": 7.2, "tds": 320 },
    "pac_dose_ml": 15,
    "kaporit_dose_ml": 0
  }'
```

Respons berhasil menggunakan status `201`:

```json
{
  "success": true,
  "data": {
    "device_id": "wtp-01",
    "sensors": { "ph": 7.2, "tds": 320 },
    "status": { "is_safe": true, "is_stable": true },
    "timestamp": "2026-11-18T06:30:00.000Z"
  }
}
```

Jika pemrosesan gagal, respons menggunakan status `400` dengan bentuk `{ "success": false, "message": "..." }`.

## Model Data

### TelemetryLog

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `device_id` | String | Wajib, identitas perangkat |
| `timestamp` | Date | Waktu pencatatan, bawaan waktu server |
| `sensors` | Object | `ph`, `tds`, `temperature`, `turbidity`, `volume_liter` |
| `status` | Object | `is_safe`, `is_stable` |

### DosingEvent

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `device_id` | String | Wajib, identitas perangkat |
| `timestamp` | Date | Waktu pencatatan, bawaan waktu server |
| `chemical_type` | String | Wajib, salah satu dari `PAC` atau `Chlorine` |
| `dose_ml` | Number | Volume dosing dalam mililiter |
| `duration_sec` | Number | Durasi dosing dalam detik, belum diisi oleh proses saat ini |
| `condition_before` | Object | Nilai `ph` dan `tds` sebelum dosing |

## Kontribusi

1. Buat branch baru dari `main`.
2. Terapkan perubahan secara terfokus dan sertakan pengujian bila relevan.
3. Pastikan `npm run lint` pada folder `frontend` berjalan tanpa kesalahan.
4. Ajukan pull request dengan penjelasan perubahan dan cara memverifikasinya.

## Lisensi

Proyek ini dilisensikan di bawah MIT License. Lihat berkas [LICENSE](LICENSE) untuk teks lengkap lisensi.
