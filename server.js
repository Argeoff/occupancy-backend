const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();

// ======================
// Middleware
// ======================
app.use(cors());
app.options("*", cors());
app.use(express.json());

// ======================
// SQLite setup
// ======================
const db = new Database("database.db");

// Create table
db.prepare(`
  CREATE TABLE IF NOT EXISTS occupancy (
    id INTEGER PRIMARY KEY,
    occupied INTEGER,
    updatedAt TEXT
  )
`).run();

// Ensure single row exists
db.prepare(`
  INSERT OR IGNORE INTO occupancy (id, occupied, updatedAt)
  VALUES (1, 0, NULL)
`).run();

// ======================
// Test endpoint
// ======================
app.get("/test", (req, res) => {
  res.json({ status: "ok" });
});

// ======================
// GET occupancy
// ======================
app.get("/occupancy", (req, res) => {
  const row = db.prepare(`
    SELECT * FROM occupancy WHERE id = 1
  `).get();

  res.json({
    occupied: row.occupied === 1,
    updatedAt: row.updatedAt
  });
});

// ======================
// POST occupancy update
// ======================
app.post("/occupancy", (req, res) => {
  if (typeof req.body.occupied !== "boolean") {
    return res.status(400).json({ error: "occupied must be boolean" });
  }

  const occupied = req.body.occupied ? 1 : 0;
  const updatedAt = new Date().toISOString();

  db.prepare(`
    UPDATE occupancy
    SET occupied = ?, updatedAt = ?
    WHERE id = 1
  `).run(occupied, updatedAt);

  console.log("Updated:", { occupied: !!occupied, updatedAt });

  res.json({
    success: true,
    state: { occupied: !!occupied, updatedAt }
  });
});

// ======================
// Start server
// ======================
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});