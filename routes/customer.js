const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/customer');

// In-memory storage as fallback
let customersCache = {};

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const list = await Customer.find().limit(100);
    res.json(list);
  } catch (err) {
    console.log('DB Error:', err.message);
    // Fallback to in-memory cache
    res.json(Object.values(customersCache));
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
    // Fallback to cache
    if (customersCache[req.params.id]) {
      return res.json(customersCache[req.params.id]);
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/customers received:', req.body);

    const { mobile, country } = req.body;

    if (!mobile) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // First check in-memory cache
    for (let id in customersCache) {
      if (customersCache[id].mobile === mobile) {
        console.log('Customer exists in cache:', id);
        return res.status(200).json(customersCache[id]);
      }
    }

    // Try to find existing customer in MongoDB
    try {
      const existing = await Promise.race([
        Customer.findOne({ mobile: mobile }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
      if (existing) {
        customersCache[existing._id] = existing;
        console.log('Found existing customer in MongoDB:', existing._id);
        return res.status(200).json(existing);
      }
    } catch (dbErr) {
      console.log('MongoDB search error/timeout:', dbErr.message);
    }

    // Try MongoDB with timeout - if it times out, use fallback
    let created = null;
    try {
      const payload = { mobile, country, firstName: '', lastName: '', email: '' };
      created = await Promise.race([
        Customer.create(payload),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
      customersCache[created._id] = created;
      console.log('Created in MongoDB:', created._id);
      return res.status(201).json(created);
    } catch (dbErr) {
      // Handle duplicate key error - return existing customer
      if (dbErr.code === 11000) {
        console.log('Duplicate key error - trying to find existing customer');
        try {
          const existing = await Promise.race([
            Customer.findOne({ mobile: mobile }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
          ]);
          if (existing) {
            customersCache[existing._id] = existing;
            console.log('Found existing customer after duplicate error:', existing._id);
            return res.status(200).json(existing);
          }
        } catch (findErr) {
          console.log('Failed to find existing customer:', findErr.message);
        }
      }
      console.log('MongoDB create error/timeout:', dbErr.message);
    }

    // Fallback: Create customer in memory
    const id = 'cust_' + Date.now();
    const customer = {
      _id: id,
      mobile: mobile,
      country: country,
      firstName: '',
      lastName: '',
      email: ''
    };
    customersCache[id] = customer;
    console.log('Created in memory cache:', id);
    return res.status(201).json(customer);
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: 'Failed to process login. Please try again.' });
  }
});

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
      customersCache[updated._id] = updated;
      res.json(updated);
    } catch (err) {
      // Handle duplicate key errors gracefully
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({ error: `${field} already in use by another customer` });
      }
      console.log('DB Error on PUT:', err.message);
      // Fallback: Update in memory
      if (customersCache[req.params.id]) {
        const updated = { ...customersCache[req.params.id], ...req.body };
        customersCache[req.params.id] = updated;
        return res.json(updated);
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