const express = require('express');
const router = express.Router();
const Offer = require('../models/offer');
const authMiddleware = require('../middleware/authMiddleware'); // optional
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET /api/offers - list all offers
router.get('/', async (req, res) => {
  try {
    const list = await Offer.find()
      .limit(200)
      .populate('businessId')
      .populate('locationId');
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/offers/:id - get offer by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await Offer.findById(req.params.id)
      .populate('businessId')
      .populate('locationId');
    if (!doc) return res.status(404).json({ message: 'Offer not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/offers - create new offer
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (req.file) {
      req.body.imageUrl = req.file.path;
    }
    const created = await Offer.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/offers/:id - update offer by ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Offer not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/offers/:id - delete offer by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Offer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Offer not found' });
    res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;