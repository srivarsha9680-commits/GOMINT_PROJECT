const mongoose = require('mongoose');

// Cashback item sub-document
const cashbackItemSchema = new mongoose.Schema({
  mobile: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'rejected'],
    default: 'pending'
  }
}, { _id: false });

// Main Invoice schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  operatorName: {
    type: String,
    trim: true
  },
  operatorEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    min: 0,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  cashbackList: [cashbackItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});



// Export safely to avoid overwrite error
module.exports =
  mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);