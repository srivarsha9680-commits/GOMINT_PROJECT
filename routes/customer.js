const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/customer');

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const list = await Customer.find().limit(100);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    // First try to find by customer ID
    let doc = await Customer.findById(req.params.id);

    // If not found, try to find by userId (for profile page that uses user ID)
    if (!doc) {
      doc = await Customer.findOne({ userId: req.params.id });
    }

    if (!doc) return res.status(404).json({ message: 'Customer not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers
router.post(
  '/',
  body('email').isEmail().optional({ nullable: true }),
  body('mobile').isString().optional({ nullable: true }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) return res.status(400).json({ errors: err.array() });

    try {
      const payload = req.body;
      const created = await Customer.create(payload);
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// PUT /api/customers/:id
router.put(
  '/:id',
  body('email').isEmail().optional({ nullable: true }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) return res.status(400).json({ errors: err.array() });

    try {
      // First try to update by customer ID
      let updated = await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: false }
      );

      // If not found, try to update by userId (for profile page that uses user ID)
      if (!updated) {
        updated = await Customer.findOneAndUpdate(
          { userId: req.params.id },
          req.body,
          { new: true, runValidators: false }
        );
      }

      if (!updated) return res.status(404).json({ message: 'Customer not found' });
      res.json(updated);
    } catch (err) {
      // Handle duplicate key errors gracefully
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({ error: `${field} already in use by another customer` });
      }
      res.status(400).json({ error: err.message });
    }
  }
);

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;