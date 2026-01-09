const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  name: String,
  address: String,
  city: String,
  state: String,
  country: String,
  postalCode: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

// This ensures the model is not redefined if already loaded
module.exports = mongoose.models.Location || mongoose.model('Location', locationSchema);