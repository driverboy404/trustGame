const cors = require('cors');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from Vercel frontend
app.use(cors({
  origin: 'https://the-trust-game.vercel.app',  // Replace with your actual frontend URL
  methods: 'GET,POST',  // Define methods if needed
}));

app.use(express.json()); // Allow JSON request bodies

// Test route
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the Render backend!" });
});


// Middleware to count visitors
app.use((req, res, next) => {
    visitorCount++;  // Increment on each request
    res.on('finish', () => {
      visitorCount--;  // Decrement when the response is sent
    });
    next();
  });
  
  // Test route
  app.get("/api/visitorCount", (req, res) => {
    res.json({ visitorCount });
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  