# ☀️ SolarEdge Management System
**MERN Stack Solar Panel Management System**

## 🚀 Features
1. **Real-Time Dashboard** — Live kW output via Socket.IO, hourly charts, system health
2. **Solar Panel Management** — Full CRUD, array grouping, live status updates
3. **Energy Analytics** — Date range filters, daily/monthly charts, panel comparison table
4. **Smart Alerts System** — Auto-generated alerts, mark read/resolve, critical/warning/info types
5. **Settings & Configuration** — Thresholds, inverter config, billing rates, email notifications

## 📦 Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Chart.js, Socket.IO client |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB Atlas |
| Auth | JWT |
| Real-time | Socket.IO + node-cron |

---

## ⚙️ Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
```
`.env` file is already configured with your MongoDB URL.

#### Seed the database (first time only)
```bash
npm run seed
```
This creates:
- Admin user: `admin@solar.com` / `admin123`
- 10 solar panels with sample data
- 7 days of hourly energy readings
- Sample alerts

#### Start backend
```bash
npm run dev      # Development (with nodemon)
npm start        # Production
```
Backend runs on: **http://localhost:5000**

---

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: **http://localhost:3000**

---

## 📁 Project Structure
```
solar-management-system/
├── backend/
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   ├── Panel.js
│   │   ├── EnergyReading.js
│   │   ├── Alert.js
│   │   └── Settings.js
│   ├── routes/          # Express API routes
│   │   ├── authRoutes.js
│   │   ├── panelRoutes.js
│   │   ├── readingRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── settingsRoutes.js
│   ├── middleware/
│   │   └── auth.js      # JWT middleware
│   ├── config/
│   │   └── seed.js      # Database seeder
│   ├── .env             # Environment variables
│   └── server.js        # Main server + Socket.IO
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Panels.jsx
        │   ├── Analytics.jsx
        │   ├── Alerts.jsx
        │   └── Settings.jsx
        ├── components/common/
        │   ├── Sidebar.jsx
        │   └── Layout.jsx
        ├── context/
        │   ├── AuthContext.jsx   # JWT auth state
        │   └── SocketContext.jsx # Real-time data
        ├── utils/
        │   └── api.js           # Axios instance
        └── App.jsx              # Routes
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/panels` | Get all panels |
| POST | `/api/panels` | Add panel |
| PUT | `/api/panels/:id` | Update panel |
| DELETE | `/api/panels/:id` | Delete panel |
| GET | `/api/analytics/overview` | Dashboard stats |
| GET | `/api/analytics/daily?days=7` | Daily production |
| GET | `/api/analytics/panels-comparison` | Panel comparison |
| GET | `/api/alerts` | Get all alerts |
| PUT | `/api/alerts/mark-all/read` | Mark all read |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |

## 👤 Default Login
- **Email:** admin@solar.com
- **Password:** admin123
