const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM restaurants');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get menu items for a restaurant
router.get('/:restaurantId/menu', async (req, res) => {
  const { restaurantId } = req.params;
  try {
    const result = await db.query('SELECT * FROM menu_items WHERE restaurant_id = $1', [restaurantId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;