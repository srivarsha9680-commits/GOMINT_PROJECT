const express = require('express');
const router = express.Router();
const Invoice = require('../models/invoice');
const CashbackRequest = require('../models/cashbackRequest');
const auth = require('../middleware/auth');

// GET /api/invoices
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.requestId) query.requestId = req.query.requestId;
    const list = await Invoice.find(query).limit(200);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await Invoice.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Invoice not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices
router.post('/', auth, async (req, res) => {
  try {
    const created = await Invoice.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/invoices/:id - Update invoice and sync cashback request status
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Invoice not found' });

    // THREE LANE CHECKPOINT: Sync status with cashback request if linked
    if (updated.cashbackRequestId) {
      const CashbackRequest = require('../models/cashbackRequest');

      // Map invoice payment status to cashback request status
      const statusMap = {
        'pending': 'in-process',
        'paid': 'paid',
        'failed': 'rejected'
      };

      await CashbackRequest.findByIdAndUpdate(
        updated.cashbackRequestId,
        {
          paymentStatus: updated.paymentStatus,
          requestStatus: statusMap[updated.paymentStatus] || 'in-process',
          updatedAt: new Date()
        },
        { new: true }
      );
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices/:id/cashback - push a cashback item
router.post('/:id/cashback', auth, async (req, res) => {
  try {
    const { mobile, amount } = req.body;
    if (!mobile || !amount) {
      return res.status(400).json({ message: 'Mobile and amount are required' });
    }

    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });

    inv.cashbackList.push({ mobile, amount });
    await inv.save();

    res.status(201).json(inv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;