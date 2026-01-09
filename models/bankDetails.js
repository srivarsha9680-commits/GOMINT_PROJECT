const mongoose = require('mongoose');

// SAFE-LOAD: Prevent "Cannot overwrite model" error
if (mongoose.models.BankDetails) {
  module.exports = mongoose.model('BankDetails');
  return;
}

const bankDetailsSchema = new mongoose.Schema({
  accountHolder: { type: String, trim: true },
  accountNumber: { type: String, required: true, unique: true, trim: true },
  ifsc: { type: String, required: true, uppercase: true, trim: true },
  bankName: { type: String, trim: true },
  branchName: { type: String, trim: true },
  branchAddress: { type: String, trim: true },
  country: { type: String, trim: true },
  state: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for faster lookups
bankDetailsSchema.index({ accountNumber: 1 });
bankDetailsSchema.index({ ifsc: 1 });

module.exports = mongoose.model('BankDetails', bankDetailsSchema);