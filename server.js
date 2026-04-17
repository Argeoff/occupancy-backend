const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.options("*", cors()); // handles preflight
app.use(express.json());

// current room state
let state = {
 occupied: false,
 updatedAt: null
};

// test endpoint (for checking network)
app.get("/test", (req, res) => {
 res.json({ status: "ok" });
});

// Home Assistant sends updates here
app.post("/occupancy", (req, res) => {
 state.occupied = req.body.occupied;
 state.updatedAt = new Date().toISOString();

 console.log("Updated:", state);

 res.json({ success: true, state });
});

// frontend reads here
app.get("/occupancy", (req, res) => {
 res.json(state);
});

app.listen(process.env.PORT || 3000, () => {
 console.log("Server running");
});
