const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Place order
router.post('/', auth, async (req, res) => {
  const { items } = req.body;
  const userId = req.user.user_id;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    let total = 0;
    for (const item of items) {
      const menuItem = await client.query('SELECT price FROM menu_items WHERE item_id = $1', [item.itemId]);
      if (menuItem.rows.length === 0) throw new Error(`Item ${item.itemId} not found`);
      total += menuItem.rows[0].price * item.quantity;
    }
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING order_id',
      [userId, total]
    );
    const orderId = orderResult.rows[0].order_id;
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, item_id, quantity) VALUES ($1, $2, $3)',
        [orderId, item.itemId, item.quantity]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ orderId, total });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Get order history
router.get('/history', auth, async (req, res) => {
  const userId = req.user.user_id;
  try {
    const orders = await db.query(
      `SELECT o.order_id, o.total_amount, o.status, o.created_at,
              json_agg(json_build_object('item_id', oi.item_id, 'quantity', oi.quantity, 'name', mi.name, 'price', mi.price)) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       LEFT JOIN menu_items mi ON oi.item_id = mi.item_id
       WHERE o.user_id = $1
       GROUP BY o.order_id
       ORDER BY o.created_at DESC`,
      [userId]
    );
    res.json(orders.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
router.patch('/:orderId/status', auth, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const validStatuses = ['placed', 'preparing', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    await db.query('UPDATE orders SET status = $1 WHERE order_id = $2', [status, orderId]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;