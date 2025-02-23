const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Store logged-in users in memory (for simplicity)
let loggedInUsers = [];

// Allow requests from the frontend (Vercel)
const corsOptions = {
  origin: "https://the-trust-game.vercel.app", // Allow only this domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
  credentials: true, // Allow cookies (for session or authentication)
};

// Enable CORS with the specified options
app.use(cors(corsOptions));

app.use(express.json()); // Allow JSON request bodies
app.use(cookieParser()); // To parse cookies

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

// Initialize tables
createUsersTable();

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

  // Create JWT Token
  const token = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Set JWT token as a cookie
  res.cookie("authToken", token, {
    httpOnly: true,  // Makes the cookie inaccessible to JavaScript
    secure: process.env.NODE_ENV === "production", // Only send the cookie over HTTPS
    maxAge: 3600 * 1000,  // 1 hour expiration
    sameSite: 'None', // For cross-origin requests
  });

  // Store the user as logged in
  loggedInUsers.push(user[0].username); // Store the username in the loggedInUsers array

  res.status(200).json({ message: "Login successful" });
});

// Middleware to verify JWT from cookies
const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Get Logged-in Users (Display all currently logged-in users)
app.get("/loggedInUsers", verifyToken, (req, res) => {
  res.status(200).json({ loggedInUsers });
});

// Test Route
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/currentUser', (req, res) => {
  if (req.cookies.authToken) {
    jwt.verify(req.cookies.authToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      // Return user info from decoded JWT or database
      const user = { username: decoded.username, userId: decoded.userId }; // Example
      return res.json({ user });
    });
  } else {
    return res.json({ user: null }); // No user logged in
  }
});


// Logout User
app.post("/logout", verifyToken, (req, res) => {
  // Remove the authToken cookie
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only send the cookie over HTTPS
    sameSite: 'None', // For cross-origin requests
  });

  // Remove the user from the loggedInUsers array
  loggedInUsers = loggedInUsers.filter(user => user !== req.userId);

  res.status(200).json({ message: "Logout successful" });
});
