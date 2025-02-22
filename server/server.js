const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Allow JSON request bodies

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Game move route (example)
app.post("/move", (req, res) => {
  const { player, choice } = req.body;
  res.json({ message: `Player ${player} chose ${choice}` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from the Render backend!" });
  });
  