const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  address: { type: String, trim: true },
  country: { type: String, trim: true }
}, { _id: false });

const vendorSchema = new mongoose.Schema({
  businessName: { type: String, required: true, trim: true },
  currency: { type: String, required: true, trim: true },   // matches <selectCurrency>
  address: { type: String, required: true, trim: true },    // matches <textarea id="address">
  country: { type: String, required: true, trim: true },    // matches <selectCountry>
  logo: { type: String, trim: true },                       // file upload (store path or URL)
  locations: [locationSchema],                              // optional, can expand later
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);