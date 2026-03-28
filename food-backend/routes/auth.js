const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING user_id',
      [name, email, hashedPassword]
    );
    const token = jwt.sign({ user_id: result.rows[0].user_id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { user_id: result.rows[0].user_id, name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ user_id: user.rows[0].user_id }, process.env.JWT_SECRET);
    res.json({ token, user: { user_id: user.rows[0].user_id, name: user.rows[0].name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;