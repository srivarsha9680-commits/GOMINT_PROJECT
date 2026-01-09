const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const authMiddleware = require('../middleware/authMiddleware'); // optional

// CREATE new business
router.post('/', authMiddleware, async (req, res) => {
  try {
    const business = new Business(req.body);
    await business.save();
    res.status(201).json(business);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all businesses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate('vendorId')
      .populate('locations')
      .populate('offers')
      .populate('bankDetails')
      .limit(200); // optional safeguard
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one business by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('vendorId')
      .populate('locations')
      .populate('offers')
      .populate('bankDetails');
    if (!business) return res.status(404).json({ error: 'Business not found' });
    res.json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE business by ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Business.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Business not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE business by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Business.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Business not found' });
    res.json({ message: 'Business deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;