const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize Database
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_id TEXT UNIQUE NOT NULL,
    items TEXT NOT NULL,
    total_amount REAL NOT NULL,
    payment_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
});

// Initialize Razorpay - Validate environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('ERROR: Razorpay credentials not found in environment variables!');
  console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
  process.exit(1);
}

if (RAZORPAY_KEY_SECRET === 'your_secret_key_here' || RAZORPAY_KEY_ID.includes('test_') && RAZORPAY_KEY_SECRET.length < 20) {
  console.warn('WARNING: Razorpay credentials appear to be placeholder values. Please update your .env file with actual keys.');
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// ==================== AUTH ROUTES ====================

// Signup - Fixed error handling and race condition
app.post('/api/signup', (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  // Use promise-based approach to properly handle async errors
  new Promise((resolve, reject) => {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        reject(new Error('Database error'));
        return;
      }
      if (user) {
        reject(new Error('User already exists'));
        return;
      }
      resolve();
    });
  })
    .then(() => {
      // Hash password
      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      // Insert user - handle UNIQUE constraint violation
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
          [name, email, phone, hashedPassword],
          function(err) {
            if (err) {
              // Check for UNIQUE constraint violation (SQLITE_CONSTRAINT)
              if (err.code === 'SQLITE_CONSTRAINT' || err.message.includes('UNIQUE')) {
                reject(new Error('User already exists'));
              } else {
                reject(new Error('Failed to create user'));
              }
              return;
            }
            resolve({
              id: this.lastID,
              name,
              email,
              phone
            });
          }
        );
      });
    })
    .then((user) => {
      res.json({
        success: true,
        message: 'User created successfully',
        user
      });
    })
    .catch((error) => {
      console.error('Signup error:', error);
      if (error.message === 'User already exists') {
        res.status(400).json({ error: 'User already exists' });
      } else if (error.message === 'Database error') {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.status(500).json({ error: error.message || 'Failed to create user' });
      }
    });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  });
});

// ==================== PAYMENT ROUTES ====================

// Create Razorpay Order
app.post('/api/create-order', (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    receipt: `receipt_${Date.now()}`
  };

  razorpay.orders.create(options, (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create order' });
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  });
});

// Verify Payment - Fixed authentication and signature verification
app.post('/api/verify-payment', (req, res) => {
  const { orderId, paymentId, signature, userId, userEmail, items, totalAmount } = req.body;

  // Validate required fields
  if (!orderId || !paymentId || !signature || !userId || !userEmail || !items || !totalAmount) {
    return res.status(400).json({ error: 'Missing required payment verification fields' });
  }

  // Verify user identity - validate userId matches the email provided
  db.get('SELECT id, email FROM users WHERE id = ? AND email = ?', [userId, userEmail], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error during user validation' });
    }

    if (!user) {
      return res.status(403).json({ error: 'Unauthorized: User ID and email do not match' });
    }

    // Verify payment signature using the actual Razorpay secret key
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      console.error('Payment signature verification failed', {
        expected: generatedSignature,
        received: signature,
        orderId,
        paymentId
      });
      return res.status(400).json({ error: 'Payment verification failed: Invalid signature' });
    }

    // Generate unique order ID
    const uniqueOrderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Save order to database
    db.run(
      'INSERT INTO orders (user_id, order_id, items, total_amount, payment_id, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, uniqueOrderId, JSON.stringify(items), totalAmount, paymentId, 'completed'],
      function(err) {
        if (err) {
          console.error('Failed to save order:', err);
          return res.status(500).json({ error: 'Failed to save order' });
        }

        res.json({
          success: true,
          message: 'Payment verified and order saved',
          orderId: uniqueOrderId,
          orderDbId: this.lastID
        });
      }
    );
  });
});

// Get Razorpay Key ID (for frontend)
app.get('/api/razorpay-key', (req, res) => {
  res.json({ keyId: RAZORPAY_KEY_ID });
});

// Get User Orders - Fixed to require authentication
app.get('/api/orders/:userId', (req, res) => {
  const { userId } = req.params;
  const { userEmail } = req.query; // Require email for validation

  if (!userEmail) {
    return res.status(400).json({ error: 'User email required for authentication' });
  }

  // Validate user exists and matches
  db.get('SELECT id FROM users WHERE id = ? AND email = ?', [userId, userEmail], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(403).json({ error: 'Unauthorized: Invalid user credentials' });
    }

    db.all(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
      (err, orders) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ success: true, orders });
      }
    );
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

