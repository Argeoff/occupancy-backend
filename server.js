const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());

// =========================
// 🗄️ SQLITE SETUP
// =========================
const db = new sqlite3.Database("./database.db");

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS occupancy (
    id INTEGER PRIMARY KEY,
    occupied INTEGER,
    updatedAt TEXT
  )
`);

// Ensure one row exists
db.run(`
  INSERT OR IGNORE INTO occupancy (id, occupied, updatedAt)
  VALUES (1, 0, NULL)
`);

// =========================
// 🧪 TEST ENDPOINT
// =========================
app.get("/test", (req, res) => {
  res.json({ status: "ok" });
});

// =========================
// 📥 UPDATE OCCUPANCY
// =========================
app.post("/occupancy", (req, res) => {
  if (typeof req.body.occupied !== "boolean") {
    return res.status(400).json({ error: "occupied must be boolean" });
  }

  const occupied = req.body.occupied ? 1 : 0;
  const updatedAt = new Date().toISOString();

  db.run(
    `UPDATE occupancy SET occupied = ?, updatedAt = ? WHERE id = 1`,
    [occupied, updatedAt],
    function () {
      const state = {
        occupied: !!occupied,
        updatedAt
      };

      console.log("Updated:", state);

      res.json({ success: true, state });
    }
  );
});

// =========================
// 📤 GET OCCUPANCY
// =========================
app.get("/occupancy", (req, res) => {
  db.get(`SELECT * FROM occupancy WHERE id = 1`, (err, row) => {
    if (err) {
      return res.status(500).json({ error: "DB error" });
    }

    res.json({
      occupied: row.occupied === 1,
      updatedAt: row.updatedAt
    });
  });
});

// =========================
// 🚀 START SERVER
// =========================
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});