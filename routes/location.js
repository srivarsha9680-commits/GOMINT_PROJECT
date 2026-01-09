const express = require('express');
const router = express.Router();
const Location = require('../models/location');
const authMiddleware = require('../middleware/authMiddleware'); // optional

// CREATE new location
router.post('/', authMiddleware, async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    res.status(201).json(location);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all locations
router.get('/', async (req, res) => {
  try {
    const { businessId } = req.query;
    let query = {};
    if (businessId) query.vendorId = businessId;
    const locations = await Location.find(query).limit(200);
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one location by ID
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE location by ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Location not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE location by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Location.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Location not found' });
    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;