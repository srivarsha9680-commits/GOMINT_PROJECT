const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  minAmount: { type: Number, required: true, min: 0 },
  maxAmount: { type: Number, required: true, min: 0 },
  cashbackPercent: { type: Number, required: true, min: 0, max: 100 },
  imageUrl: { type: String, trim: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Offer || mongoose.model('Offer', offerSchema);