const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Allow requests from the frontend (Vercel)
app.use(cors({
  origin: 'https://the-trust-game.vercel.app', // Change this to your frontend URL
  methods: 'GET, POST',
}));

app.use(express.json()); // Allow JSON request bodies

// Helper function to execute queries
const queryDatabase = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const res = await client.query(query, params);
    return res.rows;
  } finally {
    client.release();
  }
};

// Create Users Table if it doesn't exist
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `;
  await queryDatabase(query);
};

// Create Visitor Table (Optional, but can be used for visitor tracking)
const createVisitorTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS visitors (
      id SERIAL PRIMARY KEY,
      count INT NOT NULL
    )
  `;
  await queryDatabase(query);
};

// Initialize tables
createUsersTable();
createVisitorTable();

// Register User
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const userCheckQuery = 'SELECT * FROM users WHERE email = $1 OR username = $2';
  const existingUser = await queryDatabase(userCheckQuery, [email, username]);

  if (existingUser.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *';
  const newUser = await queryDatabase(query, [username, email, hashedPassword]);

  res.status(201).json({ message: "User registered successfully", user: newUser[0] });
});

// Login User
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = $1';
  const user = await queryDatabase(query, [email]);

  if (user.length === 0) {
    return res.status(400).json({ message: "User not found" });
  }

  const validPassword = await bcrypt.compare(password, user[0].password);
  if (!validPassword) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ message: "Login successful", token });
});

// Track Visitors
let visitorCount = 0;
app.use(async (req, res, next) => {
  visitorCount++;
  const query = 'INSERT INTO visitors (count) VALUES ($1)';
  await queryDatabase(query, [visitorCount]);
  next();
});

// Get Visitor Count
app.get("/api/visitorCount", async (req, res) => {
  const query = 'SELECT count FROM visitors ORDER BY id DESC LIMIT 1';
  const result = await queryDatabase(query);
  const count = result.length > 0 ? result[0].count : 0;
  res.json({ visitorCount: count });
});

// Test Route
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


