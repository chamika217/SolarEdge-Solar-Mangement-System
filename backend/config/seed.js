const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Panel = require('../models/Panel');
const Alert = require('../models/Alert');
const Settings = require('../models/Settings');
const EnergyReading = require('../models/EnergyReading');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  await Promise.all([User.deleteMany(), Panel.deleteMany(), Alert.deleteMany(), Settings.deleteMany(), EnergyReading.deleteMany()]);
  console.log('Cleared existing data...');

  // Create admin + viewer users
  await User.create([
    { name: 'Admin User', email: 'admin@solar.com', password: 'admin123', role: 'admin' },
    { name: 'Chamika Viewer', email: 'user@solar.com', password: 'user123', role: 'viewer' }
  ]);
  console.log('Users created:');
  console.log('  Admin  → admin@solar.com / admin123');
  console.log('  Viewer → user@solar.com  / user123');

  // Create panels
  const panelDefs = [
    { name: 'Array A — Row 1', arrayGroup: 'Array A', capacity: 400, status: 'online' },
    { name: 'Array A — Row 2', arrayGroup: 'Array A', capacity: 400, status: 'online' },
    { name: 'Array A — Row 3', arrayGroup: 'Array A', capacity: 400, status: 'online' },
    { name: 'Array A — Row 4', arrayGroup: 'Array A', capacity: 400, status: 'online' },
    { name: 'Array B — Row 1', arrayGroup: 'Array B', capacity: 400, status: 'warning' },
    { name: 'Array B — Row 2', arrayGroup: 'Array B', capacity: 400, status: 'online' },
    { name: 'Array B — Row 3', arrayGroup: 'Array B', capacity: 400, status: 'offline' },
    { name: 'Array B — Row 4', arrayGroup: 'Array B', capacity: 400, status: 'online' },
    { name: 'Array C — Row 1', arrayGroup: 'Array C', capacity: 400, status: 'online' },
    { name: 'Array C — Row 2', arrayGroup: 'Array C', capacity: 400, status: 'online' },
  ];
  const panels = await Panel.insertMany(panelDefs);
  console.log(`${panels.length} panels created`);

  // Seed 7 days of hourly readings
  const readings = [];
  const now = new Date();
  for (let day = 6; day >= 0; day--) {
    for (let hour = 6; hour <= 18; hour++) {
      const ts = new Date(now);
      ts.setDate(ts.getDate() - day);
      ts.setHours(hour, 0, 0, 0);
      const sunFactor = Math.max(0, Math.sin((hour - 6) * Math.PI / 12));
      for (const panel of panels) {
        if (panel.status === 'offline') continue;
        const base = panel.capacity * sunFactor * (0.7 + Math.random() * 0.25);
        const output = Math.round(panel.status === 'warning' ? base * 0.5 : base);
        readings.push({
          panel: panel._id,
          output,
          efficiency: Math.round((output / panel.capacity) * 100),
          temperature: Math.round(35 + Math.random() * 15),
          voltage: Math.round(380 + Math.random() * 40),
          current: Math.round((output / 400) * 10) / 10,
          irradiance: Math.round(sunFactor * 1000),
          timestamp: ts
        });
      }
    }
  }
  await EnergyReading.insertMany(readings);
  console.log(`${readings.length} energy readings seeded`);

  await Alert.insertMany([
    { type: 'critical', category: 'offline', message: 'Panel Array B — Row 3 is offline', panel: panels[6]._id, isRead: false },
    { type: 'warning', category: 'efficiency', message: 'Panel Array B — Row 1 efficiency dropped below 60%', panel: panels[4]._id, isRead: false },
    { type: 'warning', category: 'temperature', message: 'Inverter temperature above threshold (78°C)', isRead: false },
    { type: 'resolved', category: 'system', message: 'System came back online after maintenance', isRead: true, isResolved: true },
    { type: 'info', category: 'system', message: 'Low irradiance forecast — production may be reduced', isRead: true }
  ]);

  await Settings.create({ systemName: 'SolarEdge Pro', electricityRate: 0.20 });

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin Login  → admin@solar.com / admin123');
  console.log('User Login   → user@solar.com  / user123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
