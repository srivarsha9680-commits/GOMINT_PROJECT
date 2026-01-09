const express = require('express');
const router = express.Router();
const Vendor = require('../models/vendor');
const authMiddleware = require('../middleware/authMiddleware'); // optional
const multer = require('multer');
const path = require('path');

// Configure multer for logo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET /api/vendors - list all vendors
router.get('/', async (req, res) => {
  try {
    const list = await Vendor.find().limit(100);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vendors/:id - get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await Vendor.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Vendor not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vendors - create new vendor
router.post('/', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const created = await Vendor.create(req.body);
    console.log('Created vendor:', created);
    res.status(201).json(created);
  } catch (err) {
    console.log('Error creating vendor:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/vendors/:id - update vendor by ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Vendor not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/vendors/:id - delete vendor by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Vendor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;