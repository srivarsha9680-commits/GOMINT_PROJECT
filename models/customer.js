const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    unique: true,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  bankDetails: {
    acctHolder: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    acctNumber: {
      type: String,
      trim: true
    },
    ifsc: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    lastUpdated: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


// Export safely (prevents overwrite errors)
module.exports =
  mongoose.models.Customer || mongoose.model('Customer', customerSchema);