const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const mongoose = require('mongoose');

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Database Connection ----------
async function connectMongo() {
  try {
    if (!process.env.MONGO_URL) {
      console.warn("⚠ No MONGO_URL in .env — skipping MongoDB connection.");
      return;
    }

    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}

connectMongo();

// ---------- Static Files ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Auto-load Routes ----------
const routesPath = path.join(__dirname, 'routes');

if (fs.existsSync(routesPath)) {
  fs.readdirSync(routesPath).forEach(file => {
    if (file.endsWith('.js')) {
      const route = require(path.join(routesPath, file));
      app.use('/api/' + file.replace('.js', ''), route);
      console.log(`✔ Route loaded: /api/${file.replace('.js', '')}`);
    }
  });
} else {
  console.log("⚠ No routes directory found.");
}

// ---------- Health Check ----------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running' });
});

module.exports = app;