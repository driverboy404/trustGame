require("dotenv").config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Middleware
app.use(express.json());

app.use(cors({
  origin: 'https://the-trust-game.vercel.app',  // Replace with your actual frontend URL
  methods: 'GET,POST',  // Define methods if needed
}));


// Connect to SQLite Database
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database.");
});

// Create Users Table
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`
);



// Initialize visitorCount
let visitorCount = 0;  // Define the visitor count and initialize it

// Allow requests from Vercel frontend


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

// Visitor count route
app.get("/api/visitorCount", (req, res) => {
    res.json({ visitorCount: 99 });
});

app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
});


app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if username or email exists
  db.get("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], async (err, user) => {
    if (user) return res.status(400).json({ error: "Username or email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword], (err) => {
      if (err) return res.status(500).json({ error: "Error registering user" });
      res.status(201).json({ message: "User registered successfully!" });
    });
  });
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (!user) return res.status(400).json({ error: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});


const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// Protected Route Example
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "You have access!", user: req.user });
});

