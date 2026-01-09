const express = require('express');
const router = express.Router();
const BankDetails = require('../models/bankDetails');
const authMiddleware = require('../middleware/authMiddleware'); // optional

// Create new bank details
router.post('/', authMiddleware, async (req, res) => {
  try {
    const bankDetails = new BankDetails(req.body);
    await bankDetails.save();
    res.status(201).json(bankDetails);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all bank details
router.get('/', authMiddleware, async (req, res) => {
  try {
    const details = await BankDetails.find();
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bank details by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const details = await BankDetails.findById(req.params.id);
    if (!details) return res.status(404).json({ error: 'Bank details not found' });
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update bank details by ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await BankDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Bank details not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete bank details by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await BankDetails.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Bank details not found' });
    res.json({ message: 'Bank details deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;